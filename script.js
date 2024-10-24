// Массив для хранения нераспознанных вопросов
let unansweredQuestions = [];

// Функция для воспроизведения приветственного сообщения
function speakWelcomeMessage() {
    const welcomeMessage = new Audio("audio/welcome_message.mp3");
    welcomeMessage.play();

    welcomeMessage.onplay = () => {
        document.getElementById('avatar').classList.add("talking");
        startMouthMovement(); // Начинаем анимацию рта
    };

    welcomeMessage.onended = () => {
        document.getElementById('avatar').classList.remove("talking");
        stopMouthMovement(); // Останавливаем анимацию рта
    };
}

// Функция для воспроизведения аудиофайлов
function playAudioResponse(audioSrc) {
    const audio = new Audio(audioSrc);
    audio.play();

    audio.onplay = () => {
        document.getElementById('avatar').classList.add("talking");
        startMouthMovement();
    };

    audio.onended = () => {
        document.getElementById('avatar').classList.remove("talking");
        stopMouthMovement();
    };
}

// Функция для переключения между открытым и закрытым ртом
function startMouthMovement() {
    const avatar = document.getElementById('avatar');
    let isMouthOpen = false;

    avatar.mouthInterval = setInterval(() => {
        avatar.src = isMouthOpen ? 'avatar_closed.png' : 'avatar_open.png';
        isMouthOpen = !isMouthOpen;
    }, 200);
}

function stopMouthMovement() {
    const avatar = document.getElementById('avatar');
    clearInterval(avatar.mouthInterval);
    avatar.src = 'avatar_closed.png'; // Устанавливаем закрытый рот после окончания речи
}

// Функция для обработки ключевых слов в вопросах
function getPredefinedAnswer(question) {
    let audioSrc;

    // Пример ключевых слов для поиска
    if (question.includes("тебя") && question.includes("зовут")) {
        audioSrc = "audio/answer_name.mp3"; // Аудиофайл с ответом на вопрос "Как тебя зовут?"
    } else if (question.includes("сколько") && question.includes("лет")) {
        audioSrc = "audio/answer_age.mp3"; // Ответ на вопрос "Сколько тебе лет?"
    } else if (question.includes("что") && question.includes("умеешь")) {
        audioSrc = "audio/answer_skills.mp3"; // Ответ на вопрос "Что ты умеешь?"
    } else if (question.includes("скачать") && question.includes("вопросы")) {
        downloadQuestionsAsFile(); // Запускаем скачивание нераспознанных вопросов
        return; // Выходим из функции, так как скачивание — это действие
    } else if (question.includes("начать")) {
        speakWelcomeMessage(); // Приветствие по команде "Начать"
        return;
    } else {
        audioSrc = "audio/unknown.mp3"; // Ответ для неизвестного вопроса
        unansweredQuestions.push({ question: question, date: new Date().toISOString() }); // Сохраняем нераспознанный вопрос
    }

    playAudioResponse(audioSrc); // Воспроизводим аудиофайл
}

// Функция для скачивания нераспознанных вопросов в формате JSON
function downloadQuestionsAsFile() {
    if (unansweredQuestions.length === 0) {
        alert('Нет нераспознанных вопросов для скачивания.');
        return;
    }

    const data = JSON.stringify(unansweredQuestions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unanswered_questions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Функция для настройки распознавания речи
function setupSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Ваш браузер не поддерживает распознавание речи');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ru-RU'; // Устанавливаем язык
    recognition.continuous = true; // Постоянное прослушивание
    recognition.interimResults = false; // Только окончательные результаты

    recognition.onstart = function() {
        console.log("Ассистент слушает...");
        const avatar = document.getElementById('avatar');
        avatar.classList.add("blinking");
    };

    recognition.onresult = function(event) {
        const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
        console.log("Вы сказали:", transcript);
        getPredefinedAnswer(transcript); // Обрабатываем и возвращаем заранее заданный ответ
    };

    recognition.onerror = function(event) {
        console.error("Ошибка распознавания:", event.error);
        if (event.error === 'network' || event.error === 'no-speech') {
            recognition.stop();
            startRecognitionSafely();
        }
    };

    recognition.onend = function() {
        console.log("Распознавание завершено, перезапуск...");
        startRecognitionSafely(); // Перезапуск, если процесс завершен
    };

    recognition.start();
}

function startRecognitionSafely() {
    if (recognition && recognition.state !== 'listening') {
        recognition.start(); // Запускаем только если распознавание не запущено
    }
}

// Автоматический запуск распознавания речи при загрузке страницы
window.onload = function() {
    setupSpeechRecognition(); // Запускаем распознавание речи при загрузке
};

// Добавляем обработчик на кнопку для скачивания нераспознанных вопросов
document.getElementById('download-btn').addEventListener('click', downloadQuestionsAsFile);

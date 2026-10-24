
const questions = [
    {
        category: "HTML",
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Text Machine Language",
            "Hyperlinks and Text Markup Language",
            "Home Tool Markup Language"
        ],
        answer: 0
    },
    {
        category: "CSS",
        question: "Which CSS property changes the text color?",
        options: ["font-style", "text-color", "color", "background-color"],
        answer: 2
    },
    {
        category: "JavaScript",
        question: "Which keyword declares a variable that can be reassigned?",
        options: ["constant", "let", "static", "define"],
        answer: 1
    },
    {
        category: "JavaScript",
        question: "Which method selects an element by its ID?",
        options: [
            "document.querySelectorAll()",
            "document.getElementById()",
            "document.getElementsByClassName()",
            "document.createElement()"
        ],
        answer: 1
    },
    {
        category: "HTML",
        question: "Which HTML tag creates a hyperlink?",
        options: ["<link>", "<href>", "<a>", "<url>"],
        answer: 2
    },
    {
        category: "CSS",
        question: "Which CSS layout system is designed for one-dimensional layouts?",
        options: ["Grid", "Flexbox", "Float", "Position"],
        answer: 1
    },
    {
        category: "JavaScript",
        question: "Which method adds an item to the end of an array?",
        options: ["shift()", "pop()", "push()", "slice()"],
        answer: 2
    },
    {
        category: "Web Development",
        question: "What does DOM stand for?",
        options: [
            "Document Object Model",
            "Data Object Management",
            "Digital Ordinance Model",
            "Document Orientation Method"
        ],
        answer: 0
    },
    {
        category: "JavaScript",
        question: "Which event occurs when a user clicks an HTML element?",
        options: ["change", "hover", "submit", "click"],
        answer: 3
    },
    {
        category: "Web Development",
        question: "Which HTTP status code generally means a successful request?",
        options: ["404", "500", "200", "301"],
        answer: 2
    }
];

// DOM elements
const welcomeScreen = document.getElementById("welcomeScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const startButton = document.getElementById("startButton");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");

const questionInfo = document.getElementById("questionInfo");
const questionNumber = document.getElementById("questionNumber");
const totalQuestions = document.getElementById("totalQuestions");
const currentScore = document.getElementById("currentScore");

const progressTrack = document.getElementById("progressTrack");
const progressFill = document.getElementById("progressFill");

const timerDisplay = document.getElementById("timerDisplay");
const timerValue = document.getElementById("timerValue");

const questionCategory = document.getElementById("questionCategory");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const feedbackMessage = document.getElementById("feedbackMessage");
const footerHint = document.getElementById("footerHint");

const resultIcon = document.getElementById("resultIcon");
const resultHeading = document.getElementById("resultHeading");
const resultDescription = document.getElementById("resultDescription");
const finalScore = document.getElementById("finalScore");
const scoreDivider = document.getElementById("scoreDivider");
const resultProgressFill = document.getElementById("resultProgressFill");
const resultPercentage = document.getElementById("resultPercentage");
const correctAnswers = document.getElementById("correctAnswers");
const incorrectAnswers = document.getElementById("incorrectAnswers");
const bestScore = document.getElementById("bestScore");

// Quiz settings
const QUESTION_TIME = 15;
const BEST_SCORE_KEY = "quizmaster_best_score_v1";

let currentQuestionIndex = 0;
let score = 0;
let correctCount = 0;
let incorrectCount = 0;
let timeLeft = QUESTION_TIME;
let timerInterval = null;
let answerLocked = false;

// Display initial information
questionInfo.textContent = `${questions.length} Questions`;
totalQuestions.textContent = questions.length;
progressTrack.setAttribute("aria-valuemax", questions.length);

// Safely read the saved best score
function getBestScore() {
    try {
        const savedScore = Number(localStorage.getItem(BEST_SCORE_KEY));
        return Number.isFinite(savedScore) && savedScore >= 0
            ? savedScore
            : 0;
    } catch (error) {
        return 0;
    }
}

// Start or restart the quiz
function startQuiz() {
    clearInterval(timerInterval);

    currentQuestionIndex = 0;
    score = 0;
    correctCount = 0;
    incorrectCount = 0;
    timeLeft = QUESTION_TIME;
    answerLocked = false;

    currentScore.textContent = score;

    welcomeScreen.hidden = true;
    resultScreen.hidden = true;
    quizScreen.hidden = false;

    showQuestion();
}

// Render the current question and options
function showQuestion() {
    clearInterval(timerInterval);

    answerLocked = false;

    const currentQuestion = questions[currentQuestionIndex];

    questionNumber.textContent = String(currentQuestionIndex + 1).padStart(2, "0");
    totalQuestions.textContent = questions.length;
    currentScore.textContent = score;

    questionCategory.textContent = currentQuestion.category.toUpperCase();
    questionText.textContent = currentQuestion.question;

    optionsContainer.replaceChildren();

    feedbackMessage.textContent = "";
    feedbackMessage.className = "feedback-message";

    footerHint.textContent = "Select the correct answer";

    nextButton.disabled = true;
    nextButton.innerHTML =
        currentQuestionIndex === questions.length - 1
            ? 'See Results <span aria-hidden="true">→</span>'
            : 'Next Question <span aria-hidden="true">→</span>';

    const progress = (currentQuestionIndex / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressTrack.setAttribute("aria-valuenow", currentQuestionIndex);

    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-button";

        const letter = document.createElement("span");
        letter.className = "option-letter";
        letter.textContent = String.fromCharCode(65 + index);

        const optionText = document.createElement("span");
        optionText.className = "option-text";
        optionText.textContent = option;

        button.append(letter, optionText);

        button.addEventListener("click", () => {
            selectAnswer(index);
        });

        optionsContainer.appendChild(button);
    });

    startTimer();
}

// Start the countdown for each question
function startTimer() {
    clearInterval(timerInterval);

    timeLeft = QUESTION_TIME;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

// Update timer text and warning style
function updateTimerDisplay() {
    timerValue.textContent = timeLeft;
    timerDisplay.setAttribute(
        "aria-label",
        `${timeLeft} seconds remaining`
    );

    timerDisplay.classList.toggle("warning", timeLeft <= 5);
}

// Handle a selected answer
function selectAnswer(selectedIndex) {
    if (answerLocked) return;

    answerLocked = true;
    clearInterval(timerInterval);

    const currentQuestion = questions[currentQuestionIndex];
    const optionButtons = optionsContainer.querySelectorAll(".option-button");
    const isCorrect = selectedIndex === currentQuestion.answer;

    optionButtons.forEach((button, index) => {
        button.disabled = true;

        if (index === currentQuestion.answer) {
            button.classList.add("correct");
        }

        if (index === selectedIndex && !isCorrect) {
            button.classList.add("incorrect");
        }
    });

    if (isCorrect) {
        score++;
        correctCount++;

        feedbackMessage.textContent = "✓ Correct answer! Well done!";
        feedbackMessage.classList.add("success");
        footerHint.textContent = "Great job! Ready for the next question?";
    } else {
        incorrectCount++;

        feedbackMessage.textContent =
            `✕ Not quite! Correct answer: ${currentQuestion.options[currentQuestion.answer]}`;

        feedbackMessage.classList.add("error");
        footerHint.textContent = "Keep going! You can do this.";
    }

    currentScore.textContent = score;
    progressFill.style.width =
        `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        currentQuestionIndex + 1
    );

    nextButton.disabled = false;
}

// Handle a question when its timer expires
function handleTimeout() {
    if (answerLocked) return;

    answerLocked = true;

    const currentQuestion = questions[currentQuestionIndex];
    const optionButtons = optionsContainer.querySelectorAll(".option-button");

    optionButtons.forEach((button, index) => {
        button.disabled = true;

        if (index === currentQuestion.answer) {
            button.classList.add("correct");
        }
    });

    incorrectCount++;

    feedbackMessage.textContent =
        `⏰ Time's up! Correct answer: ${currentQuestion.options[currentQuestion.answer]}`;

    feedbackMessage.classList.add("error");
    footerHint.textContent = "Time ran out. Continue to the next question.";

    progressFill.style.width =
        `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        currentQuestionIndex + 1
    );

    nextButton.disabled = false;
}

// Move to the next question or show the final result
function goToNextQuestion() {
    if (!answerLocked) return;

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        finishQuiz();
    }
}

// Calculate and display the final result
function finishQuiz() {
    clearInterval(timerInterval);

    quizScreen.hidden = true;
    resultScreen.hidden = false;

    const percentage = Math.round((score / questions.length) * 100);
    const previousBest = getBestScore();
    const newBest = Math.max(score, previousBest);

    try {
        localStorage.setItem(BEST_SCORE_KEY, String(newBest));
    } catch (error) {
        // The quiz still works if browser storage is unavailable.
    }

    finalScore.textContent = score;
    scoreDivider.textContent = `/ ${questions.length}`;

    resultPercentage.textContent = `${percentage}%`;
    resultProgressFill.style.width = `${percentage}%`;

    correctAnswers.textContent = correctCount;
    incorrectAnswers.textContent = incorrectCount;
    bestScore.textContent = newBest;

    if (percentage === 100) {
        resultIcon.textContent = "🏆";
        resultHeading.textContent = "Perfect Score!";
        resultDescription.textContent =
            "Outstanding! You answered every question correctly.";
    } else if (percentage >= 70) {
        resultIcon.textContent = "🎉";
        resultHeading.textContent = "Amazing Work!";
        resultDescription.textContent =
            "Great job! You have a strong understanding of these topics.";
    } else if (percentage >= 40) {
        resultIcon.textContent = "👏";
        resultHeading.textContent = "Good Effort!";
        resultDescription.textContent =
            "You're making progress. Keep practising to improve your score.";
    } else {
        resultIcon.textContent = "💪";
        resultHeading.textContent = "Keep Learning!";
        resultDescription.textContent =
            "Every attempt helps you learn. Try again and beat your score!";
    }
}

// Button event listeners
startButton.addEventListener("click", startQuiz);
nextButton.addEventListener("click", goToNextQuestion);
restartButton.addEventListener("click", startQuiz)

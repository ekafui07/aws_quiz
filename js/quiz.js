/**
 * quiz.js
 * Core quiz engine — manages state, renders UI screens, and handles user interactions.
 * Depends on: questions.js, ai.js
 */

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const QuizState = {
    activeQuestions: [],
    currentIndex: 0,
    score: 0,
    answered: false,

    reset() {
        this.activeQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
    }
};

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function showScreen(screenId) {
    const screens = ["start-screen", "question-screen", "results-screen"];
    screens.forEach(id => {
        const el = $(id);
        el.classList.add("hidden");
        el.classList.remove("flex");
    });

    const target = $(screenId);
    target.classList.remove("hidden");
    if (screenId === "question-screen") target.classList.add("flex");
}

// ---------------------------------------------------------------------------
// Quiz flow
// ---------------------------------------------------------------------------

function startQuiz(useCustomQuestions = false) {
    if (!useCustomQuestions) {
        QuizState.activeQuestions = DEFAULT_QUESTIONS;
    }

    $("total-qs").textContent = QuizState.activeQuestions.length;
    $("score-display").classList.remove("hidden");

    showScreen("question-screen");
    loadQuestion();
}

function loadQuestion() {
    QuizState.answered = false;

    const q = QuizState.activeQuestions[QuizState.currentIndex];

    $("question-counter").textContent =
        `Question ${QuizState.currentIndex + 1} of ${QuizState.activeQuestions.length}`;
    $("question-text").textContent = q.q;

    renderOptions(q);

    $("feedback-area").classList.add("hidden");
    $("btn-next").classList.add("hidden");
}

function renderOptions(question) {
    const container = $("options-container");
    container.innerHTML = "";

    question.options.forEach((optionText, index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, D...

        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerHTML = `<span class="option-letter">${letter}.</span> ${optionText}`;
        btn.addEventListener("click", () => checkAnswer(index, btn));

        container.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, selectedBtn) {
    if (QuizState.answered) return;
    QuizState.answered = true;

    const q = QuizState.activeQuestions[QuizState.currentIndex];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
        QuizState.score++;
        $("current-score").textContent = QuizState.score;
    }

    highlightOptions(q.answer, selectedIndex, isCorrect);
    showFeedback(isCorrect, q);

    const btnNext = $("btn-next");
    btnNext.classList.remove("hidden");
    const isLastQuestion = QuizState.currentIndex === QuizState.activeQuestions.length - 1;
    btnNext.textContent = isLastQuestion ? "Finish Quiz" : "Next Question →";
}

function highlightOptions(correctIndex, selectedIndex, isCorrect) {
    const buttons = $("options-container").children;

    Array.from(buttons).forEach((btn, i) => {
        btn.disabled = true;
        btn.classList.remove("option-btn");

        if (i === correctIndex) {
            btn.className = "option-btn correct";
        } else if (i === selectedIndex && !isCorrect) {
            btn.className = "option-btn incorrect";
        } else {
            btn.className = "option-btn dimmed";
        }
    });
}

function showFeedback(isCorrect, question) {
    const feedbackArea  = $("feedback-area");
    const feedbackTitle = $("feedback-title");
    const feedbackText  = $("feedback-text");
    const feedbackIcon  = $("feedback-icon");

    feedbackArea.classList.remove("hidden", "feedback-correct", "feedback-incorrect");
    feedbackArea.classList.add(isCorrect ? "feedback-correct" : "feedback-incorrect", "fade-in");

    if (isCorrect) {
        feedbackTitle.textContent = "Correct!";
        feedbackTitle.className = "feedback-title correct";
        feedbackIcon.innerHTML = ICONS.correct;
    } else {
        feedbackTitle.textContent = "Incorrect";
        feedbackTitle.className = "feedback-title incorrect";
        feedbackIcon.innerHTML = ICONS.incorrect;
    }

    const fallback = `The correct answer was Option ${String.fromCharCode(65 + question.answer)}.`;
    feedbackText.textContent = question.explanation || fallback;
}

function nextQuestion() {
    QuizState.currentIndex++;
    if (QuizState.currentIndex < QuizState.activeQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    $("score-display").classList.add("hidden");
    showScreen("results-screen");

    $("final-score").textContent = QuizState.score;
    $("final-total").textContent = QuizState.activeQuestions.length;

    const percentage = (QuizState.score / QuizState.activeQuestions.length) * 100;
    const iconBg = $("result-icon-bg");
    const emoji  = $("result-emoji");

    iconBg.className = "result-icon-bg";

    if (percentage >= 80) {
        iconBg.classList.add("result-pass");
        emoji.textContent = "🏆";
    } else if (percentage >= 50) {
        iconBg.classList.add("result-average");
        emoji.textContent = "👍";
    } else {
        iconBg.classList.add("result-fail");
        emoji.textContent = "📚";
    }
}

// ---------------------------------------------------------------------------
// PDF Upload handler
// ---------------------------------------------------------------------------

async function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") return;

    const btnLabel = $("pdf-btn-label");
    const errorMsg = $("upload-error");

    btnLabel.innerHTML = '<span class="loader"></span> Reading & Generating...';
    errorMsg.classList.add("hidden");

    try {
        const rawText = await extractTextFromPDF(file);
        const parsedQuestions = await extractQuestionsWithAI(rawText);

        if (!parsedQuestions || parsedQuestions.length === 0) {
            throw new Error("Could not extract any questions from the provided PDF.");
        }

        QuizState.activeQuestions = parsedQuestions;
        $("header-subtitle").textContent = `Custom AI Quiz: ${file.name.substring(0, 20)}...`;
        startQuiz(true);

    } catch (error) {
        console.error(error);
        errorMsg.textContent = "Error: " + error.message;
        errorMsg.classList.remove("hidden");
        btnLabel.textContent = "Select PDF File";
    }
}

// ---------------------------------------------------------------------------
// SVG icon constants (keeps HTML clean)
// ---------------------------------------------------------------------------

const ICONS = {
    correct: `<svg class="icon-correct" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,

    incorrect: `<svg class="icon-incorrect" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line></svg>`
};

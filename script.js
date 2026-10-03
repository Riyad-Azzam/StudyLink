/* =========================================================
   StudyLink 📚
   Shared JavaScript
   Works with all StudyLink pages
========================================================= */

const SUBJECTS = [
    "Math",
    "Arabic",
    "English",
    "Computer Science",
    "Physics",
    "Chemistry"
];

const TASKS_KEY = "studyLinkTasks";
const PEER_KEY = "studyLinkPeerQuestions";

/* =========================================================
   GENERAL HELPERS
========================================================= */

function getTasks() {
    try {
        return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function getPeerQuestions() {
    try {
        return JSON.parse(localStorage.getItem(PEER_KEY)) || [];
    } catch {
        return [];
    }
}

function savePeerQuestions(questions) {
    localStorage.setItem(PEER_KEY, JSON.stringify(questions));
}

function todayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function isToday(dateString) {
    return dateString === todayString();
}

/* =========================================================
   CURRENT DATE
========================================================= */

function updateCurrentDate() {
    const element = document.getElementById("currentDate");

    if (!element) return;

    const now = new Date();

    element.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
}

/* =========================================================
   TASK SYSTEM
========================================================= */

let currentTaskFilter = "All";

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const subjectSelect = document.getElementById("subjectSelect");
    const dueDate = document.getElementById("dueDate");

    if (!taskInput || !subjectSelect || !dueDate) return;

    const taskText = taskInput.value.trim();
    const subject = subjectSelect.value;
    const due = dueDate.value;

    if (!taskText) {
        alert("Please enter a task.");
        return;
    }

    if (!due) {
        alert("Please choose a due date.");
        return;
    }

    if (due < todayString()) {
        alert("You cannot choose a date in the past.");
        return;
    }

    const tasks = getTasks();

    const newTask = {
        id: Date.now(),
        text: taskText,
        subject: subject,
        dueDate: due,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    saveTasks(tasks);

    taskInput.value = "";
    dueDate.value = "";

    renderTasks();
    updateEverything();
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyTaskState");
    const taskStatus = document.getElementById("taskStatus");

    if (!taskList) return;

    let tasks = getTasks();

    tasks.sort((a, b) => {
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    if (currentTaskFilter !== "All") {
        tasks = tasks.filter(
            task => task.subject === currentTaskFilter
        );
    }

    taskList.innerHTML = "";

    if (taskStatus) {
        taskStatus.textContent =
            `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
    }

    if (tasks.length === 0) {
        if (emptyState) {
            emptyState.style.display = "block";
        }

        return;
    }

    if (emptyState) {
        emptyState.style.display = "none";
    }

    tasks.forEach(task => {
        const item = document.createElement("div");

        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        if (isToday(task.dueDate) && !task.completed) {
            item.classList.add("due-today");
        }

        item.innerHTML = `
            <div class="task-main">
                <div class="task-check">
                    <button
                        class="task-complete-button"
                        onclick="completeTask(${task.id})"
                        aria-label="Complete task"
                    >
                        ${task.completed ? "✓" : ""}
                    </button>
                </div>

                <div class="task-content">
                    <h3>${escapeHTML(task.text)}</h3>

                    <div class="task-meta">
                        <span class="task-subject">
                            ${escapeHTML(task.subject)}
                        </span>

                        <span class="due-date">
                            ${isToday(task.dueDate)
                                ? "Due today"
                                : "Due " + formatDate(task.dueDate)}
                        </span>
                    </div>
                </div>
            </div>

            <div class="task-actions">
                <button
                    class="complete-task-button"
                    onclick="completeTask(${task.id})"
                >
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button
                    class="delete-task-button"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(item);
    });
}

function completeTask(id) {
    const tasks = getTasks();

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks(tasks);

    renderTasks();
    updateEverything();
}

function deleteTask(id) {
    const tasks = getTasks();

    const updatedTasks = tasks.filter(task => task.id !== id);

    saveTasks(updatedTasks);

    renderTasks();
    updateEverything();
}

function filterTasks(subject) {
    currentTaskFilter = subject;

    document.querySelectorAll(".filter-button").forEach(button => {
        button.classList.remove("active");
    });

    const buttons = document.querySelectorAll(".filter-button");

    buttons.forEach(button => {
        if (
            subject === "All" &&
            button.textContent.trim() === "All Tasks"
        ) {
            button.classList.add("active");
        }

        if (
            subject !== "All" &&
            button.textContent.trim() === subject
        ) {
            button.classList.add("active");
        }
    });

    renderTasks();
}

function showAllTasks() {
    filterTasks("All");
}

/* Make inline HTML buttons work */
window.filterTasks = filterTasks;
window.showAllTasks = showAllTasks;
window.completeTask = completeTask;
window.deleteTask = deleteTask;

/* =========================================================
   TASK COUNTS
========================================================= */

function updateTaskCounts() {
    const tasks = getTasks();

    SUBJECTS.forEach(subject => {
        const count = tasks.filter(
            task => task.subject === subject
        ).length;

        const cards = document.querySelectorAll(
            `[data-subject="${subject}"]`
        );

        cards.forEach(card => {
            const countElement =
                card.querySelector(".task-count");

            if (countElement) {
                countElement.textContent =
                    `${count} ${count === 1 ? "Task" : "Tasks"}`;
            }
        });
    });
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

function updateDashboard() {
    const tasks = getTasks();

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const remaining = total - completed;

    const dashboardTotal =
        document.getElementById("dashboardTotal");

    const dashboardCompleted =
        document.getElementById("dashboardCompleted");

    const dashboardRemaining =
        document.getElementById("dashboardRemaining");

    const dashboardProgress =
        document.getElementById("dashboardProgress");

    if (dashboardTotal) {
        dashboardTotal.textContent = total;
    }

    if (dashboardCompleted) {
        dashboardCompleted.textContent = completed;
    }

    if (dashboardRemaining) {
        dashboardRemaining.textContent = remaining;
    }

    if (dashboardProgress) {
        const percent =
            total === 0
                ? 0
                : Math.round((completed / total) * 100);

        dashboardProgress.textContent = `${percent}%`;
    }
}

/* =========================================================
   PROGRESS PAGE
========================================================= */

function updateProgress() {
    const tasks = getTasks();

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const remaining = total - completed;

    const percent =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    const totalElement =
        document.getElementById("totalTasks");

    const completedElement =
        document.getElementById("completedTasks");

    const remainingElement =
        document.getElementById("remainingTasks");

    const percentElement =
        document.getElementById("progressPercent");

    const percentSmallElement =
        document.getElementById("progressPercentSmall");

    const progressFill =
        document.getElementById("progressFill");

    const progressRate =
        document.getElementById("progressRate");

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (remainingElement) {
        remainingElement.textContent = remaining;
    }

    if (percentElement) {
        percentElement.textContent = `${percent}%`;
    }

    if (percentSmallElement) {
        percentSmallElement.textContent = `${percent}%`;
    }

    if (progressRate) {
        progressRate.textContent = `${percent}%`;
    }

    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }

    const progressCircle =
        document.querySelector(".progress-circle");

    if (progressCircle) {
        progressCircle.style.setProperty(
            "--progress",
            `${percent}%`
        );
    }

    updateSubjectProgress();
}

function updateSubjectProgress() {
    const tasks = getTasks();

    SUBJECTS.forEach(subject => {
        const subjectTasks = tasks.filter(
            task => task.subject === subject
        );

        const total = subjectTasks.length;

        const completed = subjectTasks.filter(
            task => task.completed
        ).length;

        const percent =
            total === 0
                ? 0
                : Math.round((completed / total) * 100);

        const card = document.querySelector(
            `[data-progress-subject="${subject}"]`
        );

        if (!card) return;

        const percentElement =
            card.querySelector(".subject-progress-percent");

        const fill =
            card.querySelector(".subject-progress-fill");

        const text =
            card.querySelector(".subject-progress-text");

        if (percentElement) {
            percentElement.textContent = `${percent}%`;
        }

        if (fill) {
            fill.style.width = `${percent}%`;
        }

        if (text) {
            text.textContent =
                `${completed} of ${total} tasks completed`;
        }
    });
}

/* =========================================================
   POMODORO TIMER
========================================================= */

let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;

function updateTimerDisplay() {
    const display =
        document.getElementById("timerDisplay");

    if (!display) return;

    const minutes =
        Math.floor(pomodoroSeconds / 60);

    const seconds =
        pomodoroSeconds % 60;

    display.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
    if (pomodoroRunning) return;

    pomodoroRunning = true;

    const mode =
        document.getElementById("timerMode");

    const message =
        document.querySelector(".timer-message");

    if (mode) {
        mode.textContent = "Focus session";
    }

    if (message) {
        message.textContent =
            "Stay focused. You've got this.";
    }

    pomodoroInterval = setInterval(() => {
        if (pomodoroSeconds > 0) {
            pomodoroSeconds--;

            updateTimerDisplay();
        } else {
            clearInterval(pomodoroInterval);

            pomodoroRunning = false;

            if (mode) {
                mode.textContent = "Session complete";
            }

            if (message) {
                message.textContent =
                    "Great work! Take a short break.";
            }
        }
    }, 1000);
}

function pauseTimer() {
    if (!pomodoroRunning) return;

    clearInterval(pomodoroInterval);

    pomodoroRunning = false;

    const mode =
        document.getElementById("timerMode");

    const message =
        document.querySelector(".timer-message");

    if (mode) {
        mode.textContent = "Paused";
    }

    if (message) {
        message.textContent =
            "Take a breath, then continue when you're ready.";
    }
}

function resetTimer(minutes = 25) {
    clearInterval(pomodoroInterval);

    pomodoroRunning = false;

    pomodoroSeconds = minutes * 60;

    updateTimerDisplay();

    const mode =
        document.getElementById("timerMode");

    const message =
        document.querySelector(".timer-message");

    if (mode) {
        mode.textContent = "Ready to focus?";
    }

    if (message) {
        message.textContent =
            "Set a goal, start the timer, and focus.";
    }
}

/* =========================================================
   QUIZ DATA
========================================================= */

const quizBank = {

    Math: [
        {
            question: "What is 7 × 8?",
            answers: ["54", "56", "64", "48"],
            correct: "56"
        },
        {
            question: "What is the value of x if x + 5 = 12?",
            answers: ["5", "6", "7", "8"],
            correct: "7"
        },
        {
            question: "What is the area of a rectangle with length 8 and width 3?",
            answers: ["11", "24", "22", "16"],
            correct: "24"
        },
        {
            question: "What is 15% of 200?",
            answers: ["20", "25", "30", "35"],
            correct: "30"
        },
        {
            question: "What is the square root of 81?",
            answers: ["7", "8", "9", "10"],
            correct: "9"
        }
    ],

    Arabic: [
        {
            question: "ما نوع كلمة «كتاب»؟",
            answers: ["فعل", "اسم", "حرف", "صفة"],
            correct: "اسم"
        },
        {
            question: "ما جمع كلمة «طالب»؟",
            answers: ["طلاب", "طالبات", "طلب", "طالبي"],
            correct: "طلاب"
        },
        {
            question: "ما عكس كلمة «سريع»؟",
            answers: ["قوي", "بطيء", "كبير", "خفيف"],
            correct: "بطيء"
        },
        {
            question: "أي كلمة من التالية فعل؟",
            answers: ["مدرسة", "جميل", "كتب", "كتاب"],
            correct: "كتب"
        },
        {
            question: "ما مفرد كلمة «أشجار»؟",
            answers: ["شجرة", "شجر", "شجير", "غصن"],
            correct: "شجرة"
        }
    ],

    English: [
        {
            question: "Choose the correct sentence.",
            answers: [
                "She go to school.",
                "She goes to school.",
                "She going school.",
                "She gone to school."
            ],
            correct: "She goes to school."
        },
        {
            question: "What is the past tense of 'go'?",
            answers: ["Goed", "Gone", "Went", "Going"],
            correct: "Went"
        },
        {
            question: "Choose the correct article: ___ apple.",
            answers: ["A", "An", "The", "No article"],
            correct: "An"
        },
        {
            question: "What is the opposite of 'difficult'?",
            answers: ["Hard", "Easy", "Heavy", "Strong"],
            correct: "Easy"
        },
        {
            question: "Which word is an adjective?",
            answers: ["Quickly", "Run", "Beautiful", "Happiness"],
            correct: "Beautiful"
        }
    ],

    "Computer Science": [
        {
            question: "What does CPU stand for?",
            answers: [
                "Central Processing Unit",
                "Computer Personal Unit",
                "Central Program Utility",
                "Core Processing User"
            ],
            correct: "Central Processing Unit"
        },
        {
            question: "Which data type usually stores true or false?",
            answers: ["String", "Boolean", "Integer", "Float"],
            correct: "Boolean"
        },
        {
            question: "What does HTML mainly describe?",
            answers: [
                "The structure of a webpage",
                "Computer hardware",
                "Internet speed",
                "Database storage"
            ],
            correct: "The structure of a webpage"
        },
        {
            question: "Which symbol is commonly used for a comment in JavaScript?",
            answers: ["//", "##", "<!--", "**"],
            correct: "//"
        },
        {
            question: "What is an algorithm?",
            answers: [
                "A programming language",
                "A step-by-step method for solving a problem",
                "A computer screen",
                "A type of hardware"
            ],
            correct: "A step-by-step method for solving a problem"
        }
    ],

    Physics: [
        {
            question: "What is the SI unit of force?",
            answers: ["Joule", "Newton", "Watt", "Pascal"],
            correct: "Newton"
        },
        {
            question: "What is the approximate acceleration due to gravity on Earth?",
            answers: ["4.9 m/s²", "9.8 m/s²", "15 m/s²", "20 m/s²"],
            correct: "9.8 m/s²"
        },
        {
            question: "Which quantity is measured in watts?",
            answers: ["Energy", "Power", "Force", "Mass"],
            correct: "Power"
        },
        {
            question: "What happens to an object's speed when it accelerates in the direction of motion?",
            answers: [
                "It decreases",
                "It increases",
                "It becomes zero",
                "It stays exactly the same"
            ],
            correct: "It increases"
        },
        {
            question: "Which of these is a form of energy?",
            answers: ["Kinetic", "Newton", "Meter", "Pascal"],
            correct: "Kinetic"
        }
    ],

    Chemistry: [
    {
        question: "What is the chemical symbol for oxygen?",
        answers: ["O", "Ox", "C", "Og"],
        correct: "O"
    },
    {
        question: "What is H₂O commonly known as?",
        answers: ["Hydrogen", "Oxygen", "Water", "Salt"],
        correct: "Water"
    },
    {
        question: "What is the pH of a neutral solution at 25°C?",
        answers: ["0", "5", "7", "14"],
        correct: "7"
    },
    {
        question: "Which particle has a negative charge?",
        answers: ["Proton", "Neutron", "Electron", "Nucleus"],
        correct: "Electron"
    },
    {
        question: "What is NaCl commonly called?",
        answers: ["Sugar", "Table salt", "Water", "Carbon dioxide"],
        correct: "Table salt"
    }
]
};

/* =========================================================
   QUIZ SYSTEM
========================================================= */

let currentQuizSubject = "Math";
let currentQuizQuestions = [];
let currentQuizIndex = 0;
let currentQuizScore = 0;
let currentQuizAnswered = false;

function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function selectQuizSubject(subject) {
    if (!quizBank[subject]) return;

    currentQuizSubject = subject;

    const hiddenSubject =
        document.getElementById("quizSubject");

    if (hiddenSubject) {
        hiddenSubject.value = subject;
    }

    document.querySelectorAll(
        ".quiz-subject-card"
    ).forEach(card => {
        card.classList.remove("selected");

        if (card.dataset.quizSubject === subject) {
            card.classList.add("selected");
        }
    });
}

function startQuiz() {
    if (!quizBank[currentQuizSubject]) {
        currentQuizSubject = "Math";
    }

    currentQuizQuestions = shuffleArray(
        quizBank[currentQuizSubject]
    );

    currentQuizIndex = 0;
    currentQuizScore = 0;
    currentQuizAnswered = false;

    const selector =
        document.querySelector(".quiz-selector");

    const quizArea =
        document.getElementById("quizArea");

    const result =
        document.getElementById("quizResult");

    if (selector) {
        selector.style.display = "none";
    }

    if (result) {
        result.style.display = "none";
    }

    if (quizArea) {
        quizArea.style.display = "block";
    }

    showQuizQuestion();
}

function showQuizQuestion() {
    const question =
        currentQuizQuestions[currentQuizIndex];

    if (!question) return;

    currentQuizAnswered = false;

    const progress =
        document.getElementById("quizProgress");

    const score =
        document.getElementById("quizScore");

    const questionElement =
        document.getElementById("quizQuestion");

    const answersElement =
        document.getElementById("quizAnswers");

    const feedback =
        document.getElementById("quizFeedback");

    const nextButton =
        document.getElementById("nextQuestionButton");

    if (progress) {
        progress.textContent =
            `Question ${currentQuizIndex + 1} of ${currentQuizQuestions.length}`;
    }

    if (score) {
        score.textContent =
            `Score: ${currentQuizScore}`;
    }

    if (questionElement) {
        questionElement.textContent =
            question.question;
    }

    if (answersElement) {
        answersElement.innerHTML = "";

        shuffleArray(question.answers).forEach(answer => {
            const button =
                document.createElement("button");

            button.className = "quiz-answer";
            button.textContent = answer;

            button.addEventListener(
                "click",
                () => selectQuizAnswer(answer, button)
            );

            answersElement.appendChild(button);
        });
    }

    if (feedback) {
        feedback.textContent = "";
        feedback.className = "quiz-feedback";
    }

    if (nextButton) {
        nextButton.style.display = "none";
        nextButton.textContent = "Next Question";
    }
}

function selectQuizAnswer(answer, button) {
    if (currentQuizAnswered) return;

    currentQuizAnswered = true;

    const question =
        currentQuizQuestions[currentQuizIndex];

    const answerButtons =
        document.querySelectorAll(".quiz-answer");

    answerButtons.forEach(answerButton => {
        answerButton.disabled = true;

        if (
            answerButton.textContent ===
            question.correct
        ) {
            answerButton.classList.add("correct");
        }
    });

    const feedback =
        document.getElementById("quizFeedback");

    if (answer === question.correct) {
        currentQuizScore++;

        button.classList.add("correct");

        if (feedback) {
            feedback.textContent = "Correct! 🎉";
            feedback.classList.add("correct");
        }
    } else {
        button.classList.add("wrong");

        if (feedback) {
            feedback.textContent =
                `Not quite. The correct answer is ${question.correct}.`;

            feedback.classList.add("wrong");
        }
    }

    const score =
        document.getElementById("quizScore");

    if (score) {
        score.textContent =
            `Score: ${currentQuizScore}`;
    }

    const nextButton =
        document.getElementById("nextQuestionButton");

    if (nextButton) {
        nextButton.style.display = "block";

        if (
            currentQuizIndex ===
            currentQuizQuestions.length - 1
        ) {
            nextButton.textContent = "See Results";
        } else {
            nextButton.textContent = "Next Question";
        }
    }
}

function nextQuizQuestion() {
    if (!currentQuizAnswered) return;

    if (
        currentQuizIndex <
        currentQuizQuestions.length - 1
    ) {
        currentQuizIndex++;
        showQuizQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {
    const quizArea =
        document.getElementById("quizArea");

    const result =
        document.getElementById("quizResult");

    const finalScore =
        document.getElementById("finalQuizScore");

    if (quizArea) {
        quizArea.style.display = "none";
    }

    if (result) {
        result.style.display = "block";
    }

    if (finalScore) {
        const percent =
            Math.round(
                (currentQuizScore /
                    currentQuizQuestions.length) * 100
            );

        finalScore.textContent =
            `${currentQuizScore}/${currentQuizQuestions.length} — ${percent}%`;
    }
}

function retryQuiz() {
    startQuiz();
}

/* =========================================================
   RESOURCES
========================================================= */

function setupResourceCards() {
    const cards =
        document.querySelectorAll(".resource-card");

    cards.forEach(card => {
        card.addEventListener("click", event => {
            event.preventDefault();

            const subject =
                card.dataset.resourceSubject;

            if (!subject) return;

            window.location.href =
                `planner.html?subject=${encodeURIComponent(subject)}`;
        });
    });
}

/* =========================================================
   PEER HELP
========================================================= */

function showPeerMessage(message) {
    alert(message);
}

function showPeerQuestionForm() {
    const section =
        document.getElementById("peerQuestionSection");

    if (!section) return;

    section.classList.add("visible");

    section.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function setupPeerHelp() {
    const askButton =
        document.getElementById("askQuestionButton");

    const helpButton =
        document.getElementById("helpSomeoneButton");

    const shareButton =
        document.getElementById("shareResourceButton");

    const postButton =
        document.getElementById("postQuestionButton");

    if (askButton) {
        askButton.addEventListener(
            "click",
            showPeerQuestionForm
        );
    }

    if (helpButton) {
        helpButton.addEventListener("click", () => {
            showPeerMessage(
                "Helping someone can start with answering a question clearly and respectfully."
            );
        });
    }

    if (shareButton) {
        shareButton.addEventListener("click", () => {
            showPeerMessage(
                "Resource sharing will be added to the community system soon."
            );
        });
    }

    if (postButton) {
        postButton.addEventListener(
            "click",
            postPeerQuestion
        );
    }

    renderPeerQuestions();
}

function postPeerQuestion() {
    const subject =
        document.getElementById("peerSubject");

    const question =
        document.getElementById("peerQuestion");

    if (!subject || !question) return;

    const text = question.value.trim();

    if (!text) {
        alert("Please write your question first.");
        return;
    }

    if (text.length < 5) {
        alert("Please write a little more detail.");
        return;
    }

    const questions = getPeerQuestions();

    questions.unshift({
        id: Date.now(),
        subject: subject.value,
        question: text,
        date: new Date().toLocaleDateString()
    });

    savePeerQuestions(questions);

    question.value = "";

    renderPeerQuestions();

    const section =
        document.getElementById("peerQuestionSection");

    if (section) {
        section.classList.remove("visible");
    }
}

function renderPeerQuestions() {
    const list =
        document.getElementById("peerQuestionList");

    const empty =
        document.getElementById("peerEmptyState");

    const count =
        document.getElementById("peerQuestionCount");

    if (!list) return;

    const questions = getPeerQuestions();

    list.innerHTML = "";

    if (count) {
        count.textContent =
            `${questions.length} ${
                questions.length === 1
                    ? "question"
                    : "questions"
            }`;
    }

    if (questions.length === 0) {
        if (empty) {
            empty.style.display = "block";
        }

        return;
    }

    if (empty) {
        empty.style.display = "none";
    }

    questions.forEach(item => {
        const card =
            document.createElement("article");

        card.className = "peer-question-card";

        card.innerHTML = `
            <div class="peer-question-header">
                <span class="peer-question-subject">
                    ${escapeHTML(item.subject)}
                </span>

                <span class="peer-question-date">
                    ${escapeHTML(item.date)}
                </span>
            </div>

            <p>
                ${escapeHTML(item.question)}
            </p>

            <div class="peer-question-actions">
                <button
                    type="button"
                    class="peer-help-button"
                    onclick="helpWithQuestion()"
                >
                    Help
                </button>
            </div>
        `;

        list.appendChild(card);
    });
}

function helpWithQuestion() {
    alert(
        "You can write an explanation or solution for this question here when the full peer-answer system is added."
    );
}

window.helpWithQuestion = helpWithQuestion;

/* =========================================================
   PLANNER URL SUBJECT
========================================================= */

function setupPlannerSubject() {
    const subjectSelect =
        document.getElementById("subjectSelect");

    if (!subjectSelect) return;

    const params =
        new URLSearchParams(
            window.location.search
        );

    const subject = params.get("subject");

    if (
        subject &&
        SUBJECTS.includes(subject)
    ) {
        subjectSelect.value = subject;
        filterTasks(subject);
    }
}

/* =========================================================
   DATE INPUT
========================================================= */

function setupDateInput() {
    const dueDate =
        document.getElementById("dueDate");

    if (!dueDate) return;

    dueDate.min = todayString();
}

/* =========================================================
   TASK SETUP
========================================================= */

function setupTaskSystem() {
    const addButton =
        document.getElementById("addTaskButton");

    if (addButton) {
        addButton.addEventListener(
            "click",
            addTask
        );
    }

    const taskInput =
        document.getElementById("taskInput");

    if (taskInput) {
        taskInput.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    addTask();
                }
            }
        );
    }

    setupDateInput();
    setupPlannerSubject();
    renderTasks();
}

/* =========================================================
   POMODORO SETUP
========================================================= */

function setupPomodoro() {
    const start =
        document.getElementById(
            "startTimerButton"
        );

    const pause =
        document.getElementById(
            "pauseTimerButton"
        );

    const reset =
        document.getElementById(
            "resetTimerButton"
        );

    if (start) {
        start.addEventListener(
            "click",
            startTimer
        );
    }

    if (pause) {
        pause.addEventListener(
            "click",
            pauseTimer
        );
    }

    if (reset) {
        reset.addEventListener(
            "click",
            () => resetTimer(25)
        );
    }

    document.querySelectorAll(
        ".preset-button"
    ).forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const minutes =
                    Number(button.dataset.minutes);

                if (!minutes) return;

                document.querySelectorAll(
                    ".preset-button"
                ).forEach(btn => {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                resetTimer(minutes);
            }
        );
    });

    updateTimerDisplay();
}

/* =========================================================
   QUIZ SETUP
========================================================= */

function setupQuiz() {
    const subjectCards =
        document.querySelectorAll(
            ".quiz-subject-card"
        );

    subjectCards.forEach(card => {
        card.addEventListener(
            "click",
            () => {
                const subject =
                    card.dataset.quizSubject;

                selectQuizSubject(subject);
            }
        );
    });

    const start =
        document.getElementById(
            "startQuizButton"
        );

    if (start) {
        start.addEventListener(
            "click",
            startQuiz
        );
    }

    const next =
        document.getElementById(
            "nextQuestionButton"
        );

    if (next) {
        next.addEventListener(
            "click",
            nextQuizQuestion
        );
    }

    const retry =
        document.getElementById(
            "retryQuizButton"
        );

    if (retry) {
        retry.addEventListener(
            "click",
            retryQuiz
        );
    }

    selectQuizSubject("Math");
}

/* =========================================================
   UPDATE EVERYTHING
========================================================= */

function updateEverything() {
    updateTaskCounts();
    updateDashboard();
    updateProgress();
}

/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        updateCurrentDate();

        setupTaskSystem();

        setupPomodoro();

        setupQuiz();

        setupResourceCards();

        setupPeerHelp();

        updateEverything();
    }
);
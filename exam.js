
// =====================================================
// API
// =====================================================

const API_URL =
    "http://127.0.0.1:5000";


// =====================================================
// QUESTIONS
// =====================================================

const questions = [

    {
        question:
            "What does HTML stand for?",

        options: [
            "Hyper Text Markup Language",
            "High Text Machine Language",
            "Hyperlink Text Management Language",
            "Home Tool Markup Language"
        ],

        answer: 0
    },


    {
        question:
            "Which language is used to style a web page?",

        options: [
            "HTML",
            "CSS",
            "JavaScript",
            "SQL"
        ],

        answer: 1
    },


    {
        question:
            "Which keyword is used to declare a variable in JavaScript?",

        options: [
            "variable",
            "var",
            "declare",
            "define"
        ],

        answer: 1
    },


    {
        question:
            "What does CSS stand for?",

        options: [
            "Computer Style Sheets",
            "Creative Style System",
            "Cascading Style Sheets",
            "Colorful Style Sheets"
        ],

        answer: 2
    },


    {
        question:
            "Which ServiceNow API is commonly used to query database records?",

        options: [
            "GlideRecord",
            "GlideForm",
            "GlideAjax",
            "GlideSystem"
        ],

        answer: 0
    },


    {
        question:
            "Which ServiceNow scripting component runs on the server side?",

        options: [
            "Client Script",
            "Business Rule",
            "UI Policy",
            "Catalog Client Script"
        ],

        answer: 1
    },


    {
        question:
            "Which ServiceNow tool is used for process automation?",

        options: [
            "Flow Designer",
            "Form Designer",
            "Schema Map",
            "Dictionary"
        ],

        answer: 0
    },


    {
        question:
            "Which method inserts a new record using GlideRecord?",

        options: [
            "create()",
            "save()",
            "insert()",
            "add()"
        ],

        answer: 2
    },


    {
        question:
            "Which HTTP method is normally used to retrieve data?",

        options: [
            "POST",
            "GET",
            "DELETE",
            "PATCH"
        ],

        answer: 1
    },


    {
        question:
            "What does HRSD stand for?",

        options: [
            "Human Resource Service Database",
            "Human Resources Service Delivery",
            "Human Resource Software Development",
            "Human Request Service Department"
        ],

        answer: 1
    }

];


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentQuestion = 0;

let userAnswers =
    new Array(questions.length).fill(null);

let timeLeft = 10 * 60;

let timerInterval = null;

let examSubmitted = false;


// =====================================================
// DOM ELEMENTS
// =====================================================

const questionNumber =
    document.getElementById(
        "questionNumber"
    );


const questionText =
    document.getElementById(
        "questionText"
    );


const optionsContainer =
    document.getElementById(
        "optionsContainer"
    );


const previousBtn =
    document.getElementById(
        "previousBtn"
    );


const nextBtn =
    document.getElementById(
        "nextBtn"
    );


const submitBtn =
    document.getElementById(
        "submitBtn"
    );


const answeredCount =
    document.getElementById(
        "answeredCount"
    );


const progressBar =
    document.getElementById(
        "progressBar"
    );


const questionButtons =
    document.getElementById(
        "questionButtons"
    );


const timer =
    document.getElementById(
        "timer"
    );


// =====================================================
// LOAD STUDENT
// =====================================================

const studentName =
    localStorage.getItem(
        "studentName"
    );


const rollNumber =
    localStorage.getItem(
        "rollNumber"
    );


const subject =
    localStorage.getItem(
        "subject"
    );


const studentId =
    localStorage.getItem(
        "studentId"
    );


if (!studentName) {

    alert(
        "Please enter student details first."
    );

    window.location.href =
        "index.html";

}


// =====================================================
// DISPLAY STUDENT
// =====================================================

document.getElementById(
    "studentDisplay"
).textContent =
    studentName +
    " | Roll No: " +
    rollNumber +
    " | " +
    subject;


// =====================================================
// SHOW QUESTION
// =====================================================

function showQuestion() {

    const question =
        questions[currentQuestion];


    questionNumber.textContent =
        "Question " +
        (currentQuestion + 1) +
        " of " +
        questions.length;


    questionText.textContent =
        question.question;


    optionsContainer.innerHTML =
        "";


    question.options.forEach(
        function (option, index) {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "option";


            label.innerHTML = `

                <input
                    type="radio"
                    name="answer"
                    value="${index}"
                    ${
                        userAnswers[
                            currentQuestion
                        ] === index
                            ? "checked"
                            : ""
                    }
                >

                <span>
                    ${option}
                </span>

            `;


            const radio =
                label.querySelector(
                    "input"
                );


            radio.addEventListener(
                "change",
                function () {

                    userAnswers[
                        currentQuestion
                    ] =
                        parseInt(
                            this.value
                        );


                    updateAnsweredCount();

                    updateQuestionButtons();

                    showQuestion();

                }
            );


            optionsContainer.appendChild(
                label
            );

        }
    );


    previousBtn.disabled =
        currentQuestion === 0;


    if (
        currentQuestion ===
        questions.length - 1
    ) {

        nextBtn.style.display =
            "none";

    } else {

        nextBtn.style.display =
            "block";

    }


    updateProgress();

    updateAnsweredCount();

    updateQuestionButtons();

}


// =====================================================
// NEXT
// =====================================================

nextBtn.addEventListener(
    "click",
    function () {

        if (
            currentQuestion <
            questions.length - 1
        ) {

            currentQuestion++;

            showQuestion();

        }

    }
);


// =====================================================
// PREVIOUS
// =====================================================

previousBtn.addEventListener(
    "click",
    function () {

        if (currentQuestion > 0) {

            currentQuestion--;

            showQuestion();

        }

    }
);


// =====================================================
// QUESTION BUTTONS
// =====================================================

function createQuestionButtons() {

    questionButtons.innerHTML =
        "";


    questions.forEach(
        function (question, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "question-number";


            button.textContent =
                index + 1;


            button.addEventListener(
                "click",
                function () {

                    currentQuestion =
                        index;

                    showQuestion();

                }
            );


            questionButtons.appendChild(
                button
            );

        }
    );

}


// =====================================================
// UPDATE QUESTION BUTTONS
// =====================================================

function updateQuestionButtons() {

    const buttons =
        document.querySelectorAll(
            ".question-number"
        );


    buttons.forEach(
        function (button, index) {

            button.classList.remove(
                "active"
            );


            button.classList.remove(
                "answered"
            );


            if (
                index ===
                currentQuestion
            ) {

                button.classList.add(
                    "active"
                );

            }


            if (
                userAnswers[index] !==
                null
            ) {

                button.classList.add(
                    "answered"
                );

            }

        }
    );

}


// =====================================================
// ANSWER COUNT
// =====================================================

function updateAnsweredCount() {

    const answered =
        userAnswers.filter(
            function (answer) {

                return answer !== null;

            }
        ).length;


    answeredCount.textContent =
        answered;

}


// =====================================================
// PROGRESS
// =====================================================

function updateProgress() {

    const progress =
        (
            (currentQuestion + 1) /
            questions.length
        ) * 100;


    progressBar.style.width =
        progress + "%";

}


// =====================================================
// TIMER
// =====================================================

function startTimer() {

    clearInterval(
        timerInterval
    );


    updateTimer();


    timerInterval =
        setInterval(
            function () {

                if (examSubmitted) {

                    clearInterval(
                        timerInterval
                    );

                    return;

                }


                timeLeft--;


                updateTimer();


                if (timeLeft <= 0) {

                    clearInterval(
                        timerInterval
                    );


                    alert(
                        "Time is over. Your exam will be submitted."
                    );


                    submitExam();

                }

            },
            1000
        );

}


// =====================================================
// UPDATE TIMER
// =====================================================

function updateTimer() {

    const minutes =
        Math.floor(
            timeLeft / 60
        );


    const seconds =
        timeLeft % 60;


    timer.textContent =
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(seconds)
            .padStart(2, "0");

}


// =====================================================
// SUBMIT BUTTON
// =====================================================

submitBtn.addEventListener(
    "click",
    function () {

        const answered =
            userAnswers.filter(
                function (answer) {

                    return answer !== null;

                }
            ).length;


        if (
            answered <
            questions.length
        ) {

            const confirmSubmit =
                confirm(
                    "You answered " +
                    answered +
                    " out of " +
                    questions.length +
                    " questions.\n\n" +
                    "Do you want to submit?"
                );


            if (!confirmSubmit) {

                return;

            }

        }


        submitExam();

    }
);


// =====================================================
// SUBMIT EXAM
// =====================================================

async function submitExam() {

    if (examSubmitted) {

        return;

    }


    examSubmitted = true;


    clearInterval(
        timerInterval
    );


    // =================================================
    // CALCULATE SCORE
    // =================================================

    let correct = 0;


    questions.forEach(
        function (question, index) {

            if (
                userAnswers[index] ===
                question.answer
            ) {

                correct++;

            }

        }
    );


    const total =
        questions.length;


    const wrong =
        total - correct;


    const percentage =
        Math.round(
            (correct / total) * 100
        );


    const status =
        percentage >= 50
            ? "PASS"
            : "FAIL";


    // =================================================
    // SAVE RESULT LOCALLY
    // =================================================

    localStorage.setItem(
        "totalQuestions",
        total
    );


    localStorage.setItem(
        "correctAnswers",
        correct
    );


    localStorage.setItem(
        "wrongAnswers",
        wrong
    );


    localStorage.setItem(
        "score",
        percentage
    );


    localStorage.setItem(
        "status",
        status
    );


    localStorage.setItem(
        "userAnswers",
        JSON.stringify(
            userAnswers
        )
    );


    localStorage.setItem(
        "questions",
        JSON.stringify(
            questions
        )
    );


    // =================================================
    // SAVE RESULT TO FLASK
    // =================================================

    try {

        const response =
            await fetch(
                `${API_URL}/api/results`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        student_id:
                            studentId,

                        total_questions:
                            total,

                        correct_answers:
                            correct,

                        wrong_answers:
                            wrong,

                        score:
                            percentage,

                        status:
                            status

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "Result API response:",
            data
        );


    } catch (error) {

        console.warn(
            "Result could not be saved to Flask:",
            error
        );

    }


    // =================================================
    // GO TO RESULT PAGE
    // =================================================

    window.location.href =
        "result.html";

}


// =====================================================
// INITIALIZE EXAM
// =====================================================

createQuestionButtons();

showQuestion();

startTimer();


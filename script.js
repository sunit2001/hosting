// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL = "http://127.0.0.1:5000";


// =====================================================
// QUESTIONS
// =====================================================

const questions = [

    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Text Machine Language",
            "Hyperlink Text Management Language",
            "Home Tool Markup Language"
        ],
        answer: 0
    },

    {
        question: "Which language is used to style a web page?",
        options: [
            "HTML",
            "CSS",
            "JavaScript",
            "SQL"
        ],
        answer: 1
    },

    {
        question: "Which keyword is used to declare a variable in JavaScript?",
        options: [
            "variable",
            "var",
            "declare",
            "define"
        ],
        answer: 1
    },

    {
        question: "What does CSS stand for?",
        options: [
            "Computer Style Sheets",
            "Creative Style System",
            "Cascading Style Sheets",
            "Colorful Style Sheets"
        ],
        answer: 2
    },

    {
        question: "Which ServiceNow API is commonly used to query database records?",
        options: [
            "GlideRecord",
            "GlideForm",
            "GlideAjax",
            "GlideSystem"
        ],
        answer: 0
    },

    {
        question: "Which ServiceNow scripting component runs on the server side?",
        options: [
            "Client Script",
            "Business Rule",
            "UI Policy",
            "Catalog Client Script"
        ],
        answer: 1
    },

    {
        question: "Which ServiceNow tool is used for process automation?",
        options: [
            "Flow Designer",
            "Form Designer",
            "Schema Map",
            "Dictionary"
        ],
        answer: 0
    },

    {
        question: "Which method inserts a new record using GlideRecord?",
        options: [
            "create()",
            "save()",
            "insert()",
            "add()"
        ],
        answer: 2
    },

    {
        question: "Which HTTP method is normally used to retrieve data?",
        options: [
            "POST",
            "GET",
            "DELETE",
            "PATCH"
        ],
        answer: 1
    },

    {
        question: "What does HRSD stand for?",
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

let studentId = null;

let examSubmitted = false;


// =====================================================
// DOM ELEMENTS
// =====================================================

const studentSection =
    document.getElementById("studentSection");

const examSection =
    document.getElementById("examSection");

const resultSection =
    document.getElementById("resultSection");

const studentForm =
    document.getElementById("studentForm");

const questionNumber =
    document.getElementById("questionNumber");

const questionText =
    document.getElementById("questionText");

const optionsContainer =
    document.getElementById("optionsContainer");

const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");

const submitBtn =
    document.getElementById("submitBtn");

const answeredCount =
    document.getElementById("answeredCount");

const progressBar =
    document.getElementById("progressBar");

const questionButtons =
    document.getElementById("questionButtons");

const timer =
    document.getElementById("timer");


// =====================================================
// START EXAM
// =====================================================

studentForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document
                .getElementById("studentName")
                .value
                .trim();


        const rollNumber =
            document
                .getElementById("rollNumber")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const subject =
            document
                .getElementById("subject")
                .value;


        if (
            !name ||
            !rollNumber ||
            !email ||
            !subject
        ) {

            alert(
                "Please fill all student details."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/students`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            roll_number:
                                rollNumber,

                            email: email,

                            subject: subject

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.error ||
                    "Unable to create student."
                );

                return;
            }


            // Save student ID

            studentId =
                data.student_id;


            // Display student information

            document
                .getElementById(
                    "studentDisplay"
                )
                .textContent =
                name +
                " | Roll No: " +
                rollNumber;


            // Hide student form

            studentSection.style.display =
                "none";


            // Show exam

            examSection.style.display =
                "block";


            // Create question navigation

            createQuestionButtons();


            // Show first question

            showQuestion();


            // Start timer

            startTimer();


        } catch (error) {

            console.error(
                "Server Error:",
                error
            );


            alert(
                "Server connection failed. " +
                "Make sure Flask server is running."
            );

        }

    }
);


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


    optionsContainer.innerHTML = "";


    question.options.forEach(
        function(option, index) {

            const label =
                document.createElement("label");


            label.className =
                "option";


            if (
                userAnswers[currentQuestion] ===
                index
            ) {

                label.classList.add(
                    "selected"
                );

            }


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
                function() {

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


    // Previous button

    previousBtn.disabled =
        currentQuestion === 0;


    // Next button

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

}


// =====================================================
// NEXT
// =====================================================

nextBtn.addEventListener(
    "click",
    function() {

        if (
            currentQuestion <
            questions.length - 1
        ) {

            currentQuestion++;

            showQuestion();

            updateQuestionButtons();

        }

    }
);


// =====================================================
// PREVIOUS
// =====================================================

previousBtn.addEventListener(
    "click",
    function() {

        if (
            currentQuestion > 0
        ) {

            currentQuestion--;

            showQuestion();

            updateQuestionButtons();

        }

    }
);


// =====================================================
// CREATE QUESTION BUTTONS
// =====================================================

function createQuestionButtons() {

    questionButtons.innerHTML = "";


    questions.forEach(
        function(question, index) {

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
                function() {

                    currentQuestion =
                        index;

                    showQuestion();

                    updateQuestionButtons();

                }
            );


            questionButtons.appendChild(
                button
            );

        }
    );


    updateQuestionButtons();

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
        function(button, index) {

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
            function(answer) {

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
            function() {

                if (
                    examSubmitted
                ) {

                    clearInterval(
                        timerInterval
                    );

                    return;
                }


                timeLeft--;


                updateTimer();


                if (
                    timeLeft <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );


                    alert(
                        "Time is over. " +
                        "Your exam will be submitted automatically."
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
            .padStart(2, "0")
        +
        ":"
        +
        String(seconds)
            .padStart(2, "0");

}


// =====================================================
// SUBMIT BUTTON
// =====================================================

submitBtn.addEventListener(
    "click",
    function() {

        const answered =
            userAnswers.filter(
                function(answer) {

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


    let correct = 0;


    questions.forEach(
        function(question, index) {

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
    // SAVE RESULT TO DATABASE
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


        if (!response.ok) {

            console.error(
                "Result save failed:",
                data
            );

            alert(
                "Exam completed, but result could not be saved."
            );

        } else {

            console.log(
                "Result saved successfully:",
                data
            );

        }


    } catch (error) {

        console.error(
            "Result API Error:",
            error
        );

        alert(
            "Exam completed, but server connection failed while saving the result."
        );

    }


    // =================================================
    // SHOW RESULT
    // =================================================

    document.getElementById(
        "totalQuestions"
    ).textContent =
        total;


    document.getElementById(
        "correctAnswers"
    ).textContent =
        correct;


    document.getElementById(
        "wrongAnswers"
    ).textContent =
        wrong;


    document.getElementById(
        "finalScore"
    ).textContent =
        percentage + "%";


    const studentName =
        document.getElementById(
            "studentName"
        ).value;


    document.getElementById(
        "resultStudent"
    ).textContent =
        "Student: " +
        studentName;


    const passStatus =
        document.getElementById(
            "passStatus"
        );


    if (
        percentage >= 50
    ) {

        passStatus.textContent =
            "PASS";

        passStatus.className =
            "pass-status pass";

    } else {

        passStatus.textContent =
            "FAIL";

        passStatus.className =
            "pass-status fail";

    }


    generateReview();


    examSection.style.display =
        "none";


    resultSection.style.display =
        "block";

}


// =====================================================
// ANSWER REVIEW
// =====================================================

function generateReview() {

    const reviewContainer =
        document.getElementById(
            "reviewContainer"
        );


    reviewContainer.innerHTML = "";


    questions.forEach(
        function(question, index) {

            const userAnswer =
                userAnswers[index];


            const isCorrect =
                userAnswer ===
                question.answer;


            const reviewItem =
                document.createElement(
                    "div"
                );


            reviewItem.className =
                "review-item " +
                (
                    isCorrect
                        ? "correct"
                        : "wrong"
                );


            const userAnswerText =
                userAnswer !== null
                    ? question.options[
                        userAnswer
                    ]
                    : "Not Answered";


            const correctAnswerText =
                question.options[
                    question.answer
                ];


            reviewItem.innerHTML = `

                <div class="review-question">

                    ${index + 1}.
                    ${question.question}

                </div>

                <div>

                    Your Answer:
                    <strong>
                        ${userAnswerText}
                    </strong>

                </div>

                <div class="correct-answer">

                    Correct Answer:
                    <strong>
                        ${correctAnswerText}
                    </strong>

                </div>

            `;


            reviewContainer.appendChild(
                reviewItem
            );

        }
    );

}


// =====================================================
// RESTART EXAM
// =====================================================

function restartExam() {

    window.location.reload();

}
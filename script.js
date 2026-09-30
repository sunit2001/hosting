
// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL = "http://127.0.0.1:5000";


// =====================================================
// STUDENT FORM
// =====================================================

const studentForm =
    document.getElementById("studentForm");


studentForm.addEventListener(
    "submit",
    async function (event) {

        // Prevent page refresh
        event.preventDefault();


        // =================================================
        // GET STUDENT DATA
        // =================================================

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


        // =================================================
        // VALIDATION
        // =================================================

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


        // =================================================
        // SAVE STUDENT DATA LOCALLY
        // =================================================

        localStorage.setItem(
            "studentName",
            name
        );


        localStorage.setItem(
            "rollNumber",
            rollNumber
        );


        localStorage.setItem(
            "studentEmail",
            email
        );


        localStorage.setItem(
            "subject",
            subject
        );


        // =================================================
        // SAVE STUDENT TO FLASK
        // =================================================

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


            if (response.ok) {

                // Save database student ID

                localStorage.setItem(
                    "studentId",
                    data.student_id
                );


                console.log(
                    "Student created:",
                    data.student_id
                );

            } else {

                console.warn(
                    "Student could not be saved:",
                    data
                );

            }


        } catch (error) {

            console.warn(
                "Flask server not available:",
                error
            );

            /*
                We don't stop the exam here.

                The user can still start the exam.
            */

        }


        // =================================================
        // REDIRECT TO EXAM PAGE
        // =================================================

        window.location.href =
            "exam.html";

    }
);


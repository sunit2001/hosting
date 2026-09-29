from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3


# =====================================================
# FLASK APP
# =====================================================

app = Flask(__name__)

CORS(app)

DATABASE = "exam.db"


# =====================================================
# DATABASE CONNECTION
# =====================================================

def get_db():

    conn = sqlite3.connect(
        DATABASE,
        timeout=30
    )

    conn.row_factory = sqlite3.Row

    conn.execute(
        "PRAGMA busy_timeout = 30000"
    )

    return conn


# =====================================================
# INITIALIZE DATABASE
# =====================================================

def init_db():

    conn = get_db()

    # -------------------------------------------------
    # STUDENTS TABLE
    # -------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS students (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            roll_number TEXT NOT NULL,

            email TEXT NOT NULL,

            subject TEXT NOT NULL,

            created_at TEXT DEFAULT CURRENT_TIMESTAMP

        )
    """)

    # -------------------------------------------------
    # EXAM RESULTS TABLE
    # -------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS exam_results (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            student_id INTEGER NOT NULL,

            total_questions INTEGER NOT NULL,

            correct_answers INTEGER NOT NULL,

            wrong_answers INTEGER NOT NULL,

            score INTEGER NOT NULL,

            status TEXT NOT NULL,

            submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(student_id)
                REFERENCES students(id)

        )
    """)

    conn.commit()

    conn.close()


# =====================================================
# HOME PAGE
# =====================================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# =====================================================
# CREATE STUDENT
# =====================================================

@app.route(
    "/api/students",
    methods=["POST"]
)
def create_student():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No student data received"
            }), 400

        name = str(
            data.get(
                "name",
                ""
            )
        ).strip()

        roll_number = str(
            data.get(
                "roll_number",
                ""
            )
        ).strip()

        email = str(
            data.get(
                "email",
                ""
            )
        ).strip()

        subject = str(
            data.get(
                "subject",
                ""
            )
        ).strip()

        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not name:

            return jsonify({
                "error": "Student name is required"
            }), 400

        if not roll_number:

            return jsonify({
                "error": "Roll number is required"
            }), 400

        if not email:

            return jsonify({
                "error": "Email is required"
            }), 400

        if not subject:

            return jsonify({
                "error": "Subject is required"
            }), 400

        # -------------------------------------------------
        # INSERT STUDENT
        # -------------------------------------------------

        conn = get_db()

        cursor = conn.execute("""
            INSERT INTO students
            (
                name,
                roll_number,
                email,
                subject
            )

            VALUES (?, ?, ?, ?)

        """, (
            name,
            roll_number,
            email,
            subject
        ))

        conn.commit()

        student_id = cursor.lastrowid

        conn.close()

        return jsonify({

            "message": "Student created successfully",

            "student_id": student_id,

            "name": name,

            "roll_number": roll_number,

            "email": email,

            "subject": subject

        }), 201

    except sqlite3.IntegrityError as e:

        print(
            "Student Database Error:",
            e
        )

        return jsonify({

            "error":
                "Database constraint error: " + str(e)

        }), 400

    except Exception as e:

        print(
            "Create Student Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# SAVE EXAM RESULT
# =====================================================

@app.route(
    "/api/results",
    methods=["POST"]
)
def save_result():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No result data received"
            }), 400

        student_id = data.get("student_id")

        total_questions = int(
            data.get(
                "total_questions",
                0
            )
        )

        correct_answers = int(
            data.get(
                "correct_answers",
                0
            )
        )

        wrong_answers = int(
            data.get(
                "wrong_answers",
                0
            )
        )

        score = int(
            data.get(
                "score",
                0
            )
        )

        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not student_id:

            return jsonify({
                "error": "Student ID is required"
            }), 400

        if total_questions <= 0:

            return jsonify({
                "error": "Invalid total questions"
            }), 400

        if correct_answers < 0:

            return jsonify({
                "error": "Invalid correct answer count"
            }), 400

        if wrong_answers < 0:

            return jsonify({
                "error": "Invalid wrong answer count"
            }), 400

        if score < 0 or score > 100:

            return jsonify({
                "error": "Score must be between 0 and 100"
            }), 400

        # -------------------------------------------------
        # VERIFY STUDENT
        # -------------------------------------------------

        conn = get_db()

        student = conn.execute("""
            SELECT id
            FROM students
            WHERE id = ?

        """, (
            student_id,
        )).fetchone()

        if not student:

            conn.close()

            return jsonify({
                "error": "Student not found"
            }), 404

        # -------------------------------------------------
        # PASS / FAIL
        # -------------------------------------------------

        if score >= 50:

            status = "PASS"

        else:

            status = "FAIL"

        # -------------------------------------------------
        # INSERT RESULT
        # -------------------------------------------------

        cursor = conn.execute("""
            INSERT INTO exam_results
            (
                student_id,
                total_questions,
                correct_answers,
                wrong_answers,
                score,
                status
            )

            VALUES (?, ?, ?, ?, ?, ?)

        """, (
            student_id,
            total_questions,
            correct_answers,
            wrong_answers,
            score,
            status
        ))

        conn.commit()

        result_id = cursor.lastrowid

        conn.close()

        return jsonify({

            "message":
                "Exam result saved successfully",

            "result_id":
                result_id,

            "student_id":
                student_id,

            "score":
                score,

            "status":
                status

        }), 201

    except ValueError:

        return jsonify({
            "error": "Invalid numeric value"
        }), 400

    except sqlite3.IntegrityError as e:

        print(
            "Result Database Error:",
            e
        )

        return jsonify({

            "error":
                "Database constraint error: " + str(e)

        }), 400

    except Exception as e:

        print(
            "Save Result Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# GET ALL STUDENTS
# =====================================================

@app.route(
    "/api/students",
    methods=["GET"]
)
def get_students():

    try:

        conn = get_db()

        rows = conn.execute("""
            SELECT *
            FROM students
            ORDER BY id DESC
        """).fetchall()

        conn.close()

        students = []

        for row in rows:

            students.append(
                dict(row)
            )

        return jsonify(
            students
        )

    except Exception as e:

        print(
            "Get Students Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# GET ALL RESULTS
# =====================================================

@app.route(
    "/api/results",
    methods=["GET"]
)
def get_results():

    try:

        conn = get_db()

        rows = conn.execute("""
            SELECT

                exam_results.id,

                exam_results.student_id,

                students.name,

                students.roll_number,

                students.email,

                students.subject,

                exam_results.total_questions,

                exam_results.correct_answers,

                exam_results.wrong_answers,

                exam_results.score,

                exam_results.status,

                exam_results.submitted_at

            FROM exam_results

            INNER JOIN students

            ON exam_results.student_id = students.id

            ORDER BY exam_results.id DESC

        """).fetchall()

        conn.close()

        results = []

        for row in rows:

            results.append(
                dict(row)
            )

        return jsonify(
            results
        )

    except Exception as e:

        print(
            "Get Results Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# GET SINGLE RESULT
# =====================================================

@app.route(
    "/api/results/<int:result_id>",
    methods=["GET"]
)
def get_single_result(result_id):

    try:

        conn = get_db()

        row = conn.execute("""
            SELECT

                exam_results.id,

                exam_results.student_id,

                students.name,

                students.roll_number,

                students.email,

                students.subject,

                exam_results.total_questions,

                exam_results.correct_answers,

                exam_results.wrong_answers,

                exam_results.score,

                exam_results.status,

                exam_results.submitted_at

            FROM exam_results

            INNER JOIN students

            ON exam_results.student_id = students.id

            WHERE exam_results.id = ?

        """, (
            result_id,
        )).fetchone()

        conn.close()

        if not row:

            return jsonify({
                "error": "Result not found"
            }), 404

        return jsonify(
            dict(row)
        )

    except Exception as e:

        print(
            "Get Result Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# DASHBOARD
# =====================================================

@app.route(
    "/api/dashboard",
    methods=["GET"]
)
def dashboard():

    try:

        conn = get_db()

        total_students = conn.execute("""
            SELECT COUNT(*) AS total
            FROM students
        """).fetchone()["total"]

        total_exams = conn.execute("""
            SELECT COUNT(*) AS total
            FROM exam_results
        """).fetchone()["total"]

        passed = conn.execute("""
            SELECT COUNT(*) AS total
            FROM exam_results
            WHERE status = 'PASS'
        """).fetchone()["total"]

        failed = conn.execute("""
            SELECT COUNT(*) AS total
            FROM exam_results
            WHERE status = 'FAIL'
        """).fetchone()["total"]

        average_score = conn.execute("""
            SELECT AVG(score) AS average
            FROM exam_results
        """).fetchone()["average"]

        conn.close()

        return jsonify({

            "total_students":
                total_students,

            "total_exams":
                total_exams,

            "passed":
                passed,

            "failed":
                failed,

            "average_score":
                round(
                    average_score or 0,
                    2
                )

        })

    except Exception as e:

        print(
            "Dashboard Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# DELETE RESULT
# =====================================================

@app.route(
    "/api/results/<int:result_id>",
    methods=["DELETE"]
)
def delete_result(result_id):

    try:

        conn = get_db()

        cursor = conn.execute("""
            DELETE FROM exam_results
            WHERE id = ?

        """, (
            result_id,
        ))

        conn.commit()

        deleted = cursor.rowcount

        conn.close()

        if deleted == 0:

            return jsonify({
                "error": "Result not found"
            }), 404

        return jsonify({

            "message":
                "Result deleted successfully"

        })

    except Exception as e:

        print(
            "Delete Result Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# START SERVER
# =====================================================

if __name__ == "__main__":

    init_db()

    print(
        "======================================"
    )

    print(
        " Online Examination Server"
    )

    print(
        " Database: exam.db"
    )

    print(
        " URL: http://127.0.0.1:5000"
    )

    print(
        "======================================"
    )

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
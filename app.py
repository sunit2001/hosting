
from flask import Flask, request, jsonify
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

    conn = sqlite3.connect(DATABASE)

    conn.row_factory = sqlite3.Row

    return conn


# =====================================================
# CREATE TABLES
# =====================================================

def create_tables():

    conn = get_db()

    cursor = conn.cursor()

    # =================================================
    # STUDENTS TABLE
    # =================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            roll_number TEXT NOT NULL,

            email TEXT NOT NULL,

            subject TEXT NOT NULL,

            created_at TEXT DEFAULT CURRENT_TIMESTAMP

        )
    """)

    # =================================================
    # RESULTS TABLE
    # =================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS results (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            student_id INTEGER,

            total_questions INTEGER,

            correct_answers INTEGER,

            wrong_answers INTEGER,

            score REAL,

            status TEXT,

            created_at TEXT DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(student_id)
                REFERENCES students(id)

        )
    """)

    conn.commit()

    conn.close()


# =====================================================
# HOME
# =====================================================

@app.route("/")
def home():

    return jsonify({
        "message": "Online Examination API is running",
        "status": "success"
    })


# =====================================================
# CREATE STUDENT
# =====================================================

@app.route("/api/students", methods=["POST"])
def create_student():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No data received"
            }), 400

        name = data.get(
            "name",
            ""
        ).strip()

        roll_number = data.get(
            "roll_number",
            ""
        ).strip()

        email = data.get(
            "email",
            ""
        ).strip()

        subject = data.get(
            "subject",
            ""
        ).strip()

        # =================================================
        # VALIDATION
        # =================================================

        if (
            not name
            or not roll_number
            or not email
            or not subject
        ):

            return jsonify({
                "error": "All fields are required"
            }), 400

        # =================================================
        # INSERT STUDENT
        # =================================================

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO students
            (
                name,
                roll_number,
                email,
                subject
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                name,
                roll_number,
                email,
                subject
            )
        )

        student_id = cursor.lastrowid

        conn.commit()

        conn.close()

        return jsonify({
            "message": "Student created successfully",
            "student_id": student_id
        }), 201

    except Exception as e:

        print(
            "Student Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# SAVE RESULT
# =====================================================

@app.route("/api/results", methods=["POST"])
def create_result():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No data received"
            }), 400

        student_id = data.get(
            "student_id"
        )

        total_questions = data.get(
            "total_questions",
            0
        )

        correct_answers = data.get(
            "correct_answers",
            0
        )

        wrong_answers = data.get(
            "wrong_answers",
            0
        )

        score = data.get(
            "score",
            0
        )

        status = data.get(
            "status",
            ""
        )

        # =================================================
        # INSERT RESULT
        # =================================================

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO results
            (
                student_id,
                total_questions,
                correct_answers,
                wrong_answers,
                score,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                student_id,
                total_questions,
                correct_answers,
                wrong_answers,
                score,
                status
            )
        )

        result_id = cursor.lastrowid

        conn.commit()

        conn.close()

        return jsonify({
            "message": "Result saved successfully",
            "result_id": result_id
        }), 201

    except Exception as e:

        print(
            "Result Error:",
            e
        )

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# GET STUDENTS
# =====================================================

@app.route("/api/students", methods=["GET"])
def get_students():

    try:

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT *
            FROM students
            ORDER BY id DESC
            """
        )

        rows = cursor.fetchall()

        conn.close()

        students = [
            dict(row)
            for row in rows
        ]

        return jsonify(students)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# GET RESULTS
# =====================================================

@app.route("/api/results", methods=["GET"])
def get_results():

    try:

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                results.id,
                results.student_id,
                students.name,
                students.roll_number,
                students.email,
                students.subject,
                results.total_questions,
                results.correct_answers,
                results.wrong_answers,
                results.score,
                results.status,
                results.created_at

            FROM results

            LEFT JOIN students
            ON results.student_id = students.id

            ORDER BY results.id DESC
            """
        )

        rows = cursor.fetchall()

        conn.close()

        results = [
            dict(row)
            for row in rows
        ]

        return jsonify(results)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# =====================================================
# RUN SERVER
# =====================================================

if __name__ == "__main__":

    create_tables()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )


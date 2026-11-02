
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

# =====================================================
# FLASK APP
# =====================================================

app = Flask(__name__)

CORS(app)

# =====================================================
# DATABASE CONFIGURATION
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE = os.path.join(BASE_DIR, "exam.db")

print("DATABASE LOCATION:", DATABASE)


# =====================================================
# DATABASE CONNECTION
# =====================================================

def get_db():

    conn = sqlite3.connect(
        DATABASE,
        timeout=10
    )

    conn.row_factory = sqlite3.Row

    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 10000")
    conn.execute("PRAGMA journal_mode = WAL")

    return conn


# =====================================================
# CREATE TABLES
# =====================================================

def create_tables():

    conn = get_db()

    try:

        cursor = conn.cursor()

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

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS results (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                student_id INTEGER NOT NULL,

                total_questions INTEGER DEFAULT 0,

                correct_answers INTEGER DEFAULT 0,

                wrong_answers INTEGER DEFAULT 0,

                score REAL DEFAULT 0,

                status TEXT,

                created_at TEXT DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY(student_id)
                    REFERENCES students(id)

            )
        """)

        conn.commit()

        print("DATABASE TABLES CREATED SUCCESSFULLY")

    finally:

        conn.close()


# =====================================================
# HOME API
# =====================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Online Examination API is running",
        "database": DATABASE,
        "status": "success"
    })


# =====================================================
# CREATE STUDENT
# =====================================================

@app.route("/api/students", methods=["POST"])
def create_student():

    conn = None

    try:

        data = request.get_json(silent=True)

        print("STUDENT DATA RECEIVED:", data)

        if not data:

            return jsonify({
                "success": False,
                "error": "No JSON data received"
            }), 400

        name = str(data.get("name", "")).strip()
        roll_number = str(data.get("roll_number", "")).strip()
        email = str(data.get("email", "")).strip()
        subject = str(data.get("subject", "")).strip()

        if not all([name, roll_number, email, subject]):

            return jsonify({
                "success": False,
                "error": "All fields are required"
            }), 400

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute("""
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

        student_id = cursor.lastrowid

        conn.commit()

        print("STUDENT SAVED:", student_id)

        return jsonify({
            "success": True,
            "message": "Student created successfully",
            "student_id": student_id
        }), 201

    except Exception as e:

        print("STUDENT ERROR:", str(e))

        if conn:
            conn.rollback()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if conn:
            conn.close()


# =====================================================
# GET STUDENTS
# =====================================================

@app.route("/api/students", methods=["GET"])
def get_students():

    conn = None

    try:

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM students
            ORDER BY id DESC
        """)

        students = [
            dict(row)
            for row in cursor.fetchall()
        ]

        return jsonify({
            "success": True,
            "count": len(students),
            "students": students
        })

    except Exception as e:

        print("GET STUDENTS ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if conn:
            conn.close()


# =====================================================
# SAVE EXAMINATION RESULT
# =====================================================

@app.route("/api/results", methods=["POST"])
def create_result():

    conn = None

    try:

        data = request.get_json(silent=True)

        print("EXAM RESULT RECEIVED:", data)

        if not data:

            return jsonify({
                "success": False,
                "error": "No JSON data received"
            }), 400

        student_id = data.get("student_id")

        if not student_id:

            return jsonify({
                "success": False,
                "error": "Student ID is required"
            }), 400

        conn = get_db()

        cursor = conn.cursor()

        # CHECK STUDENT

        cursor.execute("""
            SELECT id
            FROM students
            WHERE id = ?
        """, (student_id,))

        student = cursor.fetchone()

        if not student:

            return jsonify({
                "success": False,
                "error": "Student ID does not exist"
            }), 404

        total_questions = int(data.get("total_questions", 0))
        correct_answers = int(data.get("correct_answers", 0))
        wrong_answers = int(data.get("wrong_answers", 0))
        score = float(data.get("score", 0))
        status = str(data.get("status", "")).strip()

        if min(total_questions, correct_answers, wrong_answers) < 0:

            return jsonify({
                "success": False,
                "error": "Question counts cannot be negative"
            }), 400

        if correct_answers + wrong_answers > total_questions:

            return jsonify({
                "success": False,
                "error": "Answer counts exceed total questions"
            }), 400

        # INSERT RESULT

        cursor.execute("""
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
        """, (
            student_id,
            total_questions,
            correct_answers,
            wrong_answers,
            score,
            status
        ))

        result_id = cursor.lastrowid

        conn.commit()

        print("EXAM RESULT SAVED:", result_id)

        return jsonify({
            "success": True,
            "message": "Exam result saved successfully",
            "result_id": result_id,
            "student_id": student_id
        }), 201

    except (ValueError, TypeError) as e:

        if conn:
            conn.rollback()

        return jsonify({
            "success": False,
            "error": "Invalid numeric result data"
        }), 400

    except Exception as e:

        print("RESULT ERROR:", str(e))

        if conn:
            conn.rollback()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if conn:
            conn.close()


# =====================================================
# GET EXAMINATION RESULTS
# =====================================================

@app.route("/api/results", methods=["GET"])
def get_results():

    conn = None

    try:

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute("""
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
        """)

        results = [
            dict(row)
            for row in cursor.fetchall()
        ]

        return jsonify({
            "success": True,
            "count": len(results),
            "results": results
        })

    except Exception as e:

        print("GET RESULTS ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if conn:
            conn.close()


# =====================================================
# DATABASE CHECK API
# =====================================================

@app.route("/api/database-check", methods=["GET"])
def database_check():

    conn = None

    try:

        conn = get_db()

        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM students")

        student_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM results")

        result_count = cursor.fetchone()[0]

        return jsonify({
            "success": True,
            "database": DATABASE,
            "students": student_count,
            "results": result_count
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:

        if conn:
            conn.close()


# =====================================================
# RUN SERVER
# =====================================================

if __name__ == "__main__":

    create_tables()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )

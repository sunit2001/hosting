import sqlite3

conn = sqlite3.connect("exam.db")

cursor = conn.cursor()

print("Database created successfully!")

conn.close()
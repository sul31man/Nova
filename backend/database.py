import sqlite3
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_PATH = os.getenv('DATABASE_PATH', 'nova.db')

def init_database():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Projects table - stores engineering problems
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active'
        )
    ''')
    
    # Questions table - stores AI-generated questions for projects
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            question_text TEXT NOT NULL,
            question_order INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')
    
    # Answers table - stores user answers to questions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            question_id INTEGER,
            answer_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    ''')
    
    # Tasks table - stores generated tasks
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            estimated_hours TEXT NOT NULL,
            skills TEXT NOT NULL, -- JSON array of skills
            reward_credits INTEGER DEFAULT 0,
            status TEXT DEFAULT 'available',
            applicants_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')
    
    # Task applications table - stores who applied for what tasks
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS task_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            applicant_name TEXT,
            applicant_email TEXT,
            application_message TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def get_db_connection():
    """Get a database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Database helper functions
class ProjectDB:
    @staticmethod
    def create_project(title, description):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO projects (title, description) VALUES (?, ?)',
            (title, description)
        )
        project_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return project_id
    
    @staticmethod
    def get_project(project_id):
        conn = get_db_connection()
        project = conn.execute(
            'SELECT * FROM projects WHERE id = ?', (project_id,)
        ).fetchone()
        conn.close()
        return dict(project) if project else None

class QuestionDB:
    @staticmethod
    def add_questions(project_id, questions):
        conn = get_db_connection()
        cursor = conn.cursor()
        for i, question in enumerate(questions):
            cursor.execute(
                'INSERT INTO questions (project_id, question_text, question_order) VALUES (?, ?, ?)',
                (project_id, question, i + 1)
            )
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_questions(project_id):
        conn = get_db_connection()
        questions = conn.execute(
            'SELECT * FROM questions WHERE project_id = ? ORDER BY question_order',
            (project_id,)
        ).fetchall()
        conn.close()
        return [dict(q) for q in questions]

class AnswerDB:
    @staticmethod
    def add_answer(project_id, question_id, answer_text):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO answers (project_id, question_id, answer_text) VALUES (?, ?, ?)',
            (project_id, question_id, answer_text)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def get_answers(project_id):
        conn = get_db_connection()
        answers = conn.execute(
            '''SELECT a.*, q.question_text 
               FROM answers a 
               JOIN questions q ON a.question_id = q.id 
               WHERE a.project_id = ? 
               ORDER BY q.question_order''',
            (project_id,)
        ).fetchall()
        conn.close()
        return [dict(a) for a in answers]

class TaskDB:
    @staticmethod
    def create_tasks(project_id, tasks):
        conn = get_db_connection()
        cursor = conn.cursor()
        task_ids = []
        for task in tasks:
            cursor.execute(
                '''INSERT INTO tasks 
                   (project_id, title, description, difficulty, estimated_hours, skills, reward_credits) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)''',
                (project_id, task['title'], task['description'], 
                 task['difficulty'], task['estimated_hours'], 
                 json.dumps(task['skills']), task.get('reward_credits', 100))
            )
            task_ids.append(cursor.lastrowid)
        conn.commit()
        conn.close()
        return task_ids
    
    @staticmethod
    def get_all_tasks():
        conn = get_db_connection()
        tasks = conn.execute(
            'SELECT * FROM tasks WHERE status = "available" ORDER BY created_at DESC'
        ).fetchall()
        conn.close()
        # Parse skills JSON
        result = []
        for task in tasks:
            task_dict = dict(task)
            task_dict['skills'] = json.loads(task_dict['skills'])
            result.append(task_dict)
        return result
    
    @staticmethod
    def get_task(task_id):
        conn = get_db_connection()
        task = conn.execute(
            'SELECT * FROM tasks WHERE id = ?', (task_id,)
        ).fetchone()
        conn.close()
        if task:
            task_dict = dict(task)
            task_dict['skills'] = json.loads(task_dict['skills'])
            return task_dict
        return None

if __name__ == "__main__":
    init_database()

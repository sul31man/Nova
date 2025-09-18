import sqlite3
import json
import os
import hashlib
import secrets
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
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (user_id) REFERENCES users (id)
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
    
    # Users table - stores user accounts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            bio TEXT,
            skills TEXT, -- JSON array of skills
            credits INTEGER DEFAULT 0,
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # Task applications table - stores who applied for what tasks
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS task_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            user_id INTEGER,
            applicant_name TEXT,
            applicant_email TEXT,
            application_message TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
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
    def create_project(title, description, user_id=None):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO projects (title, description, user_id) VALUES (?, ?, ?)',
            (title, description, user_id)
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

    @staticmethod
    def get_filtered_tasks(difficulty=None, skills=None, min_credits=None, max_credits=None):
        conn = get_db_connection()
        
        query = 'SELECT * FROM tasks WHERE status = "available"'
        params = []
        
        if difficulty:
            query += ' AND difficulty = ?'
            params.append(difficulty)
        
        if min_credits is not None:
            query += ' AND reward_credits >= ?'
            params.append(min_credits)
        
        if max_credits is not None:
            query += ' AND reward_credits <= ?'
            params.append(max_credits)
        
        query += ' ORDER BY created_at DESC'
        
        tasks = conn.execute(query, params).fetchall()
        conn.close()
        
        # Parse skills JSON and filter by skills if specified
        result = []
        for task in tasks:
            task_dict = dict(task)
            task_dict['skills'] = json.loads(task_dict['skills'])
            
            # Filter by skills if specified
            if skills:
                task_skills_lower = [skill.lower() for skill in task_dict['skills']]
                filter_skills_lower = [skill.lower().strip() for skill in skills]
                if any(skill in task_skills_lower for skill in filter_skills_lower):
                    result.append(task_dict)
            else:
                result.append(task_dict)
        
        return result

    @staticmethod
    def create_application(task_id, user_id, applicant_name, applicant_email, application_message):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO task_applications 
               (task_id, user_id, applicant_name, applicant_email, application_message) 
               VALUES (?, ?, ?, ?, ?)''',
            (task_id, user_id, applicant_name, applicant_email, application_message)
        )
        application_id = cursor.lastrowid
        
        # Update applicants count
        cursor.execute(
            'UPDATE tasks SET applicants_count = applicants_count + 1 WHERE id = ?',
            (task_id,)
        )
        
        conn.commit()
        conn.close()
        return application_id

    @staticmethod
    def get_user_application(task_id, user_id):
        conn = get_db_connection()
        application = conn.execute(
            'SELECT * FROM task_applications WHERE task_id = ? AND user_id = ?',
            (task_id, user_id)
        ).fetchone()
        conn.close()
        return dict(application) if application else None

    @staticmethod
    def get_user_assigned_tasks(user_id):
        conn = get_db_connection()
        tasks = conn.execute(
            '''SELECT t.*, ta.status as application_status, ta.created_at as applied_at
               FROM tasks t 
               JOIN task_applications ta ON t.id = ta.task_id 
               WHERE ta.user_id = ? AND ta.status IN ('accepted', 'pending')
               ORDER BY ta.created_at DESC''',
            (user_id,)
        ).fetchall()
        conn.close()
        
        result = []
        for task in tasks:
            task_dict = dict(task)
            task_dict['skills'] = json.loads(task_dict['skills'])
            result.append(task_dict)
        return result

    @staticmethod
    def get_user_completed_tasks(user_id):
        conn = get_db_connection()
        tasks = conn.execute(
            '''SELECT t.*, ta.status as application_status, ta.created_at as applied_at
               FROM tasks t 
               JOIN task_applications ta ON t.id = ta.task_id 
               WHERE ta.user_id = ? AND t.status = 'completed'
               ORDER BY t.created_at DESC''',
            (user_id,)
        ).fetchall()
        conn.close()
        
        result = []
        for task in tasks:
            task_dict = dict(task)
            task_dict['skills'] = json.loads(task_dict['skills'])
            result.append(task_dict)
        return result

    @staticmethod
    def get_user_created_tasks(user_id):
        conn = get_db_connection()
        tasks = conn.execute(
            '''SELECT t.* FROM tasks t 
               JOIN projects p ON t.project_id = p.id 
               WHERE p.user_id = ?
               ORDER BY t.created_at DESC''',
            (user_id,)
        ).fetchall()
        conn.close()
        
        result = []
        for task in tasks:
            task_dict = dict(task)
            task_dict['skills'] = json.loads(task_dict['skills'])
            result.append(task_dict)
        return result

    @staticmethod
    def user_can_update_task(task_id, user_id):
        conn = get_db_connection()
        # Check if user has applied for this task and it's assigned to them
        application = conn.execute(
            'SELECT * FROM task_applications WHERE task_id = ? AND user_id = ? AND status = "accepted"',
            (task_id, user_id)
        ).fetchone()
        conn.close()
        return application is not None

    @staticmethod
    def update_task_status(task_id, new_status):
        conn = get_db_connection()
        conn.execute(
            'UPDATE tasks SET status = ? WHERE id = ?',
            (new_status, task_id)
        )
        conn.commit()
        conn.close()

class UserDB:
    @staticmethod
    def hash_password(password):
        """Hash a password for storing in the database"""
        salt = secrets.token_hex(16)
        pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return salt + pwdhash.hex()
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify a stored password against provided password"""
        salt = stored_password[:32]
        stored_hash = stored_password[32:]
        pwdhash = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return stored_hash == pwdhash.hex()
    
    @staticmethod
    def create_user(username, email, password, full_name=None):
        """Create a new user account"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if username or email already exists
        existing = cursor.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            (username, email)
        ).fetchone()
        
        if existing:
            conn.close()
            return None, "Username or email already exists"
        
        password_hash = UserDB.hash_password(password)
        
        try:
            cursor.execute(
                'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
                (username, email, password_hash, full_name)
            )
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            return user_id, None
        except sqlite3.IntegrityError as e:
            conn.close()
            return None, str(e)
    
    @staticmethod
    def authenticate_user(username_or_email, password):
        """Authenticate a user login"""
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            (username_or_email, username_or_email)
        ).fetchone()
        conn.close()
        
        if user and UserDB.verify_password(user['password_hash'], password):
            # Update last login
            UserDB.update_last_login(user['id'])
            user_dict = dict(user)
            # Remove password hash from response
            del user_dict['password_hash']
            return user_dict
        return None
    
    @staticmethod
    def get_user(user_id):
        """Get user by ID"""
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE id = ?', (user_id,)
        ).fetchone()
        conn.close()
        
        if user:
            user_dict = dict(user)
            del user_dict['password_hash']  # Don't return password hash
            if user_dict['skills']:
                user_dict['skills'] = json.loads(user_dict['skills'])
            return user_dict
        return None
    
    @staticmethod
    def get_user_by_username(username):
        """Get user by username"""
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ?', (username,)
        ).fetchone()
        conn.close()
        
        if user:
            user_dict = dict(user)
            del user_dict['password_hash']  # Don't return password hash
            if user_dict['skills']:
                user_dict['skills'] = json.loads(user_dict['skills'])
            return user_dict
        return None
    
    @staticmethod
    def update_last_login(user_id):
        """Update user's last login timestamp"""
        conn = get_db_connection()
        conn.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            (user_id,)
        )
        conn.commit()
        conn.close()
    
    @staticmethod
    def update_user_profile(user_id, full_name=None, bio=None, skills=None, avatar_url=None):
        """Update user profile information"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        updates = []
        values = []
        
        if full_name is not None:
            updates.append("full_name = ?")
            values.append(full_name)
        if bio is not None:
            updates.append("bio = ?")
            values.append(bio)
        if skills is not None:
            updates.append("skills = ?")
            values.append(json.dumps(skills))
        if avatar_url is not None:
            updates.append("avatar_url = ?")
            values.append(avatar_url)
        
        if updates:
            values.append(user_id)
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, values)
            conn.commit()
        
        conn.close()

    @staticmethod
    def add_credits(user_id, credits):
        """Add credits to user account"""
        conn = get_db_connection()
        conn.execute(
            'UPDATE users SET credits = credits + ? WHERE id = ?',
            (credits, user_id)
        )
        conn.commit()
        conn.close()

if __name__ == "__main__":
    init_database()

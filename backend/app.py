from flask import Flask, jsonify, request
from flask_cors import CORS
from database import init_database, ProjectDB, QuestionDB, AnswerDB, TaskDB, UserDB
from ai_service import ai_service
import traceback
import os
import jwt
import datetime
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# JWT Secret Key (in production, this should be a secure random key)
JWT_SECRET = os.getenv('JWT_SECRET', 'nova-secret-key-change-in-production')

# Initialize database on startup
init_database()

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user_id = data['user_id']
            current_user = UserDB.get_user(current_user_id)
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@app.get("/api/hello")
def hello():
    return jsonify(message="Hello from Nova API!")

# Authentication endpoints
@app.post("/api/auth/register")
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(error="Request data is required"), 400
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        
        if not all([username, email, password]):
            return jsonify(error="Username, email, and password are required"), 400
        
        # Validate password length
        if len(password) < 6:
            return jsonify(error="Password must be at least 6 characters long"), 400
        
        user_id, error = UserDB.create_user(username, email, password, full_name)
        
        if error:
            return jsonify(error=error), 400
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, JWT_SECRET, algorithm='HS256')
        
        # Get user data
        user = UserDB.get_user(user_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': user
        })
        
    except Exception as e:
        print(f"Registration error: {e}")
        print(traceback.format_exc())
        return jsonify(error="Registration failed"), 500

@app.post("/api/auth/login")
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(error="Request data is required"), 400
        
        username_or_email = data.get('username_or_email')
        password = data.get('password')
        
        if not all([username_or_email, password]):
            return jsonify(error="Username/email and password are required"), 400
        
        user = UserDB.authenticate_user(username_or_email, password)
        
        if not user:
            return jsonify(error="Invalid credentials"), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user
        })
        
    except Exception as e:
        print(f"Login error: {e}")
        print(traceback.format_exc())
        return jsonify(error="Login failed"), 500

@app.get("/api/auth/me")
@token_required
def get_current_user(current_user):
    """Get current user information"""
    return jsonify(user=current_user)

@app.put("/api/auth/profile")
@token_required
def update_profile(current_user):
    """Update user profile"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(error="Request data is required"), 400
        
        UserDB.update_user_profile(
            current_user['id'],
            full_name=data.get('full_name'),
            bio=data.get('bio'),
            skills=data.get('skills'),
            avatar_url=data.get('avatar_url')
        )
        
        # Get updated user data
        updated_user = UserDB.get_user(current_user['id'])
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': updated_user
        })
        
    except Exception as e:
        print(f"Profile update error: {e}")
        print(traceback.format_exc())
        return jsonify(error="Profile update failed"), 500

# Education: generate learning plan
@app.post("/api/education/plan")
def generate_learning_plan():
    """Generate a spoon-fed learning plan based on user inputs"""
    try:
        data = request.get_json() or {}
        plan = ai_service.generate_learning_plan(data)
        return jsonify(plan)
    except Exception as e:
        print(f"Education plan error: {e}")
        print(traceback.format_exc())
        return jsonify(error="Failed to generate learning plan"), 500

@app.post("/api/projects/create")
@token_required
def create_project(current_user):
    """Create a new engineering project and generate first AI question"""
    try:
        data = request.get_json()
        
        if not data or 'description' not in data:
            return jsonify(error="Project description is required"), 400
        
        engineering_problem = data['description']
        title = data.get('title', engineering_problem[:100] + "..." if len(engineering_problem) > 100 else engineering_problem)
        
        # Create project in database
        project_id = ProjectDB.create_project(title, engineering_problem, current_user['id'])
        
        # Generate first AI question
        first_question = ai_service.generate_initial_question(engineering_problem)
        
        # Store first question in database
        QuestionDB.add_questions(project_id, [first_question])
        
        # Get question back with ID
        questions = QuestionDB.get_questions(project_id)
        
        return jsonify({
            'project_id': project_id,
            'current_question': questions[0],
            'total_questions_so_far': 1
        })
        
    except Exception as e:
        print(f"Error creating project: {e}")
        traceback.print_exc()
        return jsonify(error="Failed to create project"), 500

@app.post("/api/projects/<int:project_id>/answer")
def submit_answer(project_id):
    """Submit an answer and get next adaptive question or move to task generation"""
    try:
        data = request.get_json()
        
        if not data or 'question_id' not in data or 'answer' not in data:
            return jsonify(error="Question ID and answer are required"), 400
        
        question_id = data['question_id']
        answer_text = data['answer']
        
        # Store answer in database
        AnswerDB.add_answer(project_id, question_id, answer_text)
        
        # Get project and Q&A history
        project = ProjectDB.get_project(project_id)
        answers = AnswerDB.get_answers(project_id)
        
        # Format Q&A history for AI
        qa_history = []
        for answer in answers:
            qa_history.append({
                'question': answer['question_text'],
                'answer': answer['answer_text']
            })
        
        # Check if we need more questions
        need_more_questions = ai_service.should_generate_more_questions(project['description'], qa_history)
        
        if need_more_questions:
            # Generate next adaptive question
            next_question_text = ai_service.generate_next_question(project['description'], qa_history)
            
            # Store new question in database
            QuestionDB.add_questions(project_id, [next_question_text])
            
            # Get the new question with ID
            all_questions = QuestionDB.get_questions(project_id)
            next_question = all_questions[-1]  # Last question added
            
            return jsonify({
                'all_answered': False,
                'next_question': next_question,
                'answers_so_far': len(answers),
                'total_questions_so_far': len(all_questions)
            })
        else:
            # We have enough context, ready to generate tasks
            return jsonify({
                'all_answered': True,
                'message': 'Sufficient context gathered. Ready to generate tasks...',
                'total_questions': len(answers),
                'total_answers': len(answers)
            })
        
    except Exception as e:
        print(f"Error submitting answer: {e}")
        traceback.print_exc()
        return jsonify(error="Failed to submit answer"), 500

@app.post("/api/projects/<int:project_id>/generate-tasks")
def generate_tasks(project_id):
    """Generate tasks based on project questions and answers"""
    try:
        # Get project details
        project = ProjectDB.get_project(project_id)
        if not project:
            return jsonify(error="Project not found"), 404
        
        # Get all questions and answers
        questions = QuestionDB.get_questions(project_id)
        answers = AnswerDB.get_answers(project_id)
        
        # Format Q&A for AI
        qa_pairs = []
        for answer in answers:
            qa_pairs.append({
                'question': answer['question_text'],
                'answer': answer['answer_text']
            })
        
        # Generate tasks using AI
        ai_tasks = ai_service.generate_tasks(project['description'], qa_pairs)
        
        # Store tasks in database
        task_ids = TaskDB.create_tasks(project_id, ai_tasks)
        
        # Get tasks back with IDs
        tasks = []
        for task_id in task_ids:
            task = TaskDB.get_task(task_id)
            if task:
                tasks.append(task)
        
        return jsonify({
            'tasks': tasks,
            'project_id': project_id
        })
        
    except Exception as e:
        print(f"Error generating tasks: {e}")
        traceback.print_exc()
        return jsonify(error="Failed to generate tasks"), 500

@app.get("/api/projects/<int:project_id>")
def get_project(project_id):
    """Get project details including questions, answers, and tasks"""
    try:
        project = ProjectDB.get_project(project_id)
        if not project:
            return jsonify(error="Project not found"), 404
        
        questions = QuestionDB.get_questions(project_id)
        answers = AnswerDB.get_answers(project_id)
        
        return jsonify({
            'project': project,
            'questions': questions,
            'answers': answers
        })
        
    except Exception as e:
        print(f"Error getting project: {e}")
        traceback.print_exc()
        return jsonify(error="Failed to get project"), 500

@app.get("/api/tasks")
def get_all_tasks():
    """Get all available tasks for the marketplace with optional filtering"""
    try:
        # Get filter parameters
        difficulty = request.args.get('difficulty')
        skills = request.args.get('skills')  # comma-separated
        min_credits = request.args.get('min_credits', type=int)
        max_credits = request.args.get('max_credits', type=int)
        
        tasks = TaskDB.get_filtered_tasks(
            difficulty=difficulty,
            skills=skills.split(',') if skills else None,
            min_credits=min_credits,
            max_credits=max_credits
        )
        
        return jsonify(tasks=tasks)
        
    except Exception as e:
        print(f"Error getting tasks: {e}")
        traceback.print_exc()
        return jsonify(error="Failed to get tasks"), 500

@app.post("/api/tasks/<int:task_id>/apply")
@token_required
def apply_to_task(current_user, task_id):
    """Apply to work on a specific task"""
    try:
        data = request.get_json()
        application_message = data.get('message', '')
        
        # Check if task exists
        task = TaskDB.get_task(task_id)
        if not task:
            return jsonify(error="Task not found"), 404
        
        # Check if user already applied
        existing_application = TaskDB.get_user_application(task_id, current_user['id'])
        if existing_application:
            return jsonify(error="You have already applied for this task"), 400
        
        # Create application
        application_id = TaskDB.create_application(
            task_id, 
            current_user['id'], 
            current_user['username'], 
            current_user['email'], 
            application_message
        )
        
        return jsonify({
            'success': True,
            'message': 'Application submitted successfully',
            'application_id': application_id
        })
        
    except Exception as e:
        print(f"Task application error: {e}")
        print(traceback.format_exc())
        return jsonify(error="Failed to submit application"), 500

@app.get("/api/my-tasks")
@token_required
def get_my_tasks(current_user):
    """Get tasks assigned to or created by the current user"""
    try:
        user_id = current_user['id']
        
        # Get assigned tasks (tasks user has applied for and been assigned)
        assigned_tasks = TaskDB.get_user_assigned_tasks(user_id)
        
        # Get completed tasks
        completed_tasks = TaskDB.get_user_completed_tasks(user_id)
        
        # Get created tasks (tasks from projects created by user)
        created_tasks = TaskDB.get_user_created_tasks(user_id)
        
        return jsonify({
            'assigned': assigned_tasks,
            'completed': completed_tasks,
            'created': created_tasks
        })
        
    except Exception as e:
        print(f"Error fetching user tasks: {e}")
        print(traceback.format_exc())
        return jsonify(error="Failed to fetch user tasks"), 500

@app.put("/api/tasks/<int:task_id>/status")
@token_required
def update_task_status(current_user, task_id):
    """Update task status (start, complete, etc.)"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['in_progress', 'completed', 'cancelled']:
            return jsonify(error="Invalid status"), 400
        
        # Verify user has permission to update this task
        if not TaskDB.user_can_update_task(task_id, current_user['id']):
            return jsonify(error="Permission denied"), 403
        
        TaskDB.update_task_status(task_id, new_status)
        
        # If completing task, award credits
        if new_status == 'completed':
            task = TaskDB.get_task(task_id)
            if task:
                UserDB.add_credits(current_user['id'], task['reward_credits'])
        
        return jsonify(message="Task status updated successfully")
        
    except Exception as e:
        print(f"Error updating task status: {e}")
        print(traceback.format_exc())
        return jsonify(error="Failed to update task status"), 500

if __name__ == "__main__":
    # Default dev server on http://127.0.0.1:5001 (avoiding AirPlay conflict on 5000)
    app.run(host="127.0.0.1", port=5001, debug=True)


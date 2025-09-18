from flask import Flask, jsonify, request
from flask_cors import CORS
from database import init_database, ProjectDB, QuestionDB, AnswerDB, TaskDB
from ai_service import ai_service
import traceback
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize database on startup
init_database()

@app.get("/api/hello")
def hello():
    return jsonify(message="Hello from Nova API!")

@app.post("/api/projects/create")
def create_project():
    """Create a new engineering project and generate first AI question"""
    try:
        data = request.get_json()
        
        if not data or 'description' not in data:
            return jsonify(error="Project description is required"), 400
        
        engineering_problem = data['description']
        title = data.get('title', engineering_problem[:100] + "..." if len(engineering_problem) > 100 else engineering_problem)
        
        # Create project in database
        project_id = ProjectDB.create_project(title, engineering_problem)
        
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
    """Get all available tasks for the marketplace"""
    try:
        tasks = TaskDB.get_all_tasks()
        return jsonify(tasks=tasks)
        
    except Exception as e:
        print(f"Error getting tasks: {e}")
        traceback.print_exc()
        return jsonify(error="Failed to get tasks"), 500

@app.post("/api/tasks/<int:task_id>/apply")
def apply_to_task(task_id):
    """Apply to work on a specific task"""
    try:
        data = request.get_json()
        
        # For now, just return success
        # In a real app, you'd store application details
        
        return jsonify({
            'success': True,
            'message': f'Successfully applied to task {task_id}'
        })
        
    except Exception as e:
        print(f"Error applying to task: {e}")
        traceback.print_exc()
        return jsonify(error="Failed to apply to task"), 500

if __name__ == "__main__":
    # Default dev server on http://127.0.0.1:5000
    app.run(host="127.0.0.1", port=5000, debug=True)


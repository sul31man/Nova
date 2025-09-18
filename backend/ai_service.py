import openai
import os
import json
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up OpenAI API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

if not openai.api_key:
    print("WARNING: OPENAI_API_KEY not found in environment variables!")
    print("Please create a .env file in the backend directory with:")
    print("OPENAI_API_KEY=your_api_key_here")
    print("See .env.example for template")

class AITaskGenerator:
    def __init__(self):
        self.client_available = True
    
    def generate_initial_question(self, engineering_problem: str) -> str:
        """
        Generate the first question to understand an engineering problem better
        """
        prompt = f"""
        You are an AI assistant helping to decompose complex engineering problems into actionable tasks.
        
        A user has submitted this engineering problem:
        "{engineering_problem}"
        
        Generate ONE highly relevant, insightful question that will help you understand the most critical aspect of this problem first. This should be the most important question to ask to start understanding the scope, context, or core challenge.
        
        Return ONLY the question text, no additional formatting or explanation.
        
        Make the question specific to this particular engineering problem.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert engineering consultant who asks the most insightful first question to understand complex problems."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            question = response.choices[0].message.content.strip()
            print(f"AI generated initial question: {question}")
            return question
            
        except Exception as e:
            print(f"Error generating initial question: {e}")
            # Fallback question
            return "What is the primary goal you're trying to achieve with this engineering solution?"

    def generate_next_question(self, engineering_problem: str, previous_qa: List[Dict]) -> str:
        """
        Generate the next question based on previous questions and answers
        """
        qa_history = "\n".join([
            f"Q: {qa['question']}\nA: {qa['answer']}"
            for qa in previous_qa
        ])
        
        prompt = f"""
        You are an AI assistant helping to decompose complex engineering problems into actionable tasks.
        
        Original engineering problem:
        "{engineering_problem}"
        
        Previous questions and answers:
        {qa_history}
        
        Based on the conversation so far, generate ONE follow-up question that will help you gain deeper insight into this engineering problem. The question should:
        - Build on what you've already learned
        - Explore aspects not yet covered
        - Help understand technical requirements, constraints, users, or implementation details
        - Be specific and actionable
        
        Return ONLY the question text, no additional formatting or explanation.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert engineering consultant who asks strategic follow-up questions based on previous answers."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            question = response.choices[0].message.content.strip()
            print(f"AI generated follow-up question: {question}")
            return question
            
        except Exception as e:
            print(f"Error generating follow-up question: {e}")
            # Fallback questions based on number of previous questions
            fallback_questions = [
                "What specific constraints or limitations do you need to work within?",
                "Who are the end users of this solution and what are their needs?", 
                "What resources (budget, time, materials, skills) are available?",
                "What would success look like for this project?",
                "Are there existing solutions that don't meet your needs? Why not?"
            ]
            return fallback_questions[min(len(previous_qa), len(fallback_questions) - 1)]

    def should_generate_more_questions(self, engineering_problem: str, previous_qa: List[Dict]) -> bool:
        """
        Determine if more questions are needed or if we have enough context to generate tasks
        """
        if len(previous_qa) >= 6:  # Maximum 6 questions
            return False
        
        if len(previous_qa) < 3:  # Minimum 3 questions
            return True
            
        # For 3-5 questions, use AI to determine if we need more context
        qa_history = "\n".join([
            f"Q: {qa['question']}\nA: {qa['answer']}"
            for qa in previous_qa
        ])
        
        prompt = f"""
        Engineering problem: "{engineering_problem}"
        
        Questions and answers so far:
        {qa_history}
        
        Based on this conversation, do you have enough information to break this engineering problem into 4-6 specific, actionable tasks? Consider if you understand:
        - The scope and scale
        - Key constraints and requirements  
        - Target users and success criteria
        - Available resources
        - Technical approach needed
        
        Respond with only "YES" if you have enough information, or "NO" if you need more context.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert project manager determining if you have enough context to break down engineering problems."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=10
            )
            
            answer = response.choices[0].message.content.strip().upper()
            print(f"AI assessment of information sufficiency: {answer}")
            return answer == "NO"
            
        except Exception as e:
            print(f"Error determining if more questions needed: {e}")
            # Fallback: ask 4-5 questions total
            return len(previous_qa) < 4
    
    def generate_tasks(self, engineering_problem: str, questions_and_answers: List[Dict]) -> List[Dict]:
        """
        Generate actionable tasks based on the engineering problem and Q&A
        """
        qa_text = "\n".join([
            f"Q: {qa['question']}\nA: {qa['answer']}"
            for qa in questions_and_answers
        ])
        
        prompt = f"""
        You are an AI assistant that decomposes complex engineering problems into specific, actionable tasks.
        
        Engineering Problem:
        "{engineering_problem}"
        
        Additional Context from Q&A:
        {qa_text}
        
        Based on this information, generate 4-6 specific, actionable tasks that different people could work on to solve this engineering problem.
        
        For each task, provide:
        - title: Clear, specific task title
        - description: Detailed description of what needs to be done
        - difficulty: "Beginner", "Intermediate", or "Advanced"
        - estimated_hours: Time range like "8-12 hours"
        - skills: Array of 2-4 required skills
        - reward_credits: Number between 50-500 based on difficulty and time
        
        Return ONLY a JSON array of task objects, no additional text.
        Example format:
        [
          {{
            "title": "Research existing solutions",
            "description": "Conduct comprehensive research on...",
            "difficulty": "Beginner",
            "estimated_hours": "8-12 hours",
            "skills": ["Research", "Analysis", "Documentation"],
            "reward_credits": 150
          }}
        ]
        
        Make sure tasks are:
        - Specific and actionable
        - Can be done independently
        - Cover different aspects of the problem
        - Suitable for different skill levels
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert project manager who breaks down complex engineering projects into manageable tasks."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            tasks_text = response.choices[0].message.content.strip()
            tasks = json.loads(tasks_text)
            print(f"AI generated {len(tasks)} tasks")
            return tasks
            
        except Exception as e:
            print(f"Error generating tasks: {e}")
            # Fall through to fallback tasks
        
        # Fallback tasks
        return [
            {
                "title": f"Research Phase: {engineering_problem.split(' ')[:3]}",
                "description": "Conduct comprehensive research on existing solutions, technologies, and methodologies.",
                "difficulty": "Beginner",
                "estimated_hours": "8-12 hours",
                "skills": ["Research", "Analysis", "Documentation"],
                "reward_credits": 150
            },
            {
                "title": "Design & Planning: System Architecture",
                "description": "Create detailed system design, specifications, and implementation roadmap.",
                "difficulty": "Intermediate", 
                "estimated_hours": "15-20 hours",
                "skills": ["System Design", "Planning", "Technical Writing"],
                "reward_credits": 250
            },
            {
                "title": "Prototype Development",
                "description": "Build initial prototype or proof-of-concept based on research and design.",
                "difficulty": "Advanced",
                "estimated_hours": "20-30 hours", 
                "skills": ["Programming", "Engineering", "Problem Solving"],
                "reward_credits": 400
            }
        ]

# Initialize the AI service
ai_service = AITaskGenerator()

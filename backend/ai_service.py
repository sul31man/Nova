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

    def generate_learning_plan(self, inputs: Dict) -> Dict:
        """Generate a structured, step-by-step learning plan.

        Expected inputs keys:
          - interests: str
          - target_skills: List[str] or comma-separated str
          - timeframe_weeks: int
          - hours_per_week: int
          - starting_level: str (beginner/intermediate/advanced)
          - modality: str (video/text/project/mixed)
        """
        # Normalize inputs
        interests = inputs.get('interests', '')
        target_skills = inputs.get('target_skills', [])
        if isinstance(target_skills, str):
            target_skills = [s.strip() for s in target_skills.split(',') if s.strip()]
        timeframe_weeks = max(1, int(inputs.get('timeframe_weeks', 4)))
        hours_per_week = max(1, int(inputs.get('hours_per_week', 5)))
        starting_level = inputs.get('starting_level', 'beginner')
        modality = inputs.get('modality', 'mixed')

        prompt = f"""
        You are an elite learning architect. Build a SPOON-FED, step-by-step plan to upskill a learner.

        Constraints and preferences:
        - Interests: {interests}
        - Target skills: {', '.join(target_skills) if target_skills else 'N/A'}
        - Timeframe (weeks): {timeframe_weeks}
        - Hours per week: {hours_per_week}
        - Starting level: {starting_level}
        - Preferred modality: {modality}

        Requirements:
        - Split into weeks (Week 1..N) with daily or session-sized tasks.
        - Each task must be short, explicit and actionable (no vague study).
        - Include concrete resources per task (URL titles with short descriptions; generic if unsure).
        - Include quick checks/mini-assessments at the end of each week.
        - Include 1 small project per week that compounds toward a capstone in the final week.
        - Keep language concise, directive, and motivating.
        - Assume typical web-accessible free resources when possible.

        Return ONLY valid JSON with this schema:
        {{
          "summary": {{
            "objective": str,
            "duration_weeks": int,
            "weekly_hours": int,
            "recommended_stack": [str]
          }},
          "weeks": [
            {{
              "week": int,
              "theme": str,
              "sessions": [
                {{
                  "title": str,
                  "duration_hours": number,
                  "tasks": [str],
                  "resources": [{{"title": str, "url": str}}]
                }}
              ],
              "mini_assessment": [str],
              "project": {{"title": str, "description": str, "acceptance_criteria": [str]}}
            }}
          ],
          "capstone": {{"title": str, "description": str, "acceptance_criteria": [str]}}
        }}
        """

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a world-class curriculum designer who creates explicit, step-by-step plans."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=2500
            )
            raw = response.choices[0].message.content.strip()
            plan = json.loads(raw)
            return plan
        except Exception as e:
            print(f"Error generating learning plan: {e}")
            # Minimal fallback
            return {
                "summary": {
                    "objective": "Focused upskilling plan",
                    "duration_weeks": timeframe_weeks,
                    "weekly_hours": hours_per_week,
                    "recommended_stack": target_skills[:3]
                },
                "weeks": [
                    {
                        "week": 1,
                        "theme": "Foundations",
                        "sessions": [
                            {
                                "title": "Core Concepts",
                                "duration_hours": min(2, hours_per_week),
                                "tasks": ["Read a primer", "Complete a quick tutorial"],
                                "resources": [
                                    {"title": "Free Intro Resource", "url": "https://developer.mozilla.org/"}
                                ]
                            }
                        ],
                        "mini_assessment": ["Explain core ideas in your own words"],
                        "project": {"title": "Mini Project 1", "description": "Apply the basics.", "acceptance_criteria": ["Runs", "Meets basic spec"]}
                    }
                ],
                "capstone": {"title": "Capstone", "description": "Integrate everything.", "acceptance_criteria": ["Meets brief", "Deployed/demoable"]}
            }

    def generate_chat_response(self, user_message: str, context: Dict) -> str:
        """Generate contextual AI chat response for learning assistance"""
        
        # Extract context information
        current_project = context.get('project', {})
        current_step = context.get('current_step', '')
        current_code = context.get('current_code', '')
        file_name = context.get('file_name', '')
        
        # Build context-aware prompt
        context_info = ""
        if current_project:
            context_info += f"Working on project: {current_project.get('title', 'Unknown')}\n"
            context_info += f"Project description: {current_project.get('description', '')}\n"
        
        if current_step:
            context_info += f"Current step: {current_step}\n"
        
        if current_code and len(current_code.strip()) > 0:
            context_info += f"Current code in {file_name}:\n```\n{current_code[:500]}...\n```\n"
        
        prompt = f"""
        You are a patient, encouraging AI tutor helping someone learn to code. 
        
        Context:
        {context_info}
        
        User's question: "{user_message}"
        
        Guidelines:
        - Be extremely beginner-friendly and encouraging
        - Explain concepts simply, like you're talking to someone new to programming
        - Give specific, actionable advice
        - If they're stuck, provide a small hint or next step, not the full solution
        - If they ask about errors, help them understand what went wrong
        - Always be positive and supportive
        - Keep responses concise but helpful (2-3 sentences max)
        - Use simple language, avoid jargon
        
        Respond as a helpful tutor:
        """

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a patient, encouraging coding tutor who explains things simply and keeps learners motivated."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating chat response: {e}")
            # Friendly fallback responses
            fallback_responses = [
                "I'm here to help! Can you tell me more about what you're trying to do?",
                "That's a great question! Let's break this down step by step.",
                "Don't worry, coding can be tricky at first. What specific part is confusing?",
                "You're doing great! Programming takes practice. What would you like to work on?",
                "I'm having trouble right now, but keep going! You can also try the hint button for help."
            ]
            import random
            return random.choice(fallback_responses)

    def generate_character_report(self, profile: Dict, inputs: Dict) -> Dict:
        """Generate a concise character/skills report to help pairing.

        profile: current user profile stored in DB (username, full_name, bio, skills, etc.)
        inputs: additional free-text + survey answers from the UI
        """
        # Compose a compact context
        summary = {
            'name': profile.get('full_name') or profile.get('username'),
            'bio': profile.get('bio', ''),
            'skills': profile.get('skills', []),
            'credits': profile.get('credits', 0),
        }
        # Normalize inputs
        free_text = inputs.get('about', '')
        interests = inputs.get('interests', '')
        years_experience = inputs.get('years_experience', '')
        preferred_roles = inputs.get('preferred_roles', '')
        notable_projects = inputs.get('projects', '')

        prompt = f"""
        You are matching learners and contributors to the best projects, peers and study tracks.
        Given this profile and answers, produce a concise JSON report with:
        - strengths: 4-6 short bullet strings
        - growth_areas: 3-5 short bullet strings
        - technical_profile: {{ primary_stack: [str], secondary_stack: [str], seniority: one of ['junior','mid','senior'] }}
        - interests: [str]
        - estimated_age_bracket: one of ['<18','18-24','25-34','35-44','45+','unknown'] (do not guess if unclear)
        - character_traits: [str] (e.g., 'analytical', 'collaborative', 'self-directed')
        - pairing_recommendations: {{ education: [str], tasks: [str], teammates: [str] }}
        - confidence: number 0-1 representing confidence in the assessment

        Profile:
        {json.dumps(summary, ensure_ascii=False)}

        Answers:
        about: {free_text}
        interests: {interests}
        years_experience: {years_experience}
        preferred_roles: {preferred_roles}
        projects: {notable_projects}

        Return ONLY valid JSON matching the schema.
        """

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You create pragmatic, compact talent snapshots for team formation and learning paths."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=900
            )
            raw = response.choices[0].message.content.strip()
            return json.loads(raw)
        except Exception as e:
            print(f"Error generating character report: {e}")
            # Fallback lightweight report
            skills = summary.get('skills') or []
            return {
                "strengths": skills[:5] or ["Curious", "Self-starter"],
                "growth_areas": ["Structured problem decomposition", "Testing discipline"],
                "technical_profile": {
                    "primary_stack": skills[:3],
                    "secondary_stack": skills[3:6],
                    "seniority": "junior"
                },
                "interests": [w.strip() for w in interests.split(',') if w.strip()] or [],
                "estimated_age_bracket": "unknown",
                "character_traits": ["collaborative", "analytical"],
                "pairing_recommendations": {
                    "education": ["Project-led learning with weekly checkpoints"],
                    "tasks": ["Well-scoped beginner/intermediate issues"],
                    "teammates": ["Pair with a mid/senior mentor"]
                },
                "confidence": 0.35
            }

# Initialize the AI service
ai_service = AITaskGenerator()

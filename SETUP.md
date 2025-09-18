# Nova Setup Guide

## Environment Variables Setup

### 1. Backend Environment Variables

Before running the backend, you need to set up your environment variables:

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit the .env file** and add your actual API key:
   ```bash
   # OpenAI API Configuration
   OPENAI_API_KEY=your_actual_openai_api_key_here
   
   # Flask Configuration  
   FLASK_ENV=development
   FLASK_DEBUG=True
   
   # Database Configuration
   DATABASE_PATH=nova.db
   ```

3. **Get your OpenAI API Key:**
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy and paste it into your `.env` file

### 2. Running the Application

**Backend:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Git Safety

The `.env` file is automatically ignored by git (listed in `.gitignore`), so your API keys will never be accidentally committed to version control.

**Files that are safe to commit:**
- `.env.example` - Template file with placeholder values
- All source code files
- Configuration files (without sensitive data)

**Files that are ignored:**
- `.env` - Contains your actual API keys
- `nova.db` - Database file
- `node_modules/` - Dependencies
- `.venv/` - Python virtual environment

### 4. Deployment

For production deployment, set environment variables using your hosting platform's environment variable system rather than `.env` files.

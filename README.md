# React + Flask Starter

A minimal full-stack starter: Vite + React frontend and Flask backend, wired with a dev proxy. The React app calls a sample Flask endpoint at `/api/hello`.

## Prerequisites
- Python 3.9+
- Node.js 18+

## Backend (Flask)
- Create a virtualenv and install deps:
  - macOS/Linux:
    - `python3 -m venv .venv`
    - `source .venv/bin/activate`
  - Windows (PowerShell):
    - `py -3 -m venv .venv`
    - `.venv\\Scripts\\Activate.ps1`
- Install requirements: `pip install -r backend/requirements.txt`
- Run the server: `python backend/app.py`
- API available at: `http://127.0.0.1:5000/api/hello`

## Frontend (React + Vite)
- From `frontend/`, install deps: `npm install`
- Start dev server: `npm run dev`
- Open the app: Vite will print a local URL (default `http://127.0.0.1:5173`).

The Vite dev server proxies `/api` requests to Flask (`http://127.0.0.1:5000`) so no extra CORS setup is needed during development.

## Project Structure
- `backend/app.py` — Flask app with `/api/hello`
- `backend/requirements.txt` — Python dependencies
- `frontend/` — Vite + React app
  - `vite.config.js` — dev server proxy to Flask
  - `src/App.jsx` — demo fetch from `/api/hello`

## Notes
- If you prefer not to install `flask-cors`, the Vite proxy avoids CORS issues in dev. If you call Flask directly from another origin, install `flask-cors` (already listed) or set CORS headers yourself.
- To build the frontend for production: `npm run build` in `frontend/`. This produces `frontend/dist/` which you can serve behind any web server or integrate with Flask static hosting if desired.

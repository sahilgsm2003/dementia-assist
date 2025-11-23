# Moments - Personal Life Assistant

A comprehensive personal life assistant application that helps users manage memories, people, places, medications, reminders, and more. Built with FastAPI backend and React TypeScript frontend.

## Features

- **Memory Management** - Store and retrieve important memories and documents
- **People Management** - Keep track of family members and relationships
- **Location Services** - Save places and get directions using Mapbox
- **Medication Tracking** - Manage medications and schedules
- **Reminders** - Set and track important reminders
- **Secure Authentication** - JWT-based authentication system
- **Interactive Maps** - Mapbox integration for location visualization

## Tech Stack

### Backend

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (can be configured for PostgreSQL)
- **Google Gemini AI** - For RAG (Retrieval Augmented Generation)
- **FAISS** - Vector similarity search
- **JWT** - Authentication tokens

### Frontend

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Mapbox GL JS** - Interactive maps
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download Git](https://git-scm.com/downloads)

## Project Structure

```
major-project/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── core/           # Configuration and settings
│   │   ├── db/             # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── migrations/         # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # Application entry point
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── lib/           # Utility functions
│   ├── package.json       # Node.js dependencies
│   └── vite.config.ts     # Vite configuration
└── README.md              # This file
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd major-project
```

### 2. Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2: Create Virtual Environment

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# Windows
copy env_example.txt .env

# macOS/Linux
cp env_example.txt .env
```

#### Step 5: Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Database (SQLite by default, can be changed to PostgreSQL)
DATABASE_URL=sqlite:///./family_recognition.db

# Security - IMPORTANT: Change this in production!
SECRET_KEY=your-super-secret-key-change-this-in-production

# JWT Configuration
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini API Key (Required for RAG features)
GEMINI_API_KEY=your-gemini-api-key-here

# RAG Configuration
FAISS_INDEX_PATH=./faiss_indexes
CHUNK_SIZE=1000
MAX_CONTEXT_LENGTH=3000
SIMILARITY_THRESHOLD=0.7
```

**Important Notes:**

- Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Change `SECRET_KEY` to a random secure string in production
- For PostgreSQL, change `DATABASE_URL` to: `postgresql://user:password@localhost/dbname`

#### Step 6: Initialize Database

The database will be created automatically when you run the server. If you need to run migrations:

```bash
python -m app.migrations.verify_schema
```

#### Step 7: Run Backend Server

```bash
# From the backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: `http://localhost:8000`

API documentation will be available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. Frontend Setup

#### Step 1: Navigate to Frontend Directory

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Create Environment File

Create a `.env` file in the `frontend` directory:

# macOS/Linux
touch .env
```

#### Step 4: Configure Environment Variables

Edit the `frontend/.env` file:

```env
# Mapbox Access Token (Required for map features)
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token-here

# API Base URL (defaults to /api if not set)
VITE_API_BASE_URL=http://localhost:8000
```

**Important Notes:**

- Get your Mapbox access token from [Mapbox Account](https://account.mapbox.com/access-tokens/)
- The token should start with `pk.eyJ...`
- For production, update `VITE_API_BASE_URL` to your production API URL

#### Step 5: Run Frontend Development Server

```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`
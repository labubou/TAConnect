# 🚀 Setup Guide

## Prerequisites
- **Docker & Docker Compose** – [Install Docker](https://docs.docker.com/get-docker/)
- **Git** – [Install Git](https://git-scm.com/downloads)

## Initial Setup

Before running the project, copy the environment example file:

**Linux/Mac:**
```bash
cp backend/ta_connect/.env.example backend/ta_connect/.env
```

**Windows (Command Prompt):**
```cmd
copy backend\ta_connect\.env.example backend\ta_connect\.env
```

**Windows (PowerShell):**
```powershell
Copy-Item backend\ta_connect\.env.example backend\ta_connect\.env
```

Then edit `backend/ta_connect/.env` with your configuration.

## Setup with Docker (Recommended)

```bash
git clone https://github.com/Kbassem10/TAConnect.git
cd TAConnect
docker compose up --build
```

Access Points:
- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- Swagger Docs → http://localhost:8000/swagger/
- Django Admin → http://localhost:8000/admin/

---

## 🧰 Manual Setup (Alternative)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```


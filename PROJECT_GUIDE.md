# 🛠️ TAConnect Project Guide

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** – [Install Docker](https://docs.docker.com/get-docker/)
- **Git** – [Install Git](https://git-scm.com/downloads)

### Initial Setup

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

### Setup with Docker (Recommended)

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

---

## 📘 API Documentation (Swagger)

TAConnect automatically generates Swagger/OpenAPI docs for every backend endpoint.

- Interactive Docs: http://localhost:8000/swagger
- Raw Schema: http://localhost:8000/swagger.json

### JWT Authorization in Swagger

**Step-by-step guide:**

1. **Login to get your token:**
   - In Swagger UI, find the `POST /api/auth/login/` endpoint
   - Click "Try it out"
   - Enter your credentials:
     ```json
     {
       "username": "your_username",
       "password": "your_password"
     }
     ```
   - Click "Execute"
   - Copy the `access` token from the response (without quotes)

2. **Authorize Swagger:**
   - Click the **"Authorize"** button (🔓 icon) at the top right of the Swagger page
   - In the popup, enter **exactly** (including the space after "Bearer"):
     ```
     Bearer <paste_your_access_token_here>
     ```
   - Example:
     ```
     Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM...
     ```
   - Click **"Authorize"**
   - Click **"Close"**

3. **Use protected endpoints:**
   - The 🔓 icon should now show as 🔒
   - All requests will automatically include your Bearer token
   - If you get 401 errors, your token may have expired - login again to get a new one

**Important Notes:**
- Access tokens expire after **60 minutes**
- Include the word "Bearer" followed by a **space** before your token
- Don't include quotes around the token
- For security, never share your tokens

**Token Refresh:**
If your access token expires, use the `POST /api/auth/token/refresh/` endpoint with your refresh token to get a new access token without logging in again.

All new endpoints appear in Swagger automatically after commits.

---

## 📝 Code of Conduct

Please read our Code of Conduct to understand community expectations and maintain a respectful, collaborative environment.

---

## 👥 Contributing

We welcome contributions!

Steps to Contribute:
```bash
# Create a feature branch
git checkout -b feature/new-feature

# Implement and test your changes

# Commit
git commit -m "Add: new scheduling feature"

# Push
git push origin feature/new-feature
```
- Open a Pull Request describing your changes.

Branch naming:
- Backend → feature/backend/<name>
- Frontend → feature/frontend/<name>

---

## 🧪 Testing

Backend:
```bash
pytest
# or
python manage.py test
```

Frontend:
```bash
npm test
```

---

## 🧱 Development Workflow

- Parallel development via separate frontend and backend branches.
- Every backend endpoint is documented automatically in Swagger.
- Docker Compose ensures a consistent local and production-like environment.
- GitHub Actions runs builds, tests, and linting.

---

## 🧬 Continuous Integration (CI)

GitHub Actions runs backend and frontend test suites automatically on every PR and on pushes to main.

---

## ⚙️ Environment Variables

Make sure to configure .env files for both the backend and frontend.

Backend (.env):
```
# Option A: Single DATABASE_URL
DATABASE_URL=postgres://ta_connect_user:ta_connect_password@localhost:5432/ta_connect_db

# Or Option B: Separate DB vars (used by Docker)
DB_HOST=db
DB_PORT=5432
DB_NAME=ta_connect_db
DB_USER=ta_connect_user
DB_PASSWORD=ta_connect_password

SECRET_KEY=change-me
JWT_SECRET=change-me
DEBUG=1
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Frontend:
```
# Vite projects use VITE_*
VITE_API_URL=http://localhost:8000

# If you’re using CRA, use:
REACT_APP_API_URL=http://localhost:8000
```

---

## 🧩 Folder Structure

```
TAConnect/
│
├── backend/
│   ├── ta_connect/             # Django project root
│   │   ├── accounts/           # Django app: user accounts
│   │   ├── scheduler/          # Django app: scheduling logic
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── settings_test.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── asgi.py
│   │   └── ...
│   ├── requirements.txt
│   ├── manage.py
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── ta_connect/             # React app root (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── pages/
│   │   │   ├── config/
│   │   │   └── index.css
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── vite.config.js
│   │   ├── Dockerfile
│   │   └── ...
│   └── ...
│
├── docker-compose.yml
├── TAConnect_full_project_plan.csv
├── README.md
├── PROJECT_GUIDE.md
├── LICENSE.md
└── ...
```

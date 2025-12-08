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

### Generate Encryption Key

The project uses `django-encrypted-model-fields` for encrypting sensitive data. You must generate a Fernet encryption key:

**Install the package (if not using Docker):**
```bash
pip install django-encrypted-model-fields
```

**Generate the key:**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

**Add to your `.env` file:**
```env
FIELD_ENCRYPTION_KEY='your-generated-key-here'
```

> ⚠️ **Important:** Keep this key secure and never commit it to version control. If you lose this key, encrypted data cannot be recovered.

### Generate VAPID Keys (Push Notifications)

TAConnect uses Web Push API for real-time browser notifications. You need to generate VAPID (Voluntary Application Server Identification) keys.

**Option 1: Using web-push (Node.js):**
```bash
npm install -g web-push
web-push generate-vapid-keys
```

**Option 2: Using py-vapid (Python):**
```bash
pip install py-vapid
vapid --gen
```

**Add to your backend `.env` file:**
```env
VAPID_PUBLIC_KEY='your-generated-public-key'
VAPID_PRIVATE_KEY='your-generated-private-key'
```

**Add to your frontend `.env` file (create if not exists):**
```env
VITE_VAPID_PUBLIC_KEY='your-generated-public-key'
```

> ⚠️ **Important:** The `VITE_VAPID_PUBLIC_KEY` in frontend must match `VAPID_PUBLIC_KEY` in backend.

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
```

**Generate encryption key:**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Add the generated key to your `.env` file as `FIELD_ENCRYPTION_KEY`.

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Frontend Environment (Optional)

Create `frontend/ta_connect/.env` for push notifications:
```bash
cp frontend/ta_connect/.env.example frontend/ta_connect/.env
```

Edit the file and set `VITE_VAPID_PUBLIC_KEY` to match your backend's `VAPID_PUBLIC_KEY`.


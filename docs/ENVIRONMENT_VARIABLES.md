# ⚙️ Environment Variables

Make sure to configure .env files for both the backend and frontend.

## Backend (.env)

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

## Frontend

```
# Vite projects use VITE_*
VITE_API_URL=http://localhost:8000

# If you're using CRA, use:
REACT_APP_API_URL=http://localhost:8000
```


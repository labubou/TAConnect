# ⚙️ Environment Variables

Make sure to configure .env files for both the backend and frontend.

## Backend (.env)

```env
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

# Email configuration
MAIL_PASSWORD=your-email-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Field Encryption (required)
# Generate: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
FIELD_ENCRYPTION_KEY=your-generated-fernet-key

# Push Notifications (VAPID keys)
# Generate: npm install -g web-push && web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

## Frontend (.env)

```env
# Vite projects use VITE_* prefix
VITE_API_URL=http://localhost:8000

# Push Notifications
# Must match VAPID_PUBLIC_KEY from backend
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

## Generating Required Keys

### Encryption Key (Backend)
```bash
pip install django-encrypted-model-fields
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### VAPID Keys (Push Notifications)
```bash
# Using Node.js
npm install -g web-push
web-push generate-vapid-keys

# Or using Python
pip install py-vapid
vapid --gen
```

> ⚠️ **Note:** VAPID keys must be shared between frontend and backend. The public key goes in both `.env` files, while the private key stays only in the backend.


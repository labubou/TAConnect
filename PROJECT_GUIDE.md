# 🛠️ TAConnect Project Guide

Welcome to the **TAConnect Technical Documentation**. TAConnect is a **fully self-hostable** platform that you can deploy on your own infrastructure. This guide covers everything you need to set up, develop, test, and contribute to the project.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/SETUP.md) | Prerequisites, Docker & manual installation |
| [API Documentation](docs/API_DOCUMENTATION.md) | Swagger/OpenAPI & JWT authorization |
| [Environment Variables](docs/ENVIRONMENT_VARIABLES.md) | Backend & frontend configuration |
| [Folder Structure](docs/FOLDER_STRUCTURE.md) | Project organization |
| [Testing Guide](docs/TESTING.md) | Running & writing tests |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute |

---

## 🚀 Quick Start

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/downloads)

### Setup

```bash
git clone https://github.com/Kbassem10/TAConnect.git
cd TAConnect
cp backend/ta_connect/.env.example backend/ta_connect/.env
```

**Generate the encryption key:**
```bash
pip install django-encrypted-model-fields
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Add the generated key to `backend/ta_connect/.env` as `FIELD_ENCRYPTION_KEY`.

**Generate VAPID keys for push notifications:**
```bash
npm install -g web-push
web-push generate-vapid-keys
```

Add the keys to your environment files:
- `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` → `backend/ta_connect/.env`
- `VITE_VAPID_PUBLIC_KEY` (same as public key) → `frontend/ta_connect/.env`

```bash
docker compose up --build
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/swagger/ |
| Django Admin | http://localhost:8000/admin/ |

---

## 🧪 Testing

TAConnect includes **~128 tests** covering models, views, and serializers.

```bash
# Run all tests
docker exec taconnect-backend-1 python manage.py test

# Run specific app
docker exec taconnect-backend-1 python manage.py test accounts

# Verbose output
docker exec taconnect-backend-1 python manage.py test --verbosity=2
```

See [Testing Guide](docs/TESTING.md) for comprehensive documentation.

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "Add: your feature"
git push origin feature/your-feature
```

See [Contributing Guide](docs/CONTRIBUTING.md) for details.

---

## 🏠 Self-Hosting

TAConnect is designed to be **100% self-hostable**. You can deploy it on:
- Your own servers
- Cloud providers (AWS, Azure, GCP, DigitalOcean, etc.)
- Your institution's infrastructure
- Any environment where you have control

All data stays on your servers - no external dependencies or vendor lock-in. See the [Setup Guide](docs/SETUP.md) for deployment instructions.

## 📖 Additional Resources

- [README.md](README.md) – Project overview and self-hosting information
- [LICENSE.md](LICENSE.md) – License information (free to use, not to sell)

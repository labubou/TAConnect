# 🛠️ TAConnect Project Guide

Welcome to the **TAConnect Technical Documentation**. This guide covers everything you need to set up, develop, test, and contribute to the project.

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

## 📖 Additional Resources

- [README.md](README.md) – Project overview
- [LICENSE.md](LICENSE.md) – License information

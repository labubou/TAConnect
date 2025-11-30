<div align="center">

# 🎓 TAConnect

### Smart Office Hours & Scheduling Platform

[![Project Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)](https://github.com/Kbassem10/TAConnect)
[![License](https://img.shields.io/badge/License-AGPL--3.0%20%2F%20Commercial-blue?style=for-the-badge)](LICENSE.md)
[![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**Simplify academic scheduling. Connect TAs with students. Maximize learning.**

[Quick Start](#-quick-start) •
[Features](#-features) •
[Documentation](#-documentation) •
[Contributing](#-contributing)

</div>

---

## 📖 About

**TAConnect** is an open-source platform that streamlines office hours management for Teaching Assistants and students. Built with modern technologies, it offers conflict-free booking, real-time analytics, and a beautiful user experience.

> *"Maximize Your Learning. Minimize the Wait."*

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📅 Smart Scheduling
- Create & manage office hour slots
- Conflict-free booking system
- Buffer time between sessions
- Recurring slot patterns

</td>
<td width="50%">

### 👥 Role-Based Access
- Dedicated TA dashboards
- Student booking interface
- Email verification system
- JWT secure authentication

</td>
</tr>
<tr>
<td width="50%">

### 📊 Analytics & Insights
- Booking trends visualization
- Session completion tracking
- Export bookings as CSV
- Date range filtering

</td>
<td width="50%">

### 🔔 Notifications
- Email on new bookings
- Cancellation alerts
- Booking update notifications
- Customizable preferences

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Modern UI/UX
- Dark/Light theme toggle
- Fully responsive design
- Interactive calendars
- Accessible components

</td>
<td width="50%">

### 🛠️ Developer Friendly
- Swagger API documentation
- Docker one-command setup
- Comprehensive test suite
- Modular architecture

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/downloads)

### Installation

```bash
# Clone the repository
git clone https://github.com/Kbassem10/TAConnect.git
cd TAConnect

# Copy environment file
cp backend/ta_connect/.env.example backend/ta_connect/.env

# Start with Docker (recommended)
docker compose up --build
```

### Access Points

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000 |
| 📚 API Docs (Swagger) | http://localhost:8000/swagger/ |
| 🔧 Django Admin | http://localhost:8000/admin/ |

---

## 🏗️ Tech Stack

<div align="center">

| Frontend | Backend | Database | DevOps |
|:--------:|:-------:|:--------:|:------:|
| React 19 | Django 5 | PostgreSQL | Docker |
| Vite | Django REST | SQLite (tests) | Docker Compose |
| Tailwind CSS | JWT Auth | | GitHub Actions |
| React Query | drf-spectacular | | |
| Recharts | Celery (planned) | | |

</div>

---

## 📚 Documentation

For comprehensive documentation, see **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)**

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/SETUP.md) | Installation & configuration |
| [API Documentation](docs/API_DOCUMENTATION.md) | Swagger/OpenAPI & JWT guide |
| [Environment Variables](docs/ENVIRONMENT_VARIABLES.md) | Configuration reference |
| [Testing Guide](docs/TESTING.md) | Running & writing tests |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute |
| [Folder Structure](docs/FOLDER_STRUCTURE.md) | Project organization |

---

## 🧪 Testing

TAConnect includes a comprehensive test suite with **~128 tests** covering models, views, and serializers.

```bash
# Run all tests
docker exec taconnect-backend-1 python manage.py test

# Run specific app tests
docker exec taconnect-backend-1 python manage.py test accounts
docker exec taconnect-backend-1 python manage.py test instructor
docker exec taconnect-backend-1 python manage.py test student

# Run with verbosity
docker exec taconnect-backend-1 python manage.py test --verbosity=2
```

---

## 👥 Team

<div align="center">

| Role | Name |
|:----:|:----:|
| 🔧 Backend Developer | **Karim Bassem** |
| 🔧 Backend Developer | **Ahmed Fahmy** |
| 🎨 Frontend Developer | **Nadeem Diaa** |
| 🎨 Frontend Developer | **Omar Salama** |

</div>

---

## 🛣️ Roadmap

- [x] Core booking system
- [x] JWT authentication
- [x] Email notifications
- [x] Analytics dashboard
- [x] CSV export
- [x] Dark/Light theme
- [ ] 🔤 Multi-language support (Arabic, French)
- [ ] 📅 Google Calendar integration
- [ ] 📅 Outlook Calendar sync
- [ ] 🧠 AI scheduling assistant
- [ ] 🔗 LMS integrations

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](docs/CONTRIBUTING.md) for details.

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Make changes and commit
git commit -m "Add: your feature description"

# Push and create PR
git push origin feature/your-feature
```

---

## 📄 License

This project uses a **dual-license model**:

- **AGPL-3.0** for academic and non-commercial use
- **Commercial License** for enterprise/proprietary usage

For commercial inquiries: [taconnect.team@outlook.com](mailto:taconnect.team@outlook.com)

See [LICENSE.md](LICENSE.md) for details.

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with ❤️ by the TAConnect Team**

*"Connect better. Schedule smarter. Teach easier."*

</div>

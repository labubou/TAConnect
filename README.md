<div align="center">

# 🎓 TAConnect

### Smart Office Hours & Scheduling Platform

[![Project Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)](https://github.com/Kbassem10/TAConnect)
[![License](https://img.shields.io/badge/License-AGPL--3.0%20%2F%20Commercial-blue?style=for-the-badge)](LICENSE.md)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/b2e725fc-2473-44b9-9e19-16c2b4bf9093/deploy-status)](https://app.netlify.com/projects/taconnect/deploys)

**Simplify academic scheduling. Connect TAs with students. Maximize learning.**

[Features](#-features) •
[Quick Start](#-quick-start) •
[Tech Stack](#-tech-stack) •
[Team](#-team)

</div>

---

## 📖 About

**TAConnect** is an open-source, **fully self-hostable** platform that streamlines office hours management for Teaching Assistants and students. Built with modern technologies, it offers conflict-free booking, real-time analytics, and a beautiful user experience.

> *"Maximize Your Learning. Minimize the Wait."*

### 🏠 100% Self-Hostable - Deploy Anywhere

TAConnect is designed to be **completely self-hostable** with no external dependencies or vendor lock-in. You have full control:

- **Deploy anywhere**: Your own server, cloud provider (AWS, Azure, GCP), or your institution's infrastructure
- **Complete data ownership**: All data stays on your servers - no third-party services required
- **Privacy first**: No tracking, no analytics sent to external services
- **Free to use**: Use it for free for any purpose (academic, personal, or institutional)
- **Easy setup**: One-command Docker deployment or manual installation

Whether you're a university IT department, a small academic institution, or an individual TA, you can run TAConnect on your own infrastructure with complete autonomy. See the [Setup Guide](docs/SETUP.md) for detailed deployment instructions.

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
- Secure authentication

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
- **Push notifications** (real-time browser alerts)

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
- **100% self-hostable** - deploy on your own infrastructure

</td>
</tr>
</table>

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Kbassem10/TAConnect.git
cd TAConnect

# Copy environment file
cp backend/ta_connect/.env.example backend/ta_connect/.env

# Start with Docker
docker compose up --build
```

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000 |
| 📚 API Docs | http://localhost:8000/swagger/ |

> 📘 For detailed setup instructions, see **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)**

---

## 🏗️ Tech Stack

<div align="center">

| Frontend | Backend | Database | DevOps |
|:--------:|:-------:|:--------:|:------:|
| React 19 | Django 5 | PostgreSQL | Docker |
| Vite | Django REST | | Docker Compose |
| Tailwind CSS | JWT Auth | | |
| React Query | drf-spectacular | | |

</div>

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
- [x] Dark/Light theme
- [x] Multi-language support
- [x] Push notifications (Web Push API)
- [ ] Calendar integrations (Google, Outlook)
- [ ] AI scheduling assistant

---

## 📄 License

### Free to Use, Not to Sell

**TAConnect is free to use** for any purpose - academic, personal, institutional, or commercial use within your organization. You can:

- ✅ Use it for free in your institution
- ✅ Deploy it on your own servers
- ✅ Modify and customize it for your needs
- ✅ Share it with others
- ✅ Use it commercially within your organization

**However**, you **cannot**:

- ❌ Sell TAConnect as a product or service to others
- ❌ Resell or redistribute TAConnect as a commercial offering
- ❌ Use TAConnect to provide a competing service to third parties

If you want to sell TAConnect or use it to provide services to others, you need explicit permission. For commercial licensing inquiries: [taconnect.team@gmail.com](mailto:taconnect.team@gmail.com)

**In summary**: Use it freely for your own purposes, but don't sell it without permission.

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with ❤️ by the TAConnect Team**

*"Connect better. Schedule smarter. Teach easier."*

</div>

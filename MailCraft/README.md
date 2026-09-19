# 📬 NewsletterAI

> AI-powered multi-tenant Newsletter Management Platform

A full-stack SaaS platform where organizations can create, manage, optimize and distribute newsletters using AI, while administrators manage the platform and subscribers receive personalized newsletters.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 🏗️ Architecture

```
NewsletterAI/
├── client/                 # React 19 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (shadcn/ui)
│   │   ├── contexts/       # React context providers
│   │   ├── lib/            # Utilities and API client
│   │   └── pages/          # Page components
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/         # App configuration
│   │   ├── middleware/      # Auth, validation, error handling
│   │   └── modules/        # Feature modules
│   │       ├── admin/
│   │       ├── ai/
│   │       ├── analytics/
│   │       ├── auth/
│   │       ├── brandkit/
│   │       ├── campaigns/
│   │       ├── organizations/
│   │       ├── settings/
│   │       ├── subscribers/
│   │       ├── templates/
│   │       └── upload/
│   ├── prisma/             # Database schema & seed
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## ✨ Features

### Core Modules

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT auth with role-based access control (SUPER_ADMIN, ORG_OWNER, ORG_MEMBER) |
| 🏢 **Multi-Tenancy** | Organization isolation with shared database architecture |
| 👥 **Subscriber Management** | CRUD, CSV import, search & pagination |
| ✉️ **Newsletter Builder** | Unlayer drag-and-drop email editor |
| 📋 **Template Library** | Built-in + custom templates with categories |
| 🤖 **AI Studio** | Gemini 2.5 Flash powered: generate, rewrite, grammar, tone, subjects, CTAs |
| 📊 **Analytics** | Recharts dashboards with campaign performance metrics |
| 🎨 **Brand Kit** | Company branding that AI automatically follows |
| 📨 **Campaign Management** | Create, edit, send, and track email campaigns |
| ⚙️ **Settings** | Profile, password, and email configuration |
| 🛡️ **Admin Dashboard** | Platform-wide stats, org management, suspend/restore |

### Security

- **Helmet** – HTTP security headers
- **CORS** – Cross-origin request control
- **Zod** – Request validation
- **bcrypt** – Password hashing
- **Rate Limiting** – API abuse prevention

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL (or Neon)
- Gmail account with App Password (for SMTP)
- Gemini API Key
- Cloudinary account

### 1. Clone & Install

```bash
git clone <repo-url>
cd MailCraft

# Install server dependencies
cd server
cp .env.example .env
# Edit .env with your credentials
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Set Up Database

```bash
cd server
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Start Development

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### 4. Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@newsletterai.com | Admin@123456 |
| Org Owner | owner@acme.com | Owner@123456 |

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Access at http://localhost:3000
```

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite + TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Router DOM v7
- TanStack Query v5
- Axios with JWT interceptors
- Unlayer Email Editor
- Recharts
- Framer Motion

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + bcrypt authentication
- Zod validation
- Google Gemini 2.5 Flash
- Nodemailer + Gmail SMTP
- Cloudinary image storage

### DevOps
- Docker + Docker Compose
- Nginx (production serving)

## 📝 API Endpoints

| Module | Prefix | Key Routes |
|--------|--------|------------|
| Auth | `/api/auth` | POST /register, /login, GET /me, POST /refresh |
| Organizations | `/api/organizations` | GET /, PUT /, GET /members |
| Subscribers | `/api/subscribers` | CRUD + POST /import |
| Campaigns | `/api/campaigns` | CRUD + POST /:id/send |
| Templates | `/api/templates` | CRUD |
| AI | `/api/ai` | POST /generate, /rewrite, /grammar, /tone, /subject, /cta |
| Analytics | `/api/analytics` | GET /dashboard, /campaigns/:id |
| Brand Kit | `/api/brand-kit` | GET /, PUT / |
| Settings | `/api/settings` | GET /, PUT /profile, /password, /organization |
| Upload | `/api/upload` | POST /, DELETE / |
| Admin | `/api/admin` | GET /stats, /organizations, /campaigns + management |

## 📄 License

This project was built for the Buildathon hackathon.

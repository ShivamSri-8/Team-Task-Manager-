# Team Task Manager 🚀

A production-ready full-stack SaaS task management application built with React, Node.js, Express, and MongoDB.

## ✨ Features

- 🔐 JWT Authentication (Signup / Login)
- 👥 Role-Based Access Control (Admin / Member)
- 📋 Project & Task Management
- 📊 Dashboard with live statistics
- 🎨 Premium dark SaaS UI (glassmorphism, red accent, micro-animations)
- ➕ Add Task modal with validation
- 🔍 Task filtering by status & priority

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| HTTP | Axios |

## 📁 Project Structure

```
Team Task Manager/
├── backend/          # Express API
│   ├── src/
│   │   ├── config/   # DB connection
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/   # Mongoose schemas
│   │   ├── routes/
│   │   └── validation/
│   └── server.js
└── frontend/         # React Vite app
    └── src/
        ├── api/      # Axios instance
        ├── components/
        ├── context/  # Auth context
        └── pages/
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### 1. Clone
```bash
git clone https://github.com/ShivamSri-8/Team-Task-Manager-.git
cd Team-Task-Manager-
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access
- Frontend: http://localhost:5173
- API: http://localhost:5000/api

## 🔑 Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

## 📡 API Endpoints

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/projects` | Protected |
| POST | `/api/projects` | Admin |
| GET | `/api/tasks` | Protected |
| POST | `/api/tasks` | Admin |
| GET | `/api/users` | Admin |

## 🎨 Design

Premium SaaS dark UI inspired by Linear and Stripe:
- Black background (`#080808`)
- Red accent (`#ef233c`)
- Glassmorphism cards
- Smooth micro-animations

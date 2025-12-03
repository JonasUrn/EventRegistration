# Game Portal - Complete Setup Guide

## ✅ Integration Complete!

Your frontend is now connected to the backend API. Here's how to get everything running.

---

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will start at **http://localhost:8000**

You can view the API documentation at **http://localhost:8000/docs**

### 2. Setup the Database

1. Start **Laragon** and ensure MySQL is running
2. Open **phpMyAdmin** at http://localhost/phpmyadmin
3. Run the SQL script: [backend/setup_database.sql](backend/setup_database.sql)
   - Creates database `game_portal`
   - Creates all tables with Lithuanian field names
   - Inserts enum values

### 3. Start the Frontend

```bash
npm run dev
```

The frontend will start at **http://localhost:3000**

---

## 📋 What Has Been Integrated

### ✅ Completed Pages

#### Authentication
- **Login** - [app/login/page.tsx](app/login/page.tsx)
  - Uses `POST /api/users/login`
  - Stores JWT token in localStorage

- **Register** - [app/register/page.tsx](app/register/page.tsx)
  - Uses `POST /api/users/register`
  - Sends verification code via `POST /api/users/send-verification-code`
  - Verifies email via `POST /api/users/verify-code`

#### Teams
- **Teams List** - [app/teams/page.tsx](app/teams/page.tsx)
  - Uses `GET /api/teams`

- **Create Team** - [app/teams/create/page.tsx](app/teams/create/page.tsx)
  - Uses `POST /api/teams`
  - Automatically adds creator as Captain

#### Tournaments
- **Tournaments List** - [app/tournaments/page.tsx](app/tournaments/page.tsx)
  - Uses `GET /api/tournaments`

#### Games
- **Games List** - [app/games/page.tsx](app/games/page.tsx)
  - Uses `GET /api/games`
  - Fetches related tournaments

#### Navigation
- **Navigation Component** - [app/components/Navigation.tsx](app/components/Navigation.tsx)
  - Uses authentication from localStorage
  - Handles logout properly

### 🔧 API Client Created

**Location**: [app/lib/api.ts](app/lib/api.ts)

Provides clean API methods for all backend endpoints:
```typescript
import { api } from './lib/api';

// Authentication
await api.auth.login(username, password);
await api.auth.register(userData);

// Teams
const teams = await api.teams.getAll();
await api.teams.create(teamData);

// Tournaments
const tournaments = await api.tournaments.getAll();
await api.tournaments.getReport(id);

// Games
const games = await api.games.getAll();
await api.games.findSimilar(matchId);
```

---

## 🧪 Testing the Integration

### Test Flow

1. **Register a New User**
   - Go to http://localhost:3000/register
   - Fill in all fields (use real email if SMTP configured, or check backend console for code)
   - Submit registration

2. **Verify Email**
   - Check your email for 6-digit code (or backend console)
   - Enter code in verification form
   - Email will be verified

3. **Login**
   - Go to http://localhost:3000/login
   - Use your username and password
   - You'll be redirected to home page

4. **Create a Team**
   - Click "Teams" in navigation
   - Click "Create Team"
   - Fill in team details
   - Team will be created and you'll be added as Captain

5. **Browse Data**
   - View all teams
   - View all tournaments
   - View all games

---

## 🔑 API Authentication

The app uses JWT token authentication:

1. **Login** → Receive access token
2. **Token stored** in `localStorage` as `auth_token`
3. **All requests** include `Authorization: Bearer <token>` header
4. **Token managed** automatically by the API client

---

## 📊 Database Structure

All database columns use **Lithuanian names** exactly as specified in DDL:

| Table | Lithuanian Name | Purpose |
|-------|-----------------|---------|
| Clients | klientai | User accounts |
| Teams | komandos | Teams |
| Team Memberships | komandosNarystes | Team members |
| Tournaments | turnyrai | Tournaments |
| Tournament Participants | turnyroDalyviai | Tournament entries |
| Matches | varzybos | Games/Matches |
| Match Participants | varzybuDalyviai | Match participants |
| Referees | teisejai | Match referees |
| Sponsors | remejai | Sponsors |
| Locations | vietos | Match locations |

---

## 🎯 Available Backend Algorithms

### 1. Offer Team Members
**Endpoint**: `POST /api/teams/offer-members`

Finds 5 most suitable members for a team based on:
- City match (3 points)
- Country match (2 points)
- Birth date similarity (1-3 points)
- Game performance (2-5 points)
- Position history (3-5 points)

### 2. Find Similar Games
**Endpoint**: `POST /api/games/find-similar-games`

Finds 5 similar games based on:
- Average points difference (1-5 points)
- Location distance (3-10 points)

### 3. Tournament Report
**Endpoint**: `GET /api/tournaments/{id}/report`

Generates comprehensive report with:
- Tournament locations
- Average point difference
- Team win percentages
- Top 3 most efficient players

---

## 🔐 Email Verification

### Without SMTP (Development)
The verification code is printed to the backend console:
```
Email sending failed: ...
```
The code is still in the response - use it to verify.

### With SMTP (Production)
Set environment variables in backend:
```bash
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

---

## ⚠️ Remaining Tasks (Optional)

These pages still use demo data and need updating:

1. **Account Page** - [app/account/page.tsx](app/account/page.tsx)
   - Update to use `GET /api/users/me`
   - Update profile editing to use `PUT /api/users/me`

2. **Detail Pages** - Need to fetch individual items:
   - [app/teams/[id]/page.tsx](app/teams/[id]/page.tsx) → `GET /api/teams/{id}`
   - [app/tournaments/[id]/page.tsx](app/tournaments/[id]/page.tsx) → `GET /api/tournaments/{id}`
   - [app/games/[id]/page.tsx](app/games/[id]/page.tsx) → `GET /api/games/{id}`

3. **Create Pages** - For tournaments and games:
   - [app/tournaments/create/page.tsx](app/tournaments/create/page.tsx)
   - Games creation page

---

## 📝 File Structure

```
game-portal/
├── app/
│   ├── lib/
│   │   ├── api.ts           ← Complete API client
│   │   ├── api-config.ts    ← API endpoints
│   │   └── auth.ts          ← Auth utilities
│   ├── login/
│   │   └── page.tsx         ← Connected ✅
│   ├── register/
│   │   └── page.tsx         ← Connected ✅
│   ├── teams/
│   │   ├── page.tsx         ← Connected ✅
│   │   └── create/
│   │       └── page.tsx     ← Connected ✅
│   ├── tournaments/
│   │   └── page.tsx         ← Connected ✅
│   ├── games/
│   │   └── page.tsx         ← Connected ✅
│   └── components/
│       └── Navigation.tsx   ← Connected ✅
├── backend/                 ← Complete backend
│   ├── app.py
│   ├── config.py
│   ├── controllers/         ← 11 controllers
│   ├── classes/             ← 10 domain classes
│   ├── enums/               ← 3 enums
│   └── requirements.txt
├── .env.local               ← Frontend config
└── SETUP_GUIDE.md           ← This file
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Import errors
```bash
pip install -r backend/requirements.txt
```

**Problem**: Database connection failed
- Check Laragon MySQL is running
- Verify database name is `game_portal`
- Check credentials in `backend/config.py`

**Problem**: CORS errors
- Backend has CORS enabled for all origins
- Check backend is running on port 8000

### Frontend Issues

**Problem**: API calls fail with 404
- Check backend is running at http://localhost:8000
- Check `.env.local` has correct URL
- Restart frontend after adding `.env.local`

**Problem**: Login fails with "Email not verified"
- Complete email verification first
- Or manually set `patvirtintas pastas` to TRUE in database

**Problem**: Token expired
- Logout and login again
- Tokens expire after 30 minutes

---

## 🎉 You're Ready!

1. Start backend: `cd backend && python app.py`
2. Start frontend: `npm run dev`
3. Visit: http://localhost:3000
4. Register, verify email, and start testing!

For API documentation: http://localhost:8000/docs

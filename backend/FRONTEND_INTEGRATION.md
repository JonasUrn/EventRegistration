# Frontend Integration Guide

This document explains how to connect the existing frontend to the backend.

## Backend Server

The backend runs on `http://localhost:8000` by default.

CORS is enabled for all origins, so the frontend can make requests from any domain.

## API Base URL

In your frontend configuration, set the API base URL to:

```
http://localhost:8000
```

## Authentication

The backend uses JWT token authentication.

### Login Flow

1. User registers via POST `/api/users/register`
2. Backend sends verification code to email via POST `/api/users/send-verification-code`
3. User verifies email via POST `/api/users/verify-code`
4. User logs in via POST `/api/users/login`
5. Backend returns JWT token in response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": { ... }
}
```

### Making Authenticated Requests

Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints Mapping

### Users/Auth Routes
- Frontend `/register` → Backend `POST /api/users/register`
- Frontend `/login` → Backend `POST /api/users/login`
- Frontend `/verify-email` → Backend `POST /api/users/send-verification-code` and `POST /api/users/verify-code`
- Frontend `/account` → Backend `GET /api/users/me` and `PUT /api/users/me`

### Teams Routes
- Frontend `/teams` → Backend `GET /api/teams`
- Frontend `/teams/:id` → Backend `GET /api/teams/{id}`
- Frontend `/teams/create` → Backend `POST /api/teams`
- Frontend `/teams/:id/edit` → Backend `PUT /api/teams/{id}`
- Frontend `/teams/:id/members` → Backend `GET /api/teams/{id}/members`

### Tournaments Routes
- Frontend `/tournaments` → Backend `GET /api/tournaments`
- Frontend `/tournaments/:id` → Backend `GET /api/tournaments/{id}`
- Frontend `/tournaments/create` → Backend `POST /api/tournaments`
- Frontend `/tournaments/:id/edit` → Backend `PUT /api/tournaments/{id}`

### Games/Matches Routes
- Frontend `/games` → Backend `GET /api/games`
- Frontend `/games/:id` → Backend `GET /api/games/{id}`
- Frontend `/games/create` → Backend `POST /api/games`
- Frontend `/games/:id/edit` → Backend `PUT /api/games/{id}`

### Algorithm Endpoints
- Find similar members → `POST /api/teams/offer-members`
- Find similar games → `POST /api/games/find-similar-games`
- Tournament report → `GET /api/tournaments/{id}/report`

## Response Format

All responses return JSON with Lithuanian field names matching the database schema.

Example client response:
```json
{
  "id_Klientas": 1,
  "vardas": "Jonas",
  "pavarde": "Jonaitis",
  "el_pastas": "jonas@example.com",
  "slapyvardis": "jonas123",
  "salis": "Lietuva",
  "miestas": "Vilnius",
  ...
}
```

## Error Handling

HTTP status codes:
- 200: Success
- 400: Bad request (validation error)
- 401: Unauthorized (invalid token)
- 403: Forbidden (email not verified)
- 404: Not found
- 500: Server error

Error response format:
```json
{
  "detail": "Error message"
}
```

## Testing the API

1. Start the backend server
2. Visit `http://localhost:8000/docs` for interactive API documentation
3. Test endpoints directly from the Swagger UI
4. Use the "Try it out" button on each endpoint

## Example Frontend API Configuration

```javascript
const API_BASE_URL = 'http://localhost:8000';

async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      slapyvardis: username,
      slaptazodis: password
    })
  });

  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
}

async function getTeams() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/teams`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
}
```

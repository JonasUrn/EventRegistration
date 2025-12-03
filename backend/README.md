# Game Portal Backend

Simple Python FastAPI backend for the Game Portal application.

## Requirements

- Python 3.10+
- MySQL (via Laragon)
- phpMyAdmin for database management

## Setup Instructions

### 1. Install Laragon and Start MySQL

1. Install Laragon from https://laragon.org/
2. Start Laragon and enable MySQL service
3. Access phpMyAdmin at http://localhost/phpmyadmin

### 2. Create Database

1. Open phpMyAdmin
2. Create a new database named `game_portal`
3. Run the provided DDL script to create all tables

### 3. Install Python Dependencies

Open terminal in the backend folder and run:

```bash
pip install -r requirements.txt
```

### 4. Configure Database Connection

Edit `config.py` if needed. Default connection string:

```python
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/game_portal"
```

Change username/password if your MySQL has different credentials.

### 5. Run the Application

```bash
python app.py
```

Or with uvicorn:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

API documentation (Swagger UI) at http://localhost:8000/docs

## API Endpoints

### Authentication
- POST `/api/users/register` - Register new user
- POST `/api/users/login` - Login user
- POST `/api/users/send-verification-code` - Send email verification code
- POST `/api/users/verify-code` - Verify email with code

### Account Management
- GET `/api/users/me` - Get current user
- PUT `/api/users/me` - Update account
- GET `/api/users/{user_id}` - Get user by ID

### Teams
- GET `/api/teams` - List all teams
- GET `/api/teams/{team_id}` - Get team details
- POST `/api/teams` - Create team
- PUT `/api/teams/{team_id}` - Update team
- DELETE `/api/teams/{team_id}` - Delete team
- GET `/api/teams/{team_id}/members` - Get team members
- POST `/api/teams/members` - Add member to team
- DELETE `/api/teams/members/{membership_id}` - Remove member
- PUT `/api/teams/{team_id}/members/{membership_id}/role` - Update member role
- POST `/api/teams/offer-members` - Find similar members (algorithm)

### Tournaments
- GET `/api/tournaments` - List all tournaments
- GET `/api/tournaments/{tournament_id}` - Get tournament details
- POST `/api/tournaments` - Create tournament
- PUT `/api/tournaments/{tournament_id}` - Update tournament
- DELETE `/api/tournaments/{tournament_id}` - Delete tournament
- GET `/api/tournaments/{tournament_id}/participants` - Get participants
- POST `/api/tournaments/participants` - Register participant
- DELETE `/api/tournaments/participants/{participant_id}` - Remove participant
- GET `/api/tournaments/{tournament_id}/report` - Generate tournament report (algorithm)

### Matches (Games)
- GET `/api/games` - List all matches
- GET `/api/games/{match_id}` - Get match details
- POST `/api/games` - Create match
- PUT `/api/games/{match_id}` - Update match
- DELETE `/api/games/{match_id}` - Delete match
- GET `/api/games/{match_id}/participants` - Get match participants
- POST `/api/games/participants` - Add match participant
- DELETE `/api/games/participants/{participant_id}` - Remove participant
- PUT `/api/games/participants/{participant_id}` - Update participant
- POST `/api/games/locations` - Add match location
- POST `/api/games/referees` - Add referee
- POST `/api/games/find-similar-games` - Find similar matches (algorithm)

## Project Structure

```
backend/
├── app.py                  # FastAPI application entry point
├── config.py               # Database configuration
├── requirements.txt        # Python dependencies
├── classes/                # Domain model classes (ORM)
│   ├── client.py
│   ├── team.py
│   ├── team_membership.py
│   ├── sponsor.py
│   ├── referee.py
│   ├── tournament.py
│   ├── tournament_participant.py
│   ├── match.py
│   ├── match_participant.py
│   └── location.py
├── enums/                  # Enum definitions
│   ├── format.py
│   ├── sponsor_class.py
│   └── type.py
└── controllers/            # API controllers
    ├── auth_controller.py
    ├── email_verification_controller.py
    ├── account_controller.py
    ├── team_controller.py
    ├── team_edit_controller.py
    ├── tournament_controller.py
    ├── matches_controller.py
    ├── matches_edit_controller.py
    ├── search_similar_members_controller.py
    ├── find_similar_matches_controller.py
    └── report_controller.py
```

## Database Tables

All database field names are in Lithuanian as per the DDL schema:
- klientai (clients)
- komandos (teams)
- komandosNarystes (team memberships)
- remejai (sponsors)
- teisejai (referees)
- turnyrai (tournaments)
- turnyroDalyviai (tournament participants)
- varzybos (matches)
- varzybuDalyviai (match participants)
- vietos (locations)
- formatai (formats)
- remejoKlases (sponsor classes)
- tipai (types)

## Email Configuration

To enable email verification, set environment variables:

```bash
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

## Development Notes

- All SQL column names remain in Lithuanian exactly as in DDL
- Python class names and filenames are in English
- Simple student-level code structure
- No comments in source files
- FastAPI automatic documentation at /docs

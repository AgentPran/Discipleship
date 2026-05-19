# Discipleship App

MVP scaffold for a mentor–mentee matching and care app for cell-model churches.
Human-centred AI: the system suggests, the people decide.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI + SQLAlchemy
- **Database:** SQLite (single file, no install) — can swap to Postgres later
- **Auth:** JWT (email + password)
- **Matching:** Tag-based similarity + complementarity with explainability

---

## Prerequisites

Just two things — no database to install:

1. **Python 3.11+** — check with `python3 --version`
2. **Node.js 18+** and npm — check with `node --version` and `npm --version`

### If you don't have them yet

**macOS:**
```bash
brew install python@3.11 node
```

**Ubuntu / Debian:**
```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip nodejs npm
```

**Windows:**
- Python: https://www.python.org/downloads/ (tick "Add to PATH")
- Node.js: https://nodejs.org/ (LTS version)

---

## Step 1 — Run the backend

From the project root:

```bash
cd backend

# 1. Create a virtual environment
python3 -m venv .venv

# 2. Activate it
# macOS / Linux:
source .venv/bin/activate
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (cmd):
.venv\Scripts\activate.bat

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# (No changes needed — SQLite is the default.)

# 5. Seed the tag library (also creates the SQLite file + tables)
python seed_tags.py

# 6. Run the API server
uvicorn app.main:app --reload --port 8000
```

You should see:
```
Seeded tags. Total in DB: 45
INFO:     Uvicorn running on http://127.0.0.1:8000
```

The API is now running at **http://localhost:8000**.
Open **http://localhost:8000/docs** to see the interactive Swagger documentation.

Your whole database is a single file: **`backend/discipleship.db`**. To reset
everything from scratch, just delete it and re-run `python seed_tags.py`.

---

## Step 2 — Run the frontend

Open a **second terminal** and from the project root:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# (No changes needed — points to localhost:8000 by default.)

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Step 3 — Try it out

1. Click **Register** and create an account.
2. You'll be taken to **Onboarding** — fill in basic details, then pick tags for character, gifts, and the gap you see/need.
3. Register **a second account** (open an incognito window or another browser) and onboard them with different/overlapping tags so you can see matches.
4. On the **Matches** page, switch between "Looking for a mentor" / "Looking for a mentee".
5. Click **Connect** on a match to see the four connection pathways.
6. Create a **group**, post a meeting, react with "amen", check in, and add an action to your **task list**.

### To test the pastoral dashboard

Pastoral access is controlled by `is_pastoral` on the User. For the MVP, mark a user as pastoral directly via SQLite:

```bash
# From the backend folder, with the venv active:
python -c "
from app.database import SessionLocal
from app.models.user import User
db = SessionLocal()
u = db.query(User).filter(User.email == 'your-email@example.com').first()
u.is_pastoral = True
db.commit()
print('Updated:', u.name)
"
```

Or use the SQLite CLI if you have it:
```bash
sqlite3 backend/discipleship.db "UPDATE users SET is_pastoral = 1 WHERE email = 'your-email@example.com';"
```

Then refresh the app — a "Pastoral" link will appear in the nav.

---

## Project structure

```
discipleship-app/
├── backend/                  FastAPI app
│   ├── app/
│   │   ├── main.py           App entry, routes mounted here
│   │   ├── database.py       SQLite + SQLAlchemy setup
│   │   ├── config.py         Environment settings
│   │   ├── models/           SQLAlchemy ORM models
│   │   ├── schemas/          Pydantic request/response models
│   │   ├── routers/          API endpoints by feature
│   │   ├── services/         Matching engine, event logger
│   │   └── core/             Security (JWT), dependencies
│   ├── seed_tags.py          Seed starter tag library
│   ├── requirements.txt
│   ├── discipleship.db       (created on first run)
│   └── .env.example
│
└── frontend/                 React + Vite
    ├── src/
    │   ├── App.jsx           Routes
    │   ├── main.jsx          Entry
    │   ├── pages/            One folder per screen
    │   ├── components/       Reusable UI
    │   ├── api/              Backend API wrappers
    │   ├── store/            Zustand state
    │   └── styles/
    └── package.json
```

---

## Research hooks

The backend logs interactions to the `event_logs` table for later analysis:

- `view_matches` — what the AI suggested
- `create_connection` — which pathway the user chose (autonomy)
- `connection_accepted` / `connection_declined` — outcomes

You can query the SQLite file directly:

```bash
sqlite3 backend/discipleship.db

# Inside the SQLite prompt:
.headers on
.mode column
SELECT pathway, COUNT(*) FROM event_logs WHERE action = 'create_connection' GROUP BY pathway;
SELECT user_id, ai_suggestion, user_decision FROM event_logs WHERE action IN ('view_matches','create_connection');
.quit
```

Or in Python from the backend folder:

```python
from app.database import SessionLocal
from app.models.event_log import EventLog
db = SessionLocal()
for e in db.query(EventLog).all():
    print(e.action, e.pathway, e.user_decision)
```

---

## Switching to PostgreSQL later

When you're ready to deploy or scale up:

1. Install Postgres, create a `discipleship` database
2. In `backend/.env`, change `DATABASE_URL` to your Postgres URL
3. `pip install psycopg2-binary`
4. Run `python seed_tags.py` once on the new DB

Your application code doesn't need to change — SQLAlchemy handles both backends.

---

## Common issues

**`uvicorn: command not found`:** the virtual environment isn't active. Re-run `source .venv/bin/activate`.

**Frontend can't reach the backend:** check that the backend is running on port 8000 and `VITE_API_URL` in `frontend/.env` matches.

**CORS errors:** the backend allows `http://localhost:5173` by default. If you run the frontend on a different port, update `FRONTEND_URL` in `backend/.env` and restart the backend.

**Tags don't appear in onboarding:** you forgot to run `python seed_tags.py`.

**`bcrypt` warning at startup:** harmless on recent versions of passlib; the app still works.

---

## What's in this MVP (vs. what's not)

**Built:**
- Auth, profile (basic + 3 soft dimensions with tags + free text)
- Tag-based matching with similarity + complementarity + explainable reasoning
- Four connection pathways (direct, pastoral, mentor invite, peer recommend)
- Groups, posts (meeting/event/prayer/reflection/praise report), reactions, check-ins
- Task list (the "cart") with action + prayer items, completion flow
- Pastoral dashboard (pending requests + active groups)
- Event logging for research data

**Deliberately left for later:**
- Embeddings / semantic matching (research extension)
- In-app chat (use external messaging)
- Notifications service
- Gamified attendance UI
- Multi-church / multi-org support
- Mobile-native (PWA could be added with `vite-plugin-pwa`)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401 — registers models on Base.metadata
from app.routers import auth, profiles, matching, connections, groups, tasks, pastoral

# Create tables on startup (MVP-friendly; swap to Alembic later).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Discipleship App API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(matching.router)
app.include_router(connections.router)
app.include_router(groups.router)
app.include_router(tasks.router)
app.include_router(pastoral.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "discipleship-app"}

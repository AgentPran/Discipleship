from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.match import MatchSuggestion
from app.services.matching_engine import find_matches
from app.services.event_logger import log_event

router = APIRouter(prefix="/matches", tags=["matching"])


@router.get("/", response_model=List[MatchSuggestion])
def get_matches(
    looking_for: str = Query("mentor", regex="^(mentor|mentee)$"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suggestions = find_matches(db, current_user, looking_for=looking_for, limit=limit)

    # Research log: capture what AI suggested
    log_event(
        db,
        user_id=current_user.id,
        action="view_matches",
        ai_suggestion=[{"user_id": s.user_id, "score": s.overall_score} for s in suggestions],
    )
    return suggestions

import json
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.event_log import EventLog


def log_event(
    db: Session,
    user_id: Optional[int],
    action: str,
    ai_suggestion: Optional[Any] = None,
    user_decision: Optional[Any] = None,
    pathway: Optional[str] = None,
) -> EventLog:
    entry = EventLog(
        user_id=user_id,
        action=action,
        ai_suggestion=json.dumps(ai_suggestion) if ai_suggestion is not None else None,
        user_decision=json.dumps(user_decision) if user_decision is not None else None,
        pathway=pathway,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

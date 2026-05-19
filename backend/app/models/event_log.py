from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from app.database import Base


class EventLog(Base):
    """Captures user interactions with AI suggestions for research analysis."""

    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)  # e.g. 'view_match', 'accept_match', 'override_ai'
    ai_suggestion = Column(Text, nullable=True)  # JSON-as-text of what AI suggested
    user_decision = Column(Text, nullable=True)  # JSON-as-text of what user chose
    pathway = Column(String, nullable=True)  # which connection pathway used
    created_at = Column(DateTime(timezone=True), server_default=func.now())

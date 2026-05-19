from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_post_id = Column(Integer, ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)

    content = Column(Text, nullable=False)
    task_type = Column(String, default="action")  # 'action' | 'prayer'

    # 'pending' | 'completed'
    status = Column(String, default="pending", nullable=False)

    # comma-separated user ids who get notified on completion (MVP shortcut)
    shared_with = Column(String, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

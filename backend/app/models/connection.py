from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from app.database import Base


class ConnectionRequest(Base):
    __tablename__ = "connection_requests"

    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # pathway: 'direct' | 'pastoral' | 'mentor_invite' | 'peer_recommend'
    pathway = Column(String, nullable=False)
    message = Column(Text, default="")

    # status: 'pending' | 'accepted' | 'declined' | 'cancelled'
    status = Column(String, default="pending", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

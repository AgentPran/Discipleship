from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ProfileText(Base):
    __tablename__ = "profile_texts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    character_text = Column(Text, default="")
    gifts_text = Column(Text, default="")
    gap_text = Column(Text, default="")

    user = relationship("User", back_populates="profile_text")

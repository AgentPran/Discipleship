from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    location = Column(String, nullable=True)
    availability = Column(String, nullable=True)  # e.g. "weekday evenings"

    # Role flags — one person can be both
    is_mentor = Column(Boolean, default=False)
    is_mentee = Column(Boolean, default=True)
    is_pastoral = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile_text = relationship("ProfileText", back_populates="user", uselist=False, cascade="all, delete-orphan")
    tags = relationship("UserTag", back_populates="user", cascade="all, delete-orphan")

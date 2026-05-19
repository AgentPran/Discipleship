from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, index=True)  # 'character' | 'gift' | 'gap'
    label = Column(String, nullable=False)

    __table_args__ = (UniqueConstraint("category", "label", name="uq_tag_category_label"),)


class UserTag(Base):
    __tablename__ = "user_tags"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)  # mirrored from Tag for fast filter

    user = relationship("User", back_populates="tags")
    tag = relationship("Tag")

    __table_args__ = (UniqueConstraint("user_id", "tag_id", name="uq_user_tag"),)

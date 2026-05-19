from pydantic import BaseModel
from typing import Literal
from datetime import datetime


PostType = Literal["meeting", "event", "activity", "prayer", "reflection", "praise_report"]


class PostCreate(BaseModel):
    group_id: int
    post_type: PostType
    content: str = ""


class PostOut(BaseModel):
    id: int
    group_id: int
    author_id: int
    author_name: str
    post_type: str
    content: str
    created_at: datetime
    reaction_count: int = 0
    attendance_count: int = 0
    has_attended: bool = False
    has_reacted: bool = False

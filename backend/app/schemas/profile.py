from pydantic import BaseModel
from typing import List, Optional


class TagOut(BaseModel):
    id: int
    category: str
    label: str

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    character_text: Optional[str] = ""
    gifts_text: Optional[str] = ""
    gap_text: Optional[str] = ""
    character_tag_ids: List[int] = []
    gift_tag_ids: List[int] = []
    gap_tag_ids: List[int] = []


class ProfileOut(BaseModel):
    user_id: int
    character_text: str
    gifts_text: str
    gap_text: str
    character_tags: List[TagOut]
    gift_tags: List[TagOut]
    gap_tags: List[TagOut]

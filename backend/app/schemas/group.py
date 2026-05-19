from pydantic import BaseModel
from typing import List
from datetime import datetime


class GroupCreate(BaseModel):
    name: str
    member_ids: List[int] = []


class GroupMemberOut(BaseModel):
    user_id: int
    name: str
    role: str

    class Config:
        from_attributes = True


class GroupOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    members: List[GroupMemberOut] = []

    class Config:
        from_attributes = True

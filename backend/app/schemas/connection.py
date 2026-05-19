from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


Pathway = Literal["direct", "pastoral", "mentor_invite", "peer_recommend"]
Status = Literal["pending", "accepted", "declined", "cancelled"]


class ConnectionCreate(BaseModel):
    to_user_id: int
    pathway: Pathway
    message: Optional[str] = ""


class ConnectionStatusUpdate(BaseModel):
    status: Status


class ConnectionOut(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    pathway: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

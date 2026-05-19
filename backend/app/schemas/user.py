from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    is_mentor: Optional[bool] = None
    is_mentee: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    is_mentor: bool
    is_mentee: bool
    is_pastoral: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

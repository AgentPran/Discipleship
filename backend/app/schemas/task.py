from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import datetime


TaskType = Literal["action", "prayer"]
TaskStatus = Literal["pending", "completed"]


class TaskCreate(BaseModel):
    content: str
    task_type: TaskType = "action"
    source_post_id: Optional[int] = None
    shared_with: List[int] = []


class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    content: Optional[str] = None
    shared_with: Optional[List[int]] = None


class TaskOut(BaseModel):
    id: int
    user_id: int
    source_post_id: Optional[int]
    content: str
    task_type: str
    status: str
    shared_with: List[int]
    created_at: datetime
    completed_at: Optional[datetime] = None

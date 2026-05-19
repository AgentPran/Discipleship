from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _to_out(task: Task) -> TaskOut:
    shared = (
        [int(x) for x in task.shared_with.split(",") if x.strip()]
        if task.shared_with
        else []
    )
    return TaskOut(
        id=task.id,
        user_id=task.user_id,
        source_post_id=task.source_post_id,
        content=task.content,
        task_type=task.task_type,
        status=task.status,
        shared_with=shared,
        created_at=task.created_at,
        completed_at=task.completed_at,
    )


@router.post("/", response_model=TaskOut)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        user_id=current_user.id,
        source_post_id=payload.source_post_id,
        content=payload.content,
        task_type=payload.task_type,
        shared_with=",".join(str(x) for x in payload.shared_with),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _to_out(task)


@router.get("/", response_model=List[TaskOut])
def list_tasks(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Task).filter(Task.user_id == current_user.id)
    if status:
        q = q.filter(Task.status == status)
    return [_to_out(t) for t in q.order_by(Task.created_at.desc()).all()]


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.content is not None:
        task.content = payload.content
    if payload.shared_with is not None:
        task.shared_with = ",".join(str(x) for x in payload.shared_with)
    if payload.status is not None:
        task.status = payload.status
        if payload.status == "completed":
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None

    db.commit()
    db.refresh(task)
    return _to_out(task)


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"deleted": True}

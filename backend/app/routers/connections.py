from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.connection import ConnectionRequest
from app.schemas.connection import ConnectionCreate, ConnectionStatusUpdate, ConnectionOut
from app.services.event_logger import log_event

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("/", response_model=ConnectionOut)
def create_connection(
    payload: ConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.to_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot connect with yourself")

    target = db.query(User).filter(User.id == payload.to_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found")

    req = ConnectionRequest(
        from_user_id=current_user.id,
        to_user_id=payload.to_user_id,
        pathway=payload.pathway,
        message=payload.message or "",
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    log_event(
        db,
        user_id=current_user.id,
        action="create_connection",
        pathway=payload.pathway,
        user_decision={"to_user_id": payload.to_user_id},
    )
    return req


@router.get("/", response_model=List[ConnectionOut])
def list_my_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ConnectionRequest)
        .filter(
            or_(
                ConnectionRequest.from_user_id == current_user.id,
                ConnectionRequest.to_user_id == current_user.id,
            )
        )
        .order_by(ConnectionRequest.created_at.desc())
        .all()
    )


@router.patch("/{connection_id}", response_model=ConnectionOut)
def update_connection_status(
    connection_id: int,
    payload: ConnectionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(ConnectionRequest).filter(ConnectionRequest.id == connection_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Connection not found")

    # Only the recipient can accept/decline; either party can cancel.
    if payload.status in ("accepted", "declined"):
        if req.to_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the recipient can accept/decline")
    elif payload.status == "cancelled":
        if req.from_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the sender can cancel")

    req.status = payload.status
    db.commit()
    db.refresh(req)

    log_event(
        db,
        user_id=current_user.id,
        action=f"connection_{payload.status}",
        pathway=req.pathway,
        user_decision={"connection_id": req.id},
    )
    return req

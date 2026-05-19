from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.core.dependencies import get_pastoral_user
from app.models.user import User
from app.models.connection import ConnectionRequest
from app.models.group import Group
from app.schemas.connection import ConnectionOut
from app.schemas.group import GroupOut, GroupMemberOut
from app.models.group import GroupMember

router = APIRouter(prefix="/pastoral", tags=["pastoral"])


@router.get("/pending-requests", response_model=List[ConnectionOut])
def pending_requests(
    db: Session = Depends(get_db),
    pastoral: User = Depends(get_pastoral_user),
):
    # All pastoral-pathway requests still pending
    return (
        db.query(ConnectionRequest)
        .filter(
            ConnectionRequest.pathway == "pastoral",
            ConnectionRequest.status == "pending",
        )
        .order_by(ConnectionRequest.created_at.desc())
        .all()
    )


@router.get("/active-groups", response_model=List[GroupOut])
def active_groups(
    db: Session = Depends(get_db),
    pastoral: User = Depends(get_pastoral_user),
):
    groups = db.query(Group).order_by(Group.created_at.desc()).all()
    result = []
    for g in groups:
        members = (
            db.query(GroupMember, User)
            .join(User, User.id == GroupMember.user_id)
            .filter(GroupMember.group_id == g.id)
            .all()
        )
        result.append(
            GroupOut(
                id=g.id,
                name=g.name,
                created_at=g.created_at,
                members=[
                    GroupMemberOut(user_id=u.id, name=u.name, role=m.role) for m, u in members
                ],
            )
        )
    return result

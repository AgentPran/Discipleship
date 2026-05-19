from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.group import Group, GroupMember
from app.models.post import Post, PostReaction, Attendance
from app.schemas.group import GroupCreate, GroupOut, GroupMemberOut
from app.schemas.post import PostCreate, PostOut

router = APIRouter(prefix="/groups", tags=["groups"])


def _is_member(db: Session, group_id: int, user_id: int) -> bool:
    return (
        db.query(GroupMember)
        .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
        .first()
        is not None
    )


def _serialize_group(db: Session, group: Group) -> GroupOut:
    members = (
        db.query(GroupMember, User)
        .join(User, User.id == GroupMember.user_id)
        .filter(GroupMember.group_id == group.id)
        .all()
    )
    return GroupOut(
        id=group.id,
        name=group.name,
        created_at=group.created_at,
        members=[
            GroupMemberOut(user_id=u.id, name=u.name, role=m.role) for m, u in members
        ],
    )


@router.post("/", response_model=GroupOut)
def create_group(
    payload: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = Group(name=payload.name)
    db.add(group)
    db.flush()
    db.add(GroupMember(group_id=group.id, user_id=current_user.id, role="mentor"))
    for uid in payload.member_ids:
        if uid != current_user.id:
            db.add(GroupMember(group_id=group.id, user_id=uid, role="mentee"))
    db.commit()
    db.refresh(group)
    return _serialize_group(db, group)


@router.get("/", response_model=List[GroupOut])
def list_my_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    groups = (
        db.query(Group)
        .join(GroupMember, GroupMember.group_id == Group.id)
        .filter(GroupMember.user_id == current_user.id)
        .order_by(Group.created_at.desc())
        .all()
    )
    return [_serialize_group(db, g) for g in groups]


@router.get("/{group_id}", response_model=GroupOut)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_member(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return _serialize_group(db, group)


# ---- Posts ----

@router.post("/{group_id}/posts", response_model=PostOut)
def create_post(
    group_id: int,
    payload: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_member(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    post = Post(
        group_id=group_id,
        author_id=current_user.id,
        post_type=payload.post_type,
        content=payload.content,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _post_to_out(db, post, current_user.id)


@router.get("/{group_id}/posts", response_model=List[PostOut])
def list_posts(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_member(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    posts = (
        db.query(Post).filter(Post.group_id == group_id).order_by(Post.created_at.desc()).all()
    )
    return [_post_to_out(db, p, current_user.id) for p in posts]


@router.post("/{group_id}/posts/{post_id}/react")
def react_to_post(
    group_id: int,
    post_id: int,
    reaction: str = "amen",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_member(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    existing = (
        db.query(PostReaction)
        .filter(
            PostReaction.post_id == post_id,
            PostReaction.user_id == current_user.id,
            PostReaction.reaction == reaction,
        )
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"reacted": False}
    db.add(PostReaction(post_id=post_id, user_id=current_user.id, reaction=reaction))
    db.commit()
    return {"reacted": True}


@router.post("/{group_id}/posts/{post_id}/checkin")
def checkin_post(
    group_id: int,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not _is_member(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    existing = (
        db.query(Attendance)
        .filter(Attendance.post_id == post_id, Attendance.user_id == current_user.id)
        .first()
    )
    if existing:
        return {"checked_in": True, "already": True}
    db.add(Attendance(post_id=post_id, user_id=current_user.id))
    db.commit()
    return {"checked_in": True}


def _post_to_out(db: Session, post: Post, current_user_id: int) -> PostOut:
    author = db.query(User).filter(User.id == post.author_id).first()
    reaction_count = (
        db.query(func.count(PostReaction.id)).filter(PostReaction.post_id == post.id).scalar() or 0
    )
    attendance_count = (
        db.query(func.count(Attendance.id)).filter(Attendance.post_id == post.id).scalar() or 0
    )
    has_attended = (
        db.query(Attendance)
        .filter(Attendance.post_id == post.id, Attendance.user_id == current_user_id)
        .first()
        is not None
    )
    has_reacted = (
        db.query(PostReaction)
        .filter(PostReaction.post_id == post.id, PostReaction.user_id == current_user_id)
        .first()
        is not None
    )
    return PostOut(
        id=post.id,
        group_id=post.group_id,
        author_id=post.author_id,
        author_name=author.name if author else "Unknown",
        post_type=post.post_type,
        content=post.content,
        created_at=post.created_at,
        reaction_count=reaction_count,
        attendance_count=attendance_count,
        has_attended=has_attended,
        has_reacted=has_reacted,
    )

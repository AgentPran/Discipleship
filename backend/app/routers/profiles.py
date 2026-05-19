from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.profile import ProfileText
from app.models.tag import Tag, UserTag
from app.schemas.profile import ProfileUpdate, ProfileOut, TagOut
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(tags=["profiles"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/tags", response_model=List[TagOut])
def list_tags(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Tag)
    if category:
        q = q.filter(Tag.category == category)
    return q.order_by(Tag.category, Tag.label).all()


def _serialize_profile(db: Session, user_id: int) -> ProfileOut:
    profile = db.query(ProfileText).filter(ProfileText.user_id == user_id).first()
    if not profile:
        profile = ProfileText(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    tags_by_cat = {"character": [], "gift": [], "gap": []}
    rows = (
        db.query(Tag)
        .join(UserTag, UserTag.tag_id == Tag.id)
        .filter(UserTag.user_id == user_id)
        .all()
    )
    for t in rows:
        tags_by_cat.setdefault(t.category, []).append(TagOut.model_validate(t))

    return ProfileOut(
        user_id=user_id,
        character_text=profile.character_text or "",
        gifts_text=profile.gifts_text or "",
        gap_text=profile.gap_text or "",
        character_tags=tags_by_cat["character"],
        gift_tags=tags_by_cat["gift"],
        gap_tags=tags_by_cat["gap"],
    )


@router.get("/profile", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _serialize_profile(db, current_user.id)


@router.put("/profile", response_model=ProfileOut)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(ProfileText).filter(ProfileText.user_id == current_user.id).first()
    if not profile:
        profile = ProfileText(user_id=current_user.id)
        db.add(profile)

    profile.character_text = payload.character_text or ""
    profile.gifts_text = payload.gifts_text or ""
    profile.gap_text = payload.gap_text or ""

    # Replace user_tags atomically
    db.query(UserTag).filter(UserTag.user_id == current_user.id).delete()

    def _add_tags(ids: list[int], category: str):
        for tag_id in ids:
            tag = db.query(Tag).filter(Tag.id == tag_id, Tag.category == category).first()
            if not tag:
                raise HTTPException(
                    status_code=400, detail=f"Tag {tag_id} not found in category {category}"
                )
            db.add(UserTag(user_id=current_user.id, tag_id=tag_id, category=category))

    _add_tags(payload.character_tag_ids, "character")
    _add_tags(payload.gift_tag_ids, "gift")
    _add_tags(payload.gap_tag_ids, "gap")

    db.commit()
    return _serialize_profile(db, current_user.id)


@router.get("/users/{user_id}/profile", response_model=ProfileOut)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _serialize_profile(db, user_id)

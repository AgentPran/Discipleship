"""
Seed the tag library.

Run from the backend directory after the DB is up:
    python seed_tags.py
"""

from app.database import SessionLocal, Base, engine
from app.models.tag import Tag
from app import models  # noqa: F401

Base.metadata.create_all(bind=engine)

CHARACTER_TAGS = [
    "compassionate", "analytical", "creative", "patient", "energetic",
    "introverted", "extroverted", "reflective", "encouraging", "loyal",
    "humble", "bold", "joyful", "steady", "playful",
]

GIFT_TAGS = [
    "teaching", "listening", "hospitality", "leadership", "prayer",
    "worship", "evangelism", "administration", "mercy", "discernment",
    "writing", "mentoring-youth", "counseling", "service", "giving",
]

GAP_TAGS = [
    "anxiety", "career-transition", "parenting", "grief", "doubt",
    "identity", "relationships", "loneliness", "purpose", "addiction-recovery",
    "marriage", "singleness", "burnout", "boundaries", "forgiveness",
]


def seed():
    db = SessionLocal()
    try:
        groups = [
            ("character", CHARACTER_TAGS),
            ("gift", GIFT_TAGS),
            ("gap", GAP_TAGS),
        ]
        for category, labels in groups:
            for label in labels:
                exists = (
                    db.query(Tag)
                    .filter(Tag.category == category, Tag.label == label)
                    .first()
                )
                if not exists:
                    db.add(Tag(category=category, label=label))
        db.commit()
        total = db.query(Tag).count()
        print(f"Seeded tags. Total in DB: {total}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

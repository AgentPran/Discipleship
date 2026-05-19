"""
Tag-based mentor-mentee matching engine.

Research-oriented, human-centred AI design:
- Similarity = Jaccard overlap on character + gifts (shared identity)
- Complementarity = mentee's `gap` met by mentor's `gifts` or lived `gap` (experience)
- Reasoning is returned alongside each score so the UI can show *why*
  this match was suggested. The user makes the final call.
"""

from typing import List, Dict, Set, Tuple
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.tag import UserTag, Tag
from app.schemas.match import MatchSuggestion, MatchReasoning


def _jaccard(a: Set[str], b: Set[str]) -> float:
    if not a and not b:
        return 0.0
    return len(a & b) / len(a | b)


def _get_user_tag_labels(db: Session, user_id: int) -> Dict[str, Set[str]]:
    """Return a dict of {category: set(labels)} for the user."""
    rows = (
        db.query(Tag.category, Tag.label)
        .join(UserTag, UserTag.tag_id == Tag.id)
        .filter(UserTag.user_id == user_id)
        .all()
    )
    result: Dict[str, Set[str]] = {"character": set(), "gift": set(), "gap": set()}
    for category, label in rows:
        result.setdefault(category, set()).add(label)
    return result


def _score_pair(
    seeker_tags: Dict[str, Set[str]],
    candidate_tags: Dict[str, Set[str]],
    seeker_is_mentee: bool,
) -> Tuple[float, float, MatchReasoning]:
    """Return (similarity, complementarity, reasoning)."""
    shared_char = seeker_tags["character"] & candidate_tags["character"]
    shared_gift = seeker_tags["gift"] & candidate_tags["gift"]

    similarity = (
        _jaccard(seeker_tags["character"], candidate_tags["character"]) * 0.5
        + _jaccard(seeker_tags["gift"], candidate_tags["gift"]) * 0.5
    )

    # Complementarity: the candidate's strengths (or lived gaps) meet the seeker's gap.
    # If seeker is mentee, look at mentor's gifts + gap.
    # If seeker is mentor, look at mentee's gap (gift fit).
    if seeker_is_mentee:
        complementary = (seeker_tags["gap"] & candidate_tags["gift"]) | (
            seeker_tags["gap"] & candidate_tags["gap"]
        )
        gap_universe = seeker_tags["gap"]
    else:
        complementary = candidate_tags["gap"] & seeker_tags["gift"]
        gap_universe = candidate_tags["gap"]

    complementarity = len(complementary) / len(gap_universe) if gap_universe else 0.0

    reasoning = MatchReasoning(
        shared_character_tags=sorted(shared_char),
        shared_gift_tags=sorted(shared_gift),
        complementary_tags=sorted(complementary),
    )
    return similarity, complementarity, reasoning


def find_matches(
    db: Session,
    user: User,
    looking_for: str = "mentor",  # 'mentor' or 'mentee'
    limit: int = 20,
) -> List[MatchSuggestion]:
    """Return a ranked list of explainable match suggestions for `user`."""
    seeker_tags = _get_user_tag_labels(db, user.id)

    if looking_for == "mentor":
        candidates = db.query(User).filter(User.is_mentor == True, User.id != user.id).all()
        seeker_is_mentee = True
    else:
        candidates = db.query(User).filter(User.is_mentee == True, User.id != user.id).all()
        seeker_is_mentee = False

    suggestions: List[MatchSuggestion] = []
    for candidate in candidates:
        candidate_tags = _get_user_tag_labels(db, candidate.id)
        sim, comp, reasoning = _score_pair(seeker_tags, candidate_tags, seeker_is_mentee)
        overall = round((sim + comp) / 2, 3)

        # Skip zero-matches to keep the feed meaningful for the MVP
        if overall == 0 and not reasoning.complementary_tags and not reasoning.shared_character_tags:
            continue

        suggestions.append(
            MatchSuggestion(
                user_id=candidate.id,
                name=candidate.name,
                age=candidate.age,
                location=candidate.location,
                is_mentor=candidate.is_mentor,
                is_mentee=candidate.is_mentee,
                similarity_score=round(sim, 3),
                complementarity_score=round(comp, 3),
                overall_score=overall,
                reasoning=reasoning,
            )
        )

    suggestions.sort(key=lambda s: s.overall_score, reverse=True)
    return suggestions[:limit]

from pydantic import BaseModel
from typing import List


class MatchReasoning(BaseModel):
    shared_character_tags: List[str]
    shared_gift_tags: List[str]
    complementary_tags: List[str]  # mentor's gifts/gap that meet mentee's gap


class MatchSuggestion(BaseModel):
    user_id: int
    name: str
    age: int | None = None
    location: str | None = None
    is_mentor: bool
    is_mentee: bool
    similarity_score: float
    complementarity_score: float
    overall_score: float
    reasoning: MatchReasoning

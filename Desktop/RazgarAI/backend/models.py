from pydantic import BaseModel, Field
from typing import Optional


class WorkerInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    city: str
    skill: str
    years_experience: int = Field(..., ge=1, le=30)
    daily_income: int = Field(..., ge=100, le=2000)
    employer_name: str = Field(default="")


class ProfileOutput(BaseModel):
    name: str
    city: str
    skill: str
    years_experience: int
    daily_income: int
    kaam_score: int
    grade: str
    bio: str
    skills: list[str]
    achievement: str
    trust_statement: str
    generated_at: str
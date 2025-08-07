from pydantic import BaseModel
from typing import List, Optional

class PlannerRequest(BaseModel):
    business_name: str
    output_type: str
    periodic_content: bool
    additional_prompt: str

class AnswersRequest(BaseModel):
    business_name: str
    output_type: str
    periodic_content: bool
    additional_prompt: str
    answers: List[str]

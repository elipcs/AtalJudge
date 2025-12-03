"""Dataset models for Code-Contests-Plus integration"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ProblemSearchResponse(BaseModel):
    """Response model for problem search"""
    id: str
    title: str
    description: str
    difficulty: str
    time_limit: float
    memory_limit: int
    tags: List[str]
    source: str
    config: str
    test_case_count: int = Field(default=0, description="Number of available test cases")


class ProblemDetailResponse(BaseModel):
    """Response model for problem details"""
    id: str
    title: str
    description: str
    full_description: Optional[str] = ""
    input_format: Optional[str] = ""
    output_format: Optional[str] = ""
    difficulty: str
    time_limit: float
    memory_limit: int
    tags: List[str]
    sample_inputs: List[str] = []
    sample_outputs: List[str] = []
    source: str
    config: str


class TestCasePreview(BaseModel):
    """Test case preview model"""
    input: str
    expectedOutput: str
    weight: int = 10
    isExample: bool = False

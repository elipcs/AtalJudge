"""DTOs de requisição"""
from pydantic import BaseModel, Field
from typing import Optional, List


class GenerateTestCasesRequest(BaseModel):
    """Request to generate test cases"""
    question_id: str = Field(..., description="Question ID in AtalJudge")
    oracle_code: Optional[str] = Field(None, description="Correct base code in Python (optional, will use saved oracle code if not provided)")
    count: Optional[int] = Field(20, ge=1, le=200, description="Number of cases to generate (1-200)")
    use_gemini: Optional[bool] = Field(True, description="Use Gemini for format inference")
    use_supervision: Optional[bool] = Field(False, description="Use supervision system with generator/validator programs (CodeContests+ method)")
    strategies: Optional[List[str]] = Field(
        None,
        description="List of strategies to use (None = automatic selection). Options: boundary_value_analysis, equivalence_partitioning, metamorphic_testing, combinatorial_testing, random_testing, complexity_based"
    )


class GenerateAndSaveRequest(BaseModel):
    """Request to generate and save test cases in AtalJudge"""
    question_id: str = Field(..., description="Question ID in AtalJudge")
    oracle_code: Optional[str] = Field(None, description="Correct base code in Python (optional, will use saved oracle code if not provided)")
    count: Optional[int] = Field(20, ge=1, le=200, description="Number of cases to generate (1-200)")
    use_gemini: Optional[bool] = Field(True, description="Use Gemini for format inference")
    use_supervision: Optional[bool] = Field(False, description="Use supervision system with generator/validator programs (CodeContests+ method)")
    strategies: Optional[List[str]] = Field(
        None,
        description="List of strategies to use (None = automatic selection). Options: boundary_value_analysis, equivalence_partitioning, metamorphic_testing, combinatorial_testing, random_testing, complexity_based"
    )


class ImportTestCasesRequest(BaseModel):
    """Request to import test cases from Code-Contests-Plus dataset"""
    # Para importação individual
    question_id: Optional[str] = Field(None, description="Question ID in AtalJudge (optional for bulk import)")
    dataset_problem_id: Optional[str] = Field(None, description="Problem ID in Code-Contests-Plus dataset (optional for bulk import)")
    test_cases_count: Optional[int] = Field(20, ge=1, le=500, description="Number of test cases to import (1-500)")
    
    # Para bulk import
    config: Optional[str] = Field("1x", description="Dataset configuration (1x, 2x, 3x, 4x, 5x)")
    limit: Optional[int] = Field(1000, ge=1, description="Máximo de problemas a importar")
    backend_url: Optional[str] = Field("http://localhost:3333", description="URL do backend AtalJudge")



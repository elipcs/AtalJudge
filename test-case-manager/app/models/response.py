"""DTOs de resposta"""
from pydantic import BaseModel
from typing import List, Optional


class TestCase(BaseModel):
    """Caso de teste individual"""
    input: str
    output: str


class GenerateTestCasesResponse(BaseModel):
    """Resposta da geração de casos de teste"""
    test_cases: List[TestCase]
    total_generated: int
    algorithm_type: Optional[str] = None
    format_schema: Optional[dict] = None


class GenerateAndSaveResponse(BaseModel):
    """Resposta da geração e salvamento de casos de teste"""
    saved: bool
    test_case_ids: List[str]
    total_generated: int
    message: str


class ImportTestCasesResponse(BaseModel):
    """Resposta da importação de casos de teste do dataset"""
    test_cases: List[TestCase]
    total_imported: int
    dataset_source: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    """Resposta de erro"""
    error: str
    detail: Optional[str] = None
































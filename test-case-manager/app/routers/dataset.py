"""Dataset router for Code-Contests-Plus integration"""
from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.dataset import ProblemSearchResponse, ProblemDetailResponse, TestCasePreview
from app.services.dataset_service import get_dataset_service
from app.utils.logger import logger


router = APIRouter(prefix="/api/dataset", tags=["dataset"])


@router.get("/search", response_model=List[ProblemSearchResponse])
async def search_problems(
    query: str = Query("", description="Search query for problem title (empty = all problems)"),
    config: str = Query("1x", description="Dataset config (1x, 2x, 3x, 4x, 5x)"),
    limit: int = Query(20, ge=1, le=100000, description="Maximum results")
):
    """
    Search problems in the Code-Contests-Plus dataset by title
    
    - **query**: Search term to look for in problem titles (empty string returns all problems)
    - **config**: Dataset configuration (1x, 2x, 3x, 4x, 5x)
    - **limit**: Maximum number of results (1-100000)
    """
    try:
        service = get_dataset_service(config)
        results = service.search_problems(query, limit, max_scan=15000)
        return results
    except Exception as e:
        logger.error(f"Error searching dataset: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching dataset: {str(e)}")


@router.get("/problem/{problem_id}", response_model=ProblemDetailResponse)
async def get_problem(
    problem_id: str,
    config: str = Query("1x", description="Dataset config (1x, 2x, 3x, 4x, 5x)")
):
    """
    Get detailed information about a specific problem
    
    - **problem_id**: The ID of the problem to retrieve
    - **config**: Dataset configuration (1x, 2x, 3x, 4x, 5x)
    """
    try:
        service = get_dataset_service(config)
        problem = service.get_problem_by_id(problem_id)
        
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
        
        # Transform to response model
        response = ProblemDetailResponse(
            id=problem.get('problem_id') or problem.get('name') or problem.get('title', ''),
            title=problem.get('title', '') or problem.get('name', ''),
            description=problem.get('description', ''),
            full_description=problem.get('full_description', ''),
            input_format=problem.get('input_format', ''),
            output_format=problem.get('output_format', ''),
            difficulty=problem.get('difficulty', 'Unknown'),
            time_limit=problem.get('time_limit', 2.0),
            memory_limit=problem.get('memory_limit_bytes', 268435456) // (1024 * 1024),
            tags=problem.get('cf_tags', []) or problem.get('tags', []) or [],
            sample_inputs=problem.get('sample_inputs', []),
            sample_outputs=problem.get('sample_outputs', []),
            source='Code-Contests-Plus',
            config=config
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving problem: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving problem: {str(e)}")


@router.get("/problem/{problem_id}/testcases/preview", response_model=List[TestCasePreview])
async def get_test_cases_preview(
    problem_id: str,
    config: str = Query("1x", description="Dataset config (1x, 2x, 3x, 4x, 5x)"),
    limit: int = Query(5, ge=1, le=20, description="Maximum test cases to preview")
):
    """
    Get a preview of test cases for a problem
    
    - **problem_id**: The ID of the problem
    - **config**: Dataset configuration (1x, 2x, 3x, 4x, 5x)
    - **limit**: Maximum number of test cases to return (1-20)
    """
    try:
        service = get_dataset_service(config)
        test_cases = service.get_test_cases_preview(problem_id, limit)
        return test_cases
    except Exception as e:
        logger.error(f"Error retrieving test cases: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving test cases: {str(e)}")


@router.get("/problem/{problem_id}/testcases", response_model=List[TestCasePreview])
async def get_all_test_cases(
    problem_id: str,
    config: str = Query("1x", description="Dataset config (1x, 2x, 3x, 4x, 5x)")
):
    """
    Get ALL test cases for a problem (no limit)
    
    - **problem_id**: The ID of the problem
    - **config**: Dataset configuration (1x, 2x, 3x, 4x, 5x)
    """
    try:
        service = get_dataset_service(config)
        test_cases = service.get_all_test_cases(problem_id)
        return test_cases
    except Exception as e:
        logger.error(f"Error retrieving test cases: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving test cases: {str(e)}")

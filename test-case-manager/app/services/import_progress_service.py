"""Service to track and manage import progress"""
from typing import Dict, Optional
from enum import Enum
from dataclasses import dataclass, field, asdict
from datetime import datetime
import json


class ImportStage(str, Enum):
    """Stages of the import process"""
    INITIALIZING = "initializing"
    LOADING_DATASET = "loading_dataset"
    PREPARING_PROBLEMS = "preparing_problems"
    UPLOADING_PROBLEMS = "uploading_problems"
    UPLOADING_TESTCASES = "uploading_testcases"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class ImportProgress:
    """Data class to represent import progress"""
    stage: ImportStage
    current_problem: int
    total_problems: int
    current_testcase: int
    total_testcases: int
    current_problem_title: str = ""
    start_time: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    last_update: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    error_message: Optional[str] = None
    problems_uploaded: int = 0
    testcases_uploaded: int = 0
    failed_problems: int = 0
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        data = asdict(self)
        data['stage'] = self.stage.value
        data['progress_percentage'] = self.get_progress_percentage()
        data['elapsed_seconds'] = self.get_elapsed_seconds()
        return data
    
    def get_progress_percentage(self) -> float:
        """Calculate overall progress percentage"""
        if self.total_problems == 0:
            return 0
        
        # Weight stages: 
        # Problems: 50% of total
        # Testcases: 50% of total
        problem_progress = (self.current_problem / self.total_problems) * 50
        testcase_progress = (self.current_testcase / self.total_testcases) * 50 if self.total_testcases > 0 else 0
        
        return round(problem_progress + testcase_progress, 2)
    
    def get_elapsed_seconds(self) -> float:
        """Get elapsed time in seconds"""
        try:
            start = datetime.fromisoformat(self.start_time)
            last = datetime.fromisoformat(self.last_update)
            return (last - start).total_seconds()
        except:
            return 0


class ImportProgressService:
    """Service to manage and track import progress"""
    
    _instance = None
    _progress_data: Dict[str, ImportProgress] = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ImportProgressService, cls).__new__(cls)
        return cls._instance
    
    def start_import(self, session_id: str, total_problems: int):
        """Initialize a new import session"""
        self._progress_data[session_id] = ImportProgress(
            stage=ImportStage.INITIALIZING,
            current_problem=0,
            total_problems=total_problems,
            current_testcase=0,
            total_testcases=0
        )
    
    def update_stage(self, session_id: str, stage: ImportStage, message: Optional[str] = None):
        """Update the current stage of import"""
        if session_id in self._progress_data:
            progress = self._progress_data[session_id]
            progress.stage = stage
            progress.last_update = datetime.utcnow().isoformat()
            if message:
                progress.current_problem_title = message
    
    def update_problem(self, session_id: str, current: int, title: str):
        """Update current problem being processed"""
        if session_id in self._progress_data:
            progress = self._progress_data[session_id]
            progress.current_problem = current
            progress.current_problem_title = title
            progress.last_update = datetime.utcnow().isoformat()
            progress.stage = ImportStage.UPLOADING_PROBLEMS
    
    def update_testcase(self, session_id: str, current: int, total: int):
        """Update current testcase being processed"""
        if session_id in self._progress_data:
            progress = self._progress_data[session_id]
            progress.current_testcase = current
            progress.total_testcases = total
            progress.last_update = datetime.utcnow().isoformat()
            progress.stage = ImportStage.UPLOADING_TESTCASES
    
    def increment_uploaded_problems(self, session_id: str):
        """Increment count of successfully uploaded problems"""
        if session_id in self._progress_data:
            self._progress_data[session_id].problems_uploaded += 1
            self._progress_data[session_id].last_update = datetime.utcnow().isoformat()
    
    def increment_uploaded_testcases(self, session_id: str, count: int = 1):
        """Increment count of successfully uploaded testcases"""
        if session_id in self._progress_data:
            self._progress_data[session_id].testcases_uploaded += count
            self._progress_data[session_id].last_update = datetime.utcnow().isoformat()
    
    def increment_failed_problems(self, session_id: str):
        """Increment count of failed problem uploads"""
        if session_id in self._progress_data:
            self._progress_data[session_id].failed_problems += 1
            self._progress_data[session_id].last_update = datetime.utcnow().isoformat()
    
    def mark_completed(self, session_id: str):
        """Mark import as completed"""
        if session_id in self._progress_data:
            progress = self._progress_data[session_id]
            progress.stage = ImportStage.COMPLETED
            progress.last_update = datetime.utcnow().isoformat()
    
    def mark_failed(self, session_id: str, error_message: str):
        """Mark import as failed with error message"""
        if session_id in self._progress_data:
            progress = self._progress_data[session_id]
            progress.stage = ImportStage.FAILED
            progress.error_message = error_message
            progress.last_update = datetime.utcnow().isoformat()
    
    def get_progress(self, session_id: str) -> Optional[Dict]:
        """Get current progress for a session"""
        if session_id in self._progress_data:
            return self._progress_data[session_id].to_dict()
        return None
    
    def cleanup_session(self, session_id: str):
        """Remove a completed session from memory"""
        if session_id in self._progress_data:
            del self._progress_data[session_id]
    
    def get_all_sessions(self) -> Dict[str, Dict]:
        """Get progress for all active sessions"""
        return {
            session_id: progress.to_dict()
            for session_id, progress in self._progress_data.items()
        }


def get_import_progress_service() -> ImportProgressService:
    """Get or create the import progress service singleton"""
    return ImportProgressService()

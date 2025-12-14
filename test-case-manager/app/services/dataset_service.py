"""
Dataset Service for Code-Contests-Plus
Uses Hugging Face datasets library with optimized streaming
Downloads and caches parquet files for faster access
"""
from typing import List, Dict, Optional
from datasets import load_dataset
import os
from app.utils.logger import logger


class DatasetService:
    def __init__(self, config: str = "1x"):
        """
        Initialize the dataset service with streaming
        
        Args:
            config: Dataset configuration to use (1x, 2x, 3x, 4x, 5x)
        """
        self.config = config
        self.dataset_name = "ByteDance-Seed/Code-Contests-Plus"
        self._cached_problems = {}  # Cache problems by ID
        self._dataset = None
        logger.info(f"DatasetService initialized (config: {self.config})")
    
    def _get_dataset(self):
        """
        Get dataset with caching (downloads to disk, but doesn't load all in memory)
        """
        if self._dataset is None:
            logger.info(f"📦 Loading dataset {self.dataset_name} (config: {self.config})")
            logger.info(f"📂 Cache directory: ./dataset_cache")
            logger.info(f"⏳ This may take a few minutes on first run...")
            
            try:
                import sys
                # Enable progress bar output
                logger.info(f"🔄 Starting dataset download...")
                
                # Load with caching to disk (not streaming, but won't load all in RAM)
                self._dataset = load_dataset(
                    self.dataset_name,
                    name=self.config,
                    split="train",
                    cache_dir="./dataset_cache",  # Cache to disk
                    download_mode="reuse_dataset_if_exists"  # Don't re-download if exists
                )
                
                logger.info(f"✅ Dataset ready! Total problems: {len(self._dataset)}")
            except KeyboardInterrupt:
                logger.warning(f"⚠️ Dataset download interrupted by user")
                raise
            except Exception as e:
                logger.error(f"❌ Failed to load dataset: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise
        return self._dataset
    
    def search_problems(self, query: str, limit: int = 20, max_scan: int = 20000) -> List[Dict]:
        """
        Search problems by title with limited scanning
        
        Args:
            query: Search query string (searches in title)
            limit: Maximum number of results to return
            max_scan: Maximum number of problems to scan before stopping
            
        Returns:
            List of problem dictionaries matching the query
        """
        results = []
        query_lower = query.lower()
        
        logger.info(f"Searching for '{query}' (scanning up to {max_scan} problems)...")
        
        try:
            dataset = self._get_dataset()
            total = len(dataset)
            scan_limit = min(max_scan, total)
            
            logger.info(f"Dataset has {total} problems, will scan first {scan_limit}")
            
            for idx in range(scan_limit):
                # Log progress every 2000 items
                if (idx + 1) % 2000 == 0:
                    logger.info(f"  Progress: {idx + 1}/{scan_limit} scanned, {len(results)} matches")
                
                # Stop if we found enough results
                if len(results) >= limit:
                    logger.info(f"Found {limit} results, stopping search")
                    break
                
                problem = dataset[idx]
                
                # Get title from different possible fields
                title = problem.get("title", "") or problem.get("name", "") or problem.get("problem", {}).get("title", "")
                
                # Search only in title
                if query_lower in title.lower():
                    # Count available test cases from all sources
                    tc_count = 0
                    
                    # Count sample tests
                    sample_inputs = problem.get('sample_inputs', [])
                    sample_outputs = problem.get('sample_outputs', [])
                    if sample_inputs and sample_outputs:
                        tc_count += min(len(sample_inputs), len(sample_outputs))
                    
                    # Count public tests
                    public_tests = problem.get('public_tests', {})
                    if isinstance(public_tests, dict):
                        pub_inputs = public_tests.get('input', [])
                        pub_outputs = public_tests.get('output', [])
                        if pub_inputs and pub_outputs:
                            tc_count += min(len(pub_inputs), len(pub_outputs))
                    
                    # Count private tests
                    private_tests = problem.get('private_tests', {})
                    if isinstance(private_tests, dict):
                        priv_inputs = private_tests.get('input', [])
                        priv_outputs = private_tests.get('output', [])
                        if priv_inputs and priv_outputs:
                            tc_count += min(len(priv_inputs), len(priv_outputs))
                    
                    # Count generated tests
                    generated_tests = problem.get('generated_tests', {})
                    if isinstance(generated_tests, dict):
                        gen_inputs = generated_tests.get('input', [])
                        gen_outputs = generated_tests.get('output', [])
                        if gen_inputs and gen_outputs:
                            tc_count += min(len(gen_inputs), len(gen_outputs))
                    
                    problem_id = problem.get('problem_id') or problem.get('name') or title or f'problem_{idx}'
                    
                    result = {
                        'id': problem_id,
                        'title': title,
                        'description': (problem.get('description', '')[:300] + '...') if len(problem.get('description', '')) > 300 else problem.get('description', ''),
                        'difficulty': problem.get('difficulty', 'Unknown'),
                        'time_limit': problem.get('time_limit', 2.0),
                        'memory_limit': problem.get('memory_limit_bytes', 268435456) // (1024 * 1024),
                        'tags': problem.get('cf_tags', []) or problem.get('tags', []) or [],
                        'source': 'Code-Contests-Plus',
                        'config': self.config,
                        'test_case_count': tc_count
                    }
                    results.append(result)
                    
                    # Cache the full problem for later retrieval
                    self._cached_problems[problem_id] = problem
                    
                    logger.info(f"  Found: {title} (ID: {problem_id}, {tc_count} test cases)")
        
        except Exception as e:
            logger.error(f"Error during search: {e}")
        
        logger.info(f"Search complete: {len(results)} results")
        return results
    
    def get_problem_by_id(self, problem_id: str, max_scan: int = 2000) -> Optional[Dict]:
        """
        Get a specific problem by its ID
        First checks cache, then searches dataset
        
        Args:
            problem_id: The problem ID to retrieve
            max_scan: Maximum number of problems to scan (ignored when dataset is in memory)
            
        Returns:
            Problem dictionary or None if not found
        """
        # Check cache first
        if problem_id in self._cached_problems:
            logger.info(f"Problem '{problem_id}' found in cache")
            return self._cached_problems[problem_id]
        
        # Not in cache, search the dataset
        logger.info(f"Searching for problem ID: {problem_id}...")
        
        try:
            dataset = self._get_dataset()
            
            for problem in dataset:
                current_id = problem.get('problem_id') or problem.get('name') or problem.get('title', '')
                
                if current_id == problem_id:
                    logger.info(f"Found problem '{problem_id}'")
                    # Cache it for future use
                    self._cached_problems[problem_id] = problem
                    return problem
        
        except Exception as e:
            logger.error(f"Error searching for problem: {e}")
        
        logger.warning(f"Problem '{problem_id}' not found in dataset")
        return None
    
    def get_test_cases_preview(self, problem_id: str, limit: int = 10) -> List[Dict]:
        """
        Get preview of test cases for a problem (streaming mode)
        
        Args:
            problem_id: The problem ID
            limit: Maximum number of test cases to preview
            
        Returns:
            List of test case previews
        """
        problem = self.get_problem_by_id(problem_id)
        if not problem:
            return []
        
        test_cases = []
        
        # Extract sample tests (always included as examples)
        sample_inputs = problem.get('sample_inputs', [])
        sample_outputs = problem.get('sample_outputs', [])
        for i in range(min(len(sample_inputs), len(sample_outputs))):
            if len(test_cases) >= limit:
                break
            test_cases.append({
                'input': str(sample_inputs[i]).strip(),
                'expectedOutput': str(sample_outputs[i]).strip(),
                'weight': 10,
                'isExample': True
            })
        
        # Extract public tests if we need more
        if len(test_cases) < limit:
            public_tests = problem.get('public_tests', {})
            if isinstance(public_tests, dict):
                pub_inputs = public_tests.get('input', [])
                pub_outputs = public_tests.get('output', [])
                for i in range(min(len(pub_inputs), len(pub_outputs))):
                    if len(test_cases) >= limit:
                        break
                    test_cases.append({
                        'input': str(pub_inputs[i]).strip(),
                        'expectedOutput': str(pub_outputs[i]).strip(),
                        'weight': 10,
                        'isExample': False
                    })
        
        # Extract private tests if we need more
        if len(test_cases) < limit:
            private_tests = problem.get('private_tests', {})
            if isinstance(private_tests, dict):
                priv_inputs = private_tests.get('input', [])
                priv_outputs = private_tests.get('output', [])
                for i in range(min(len(priv_inputs), len(priv_outputs))):
                    if len(test_cases) >= limit:
                        break
                    test_cases.append({
                        'input': str(priv_inputs[i]).strip(),
                        'expectedOutput': str(priv_outputs[i]).strip(),
                        'weight': 10,
                        'isExample': False
                    })
        
        # Extract generated tests if we need more
        if len(test_cases) < limit:
            generated_tests = problem.get('generated_tests', {})
            if isinstance(generated_tests, dict):
                gen_inputs = generated_tests.get('input', [])
                gen_outputs = generated_tests.get('output', [])
                for i in range(min(len(gen_inputs), len(gen_outputs))):
                    if len(test_cases) >= limit:
                        break
                    test_cases.append({
                        'input': str(gen_inputs[i]).strip(),
                        'expectedOutput': str(gen_outputs[i]).strip(),
                        'weight': 10,
                        'isExample': False
                    })
        
        logger.info(f"Retrieved {len(test_cases)} test cases (preview) for {problem_id}")
        return test_cases
    
    def get_all_test_cases(self, problem_id: str) -> List[Dict]:
        """
        Get ALL test cases for a problem (no limit) - streaming mode
        
        Args:
            problem_id: The problem ID
            
        Returns:
            List of all test cases
        """
        problem = self.get_problem_by_id(problem_id)
        if not problem:
            return []
        
        test_cases = []
        
        # Extract sample tests (always included as examples)
        sample_inputs = problem.get('sample_inputs', [])
        sample_outputs = problem.get('sample_outputs', [])
        for i in range(min(len(sample_inputs), len(sample_outputs))):
            test_cases.append({
                'input': str(sample_inputs[i]).strip(),
                'expectedOutput': str(sample_outputs[i]).strip(),
                'weight': 10,
                'isExample': True
            })
        
        # Extract public tests
        public_tests = problem.get('public_tests', {})
        if isinstance(public_tests, dict):
            pub_inputs = public_tests.get('input', [])
            pub_outputs = public_tests.get('output', [])
            for i in range(min(len(pub_inputs), len(pub_outputs))):
                test_cases.append({
                    'input': str(pub_inputs[i]).strip(),
                    'expectedOutput': str(pub_outputs[i]).strip(),
                    'weight': 10,
                    'isExample': False
                })
        
        # Extract private tests
        private_tests = problem.get('private_tests', {})
        if isinstance(private_tests, dict):
            priv_inputs = private_tests.get('input', [])
            priv_outputs = private_tests.get('output', [])
            for i in range(min(len(priv_inputs), len(priv_outputs))):
                test_cases.append({
                    'input': str(priv_inputs[i]).strip(),
                    'expectedOutput': str(priv_outputs[i]).strip(),
                    'weight': 10,
                    'isExample': False
                })
        
        # Extract generated tests
        generated_tests = problem.get('generated_tests', {})
        if isinstance(generated_tests, dict):
            gen_inputs = generated_tests.get('input', [])
            gen_outputs = generated_tests.get('output', [])
            for i in range(min(len(gen_inputs), len(gen_outputs))):
                test_cases.append({
                    'input': str(gen_inputs[i]).strip(),
                    'expectedOutput': str(gen_outputs[i]).strip(),
                    'weight': 10,
                    'isExample': False
                })
        
        logger.info(f"Retrieved ALL {len(test_cases)} test cases for {problem_id}")
        return test_cases


# Singleton instance
_dataset_service: Optional[DatasetService] = None


def get_dataset_service(config: str = "1x") -> DatasetService:
    """Get or create the dataset service singleton"""
    global _dataset_service
    if _dataset_service is None or _dataset_service.config != config:
        _dataset_service = DatasetService(config)
    return _dataset_service

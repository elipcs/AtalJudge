/**
 * @module services/DatasetService
 * @description Service for interacting with the Code-Contests-Plus dataset API via test-case-manager microservice
 * Communicates with the import_database module for importing test cases from dataset
 */
import { injectable } from 'tsyringe';
import axios, { AxiosInstance } from 'axios';
import { 
  DatasetProblemDTO, 
  DatasetProblemDetailDTO, 
  DatasetTestCaseDTO 
} from '../dtos/DatasetDtos';
import logger from '../utils/logger';

/**
 * Service for searching and retrieving problems from Code-Contests-Plus dataset
 * Connects to test-case-manager's import_database module via /api/import/* endpoints
 */
@injectable()
export class DatasetService {
  private apiClient: AxiosInstance;
  private baseUrl: string;

  constructor() {
    // Get test-case-manager API URL from environment
    this.baseUrl = process.env.TEST_CASE_MANAGER_API_URL || 'http://test-case-manager:8000';
    
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 600000, // 10 minutes timeout for dataset downloads
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info(`DatasetService initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Set JWT token for authenticated requests
   */
  setJwtToken(token: string): void {
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Search for problems in the dataset by title
   * Calls /api/dataset/search endpoint
   * 
   * @param title - Problem title to search for
   * @param datasetConfig - Dataset configuration (1x, 2x, 3x, 4x, 5x)
   * @param limit - Maximum number of results
   * @returns Array of matching problems
   */
  async searchProblemsByTitle(
    title: string, 
    datasetConfig: string = '1x', 
    limit: number = 20
  ): Promise<DatasetProblemDTO[]> {
    try {
      logger.info(`Searching dataset by title: title="${title}", config="${datasetConfig}", limit=${limit}`);
      
      const response = await this.apiClient.get<DatasetProblemDTO[]>('/api/dataset/search', {
        params: {
          query: title,
          config: datasetConfig,
          limit
        }
      });

      logger.info(`Found ${response.data.length} problems matching title "${title}"`);
      return response.data;
    } catch (error: any) {
      logger.error('Error searching dataset:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Test-case-manager microservice is not available. Please ensure the service is running on ' + this.baseUrl);
      }
      
      throw new Error(`Failed to search dataset: ${error.message}`);
    }
  }

  /**
   * List all problems from the dataset
   * Calls /api/import/testcases endpoint to trigger bulk import
   * 
   * @param datasetConfig - Dataset configuration (1x, 2x, 3x, 4x, 5x)
   * @param limit - Maximum number of results (default: 1000 to avoid disk issues)
   * @returns Empty array (bulk import happens in background)
   */
  async listAllProblems(
    datasetConfig: string = '1x', 
    limit: number = 1000
  ): Promise<DatasetProblemDTO[]> {
    try {
      logger.info(`Starting bulk import from dataset: config="${datasetConfig}", limit=${limit}`);
      
      // Call /api/import/testcases to trigger bulk import
      const response = await this.apiClient.post<any>('/api/import/testcases', {
        config: datasetConfig,
        limit,
        skip_existing: true
      });

      logger.info(`Bulk import initiated: ${response.data.message}`);
      
      // Return empty array since bulk import happens in background
      return [];
    } catch (error: any) {
      logger.error('Error initiating bulk import:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Test-case-manager microservice is not available. Please ensure the service is running on ' + this.baseUrl);
      }
      
      throw new Error(`Failed to initiate bulk import: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a specific problem
   * Calls /api/dataset/problem/:id endpoint
   * 
   * @param problemId - The dataset problem ID
   * @param datasetConfig - Dataset configuration (1x, 2x, 3x, 4x, 5x)
   * @returns Detailed problem information
   */
  async getProblemDetails(
    problemId: string, 
    datasetConfig: string = '1x'
  ): Promise<DatasetProblemDetailDTO> {
    try {
      logger.info(`Fetching problem details: id="${problemId}", config="${datasetConfig}"`);
      
      const response = await this.apiClient.get<DatasetProblemDetailDTO>(
        `/api/dataset/problem/${problemId}`,
        { params: { config: datasetConfig } }
      );

      logger.info(`Retrieved problem details for "${response.data.title}"`);
      return response.data;
    } catch (error: any) {
      logger.error(`Error fetching problem details for ${problemId}:`, error.message);
      
      if (error.response?.status === 404) {
        throw new Error(`Problem with ID "${problemId}" not found in dataset`);
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Test-case-manager microservice is not available. Please ensure the service is running on ' + this.baseUrl);
      }
      
      throw new Error(`Failed to fetch problem details: ${error.message}`);
    }
  }

  /**
   * Get test case previews for a problem
   * Uses /api/dataset/problem/:id/testcases/preview endpoint
   * 
   * @param problemId - The dataset problem ID
   * @param datasetConfig - Dataset configuration (1x, 2x, 3x, 4x, 5x)
   * @param limit - Maximum number of test cases to retrieve
   * @returns Array of test case previews
   */
  async getTestCasesPreview(
    problemId: string, 
    datasetConfig: string = '1x', 
    limit: number = 5
  ): Promise<DatasetTestCaseDTO[]> {
    try {
      logger.info(`Fetching test cases preview: id="${problemId}", config="${datasetConfig}", limit=${limit}`);
      
      const response = await this.apiClient.get<DatasetTestCaseDTO[]>(
        `/api/dataset/problem/${problemId}/testcases/preview`,
        { 
          params: {
            config: datasetConfig, 
            limit 
          }
        }
      );

      logger.info(`Retrieved ${response.data.length} test case previews`);
      return response.data;
    } catch (error: any) {
      logger.error(`Error fetching test cases for ${problemId}:`, error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Test-case-manager microservice is not available. Please ensure the service is running on ' + this.baseUrl);
      }
      
      throw new Error(`Failed to fetch test cases: ${error.message}`);
    }
  }

  /**
   * Check if the test-case- microservice (with dataset API) is available
   * 
   * @returns True if the API is reachable, false otherwise
   */
  async checkAvailability(): Promise<boolean> {
    try {
      await this.apiClient.get('/', { timeout: 5000 });
      return true;
    } catch (error) {
      logger.warn('Test-case- microservice is not available');
      return false;
    }
  }
}

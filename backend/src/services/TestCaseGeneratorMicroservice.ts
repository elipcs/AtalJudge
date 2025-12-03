/**
 * @module services/TestCaseMicroservice
 * @description Service for interacting with the test case  microservice
 * Handles HTTP requests to the microservice and transforms responses
 * @class TestCaseMicroservice
 */
import { injectable } from 'tsyringe';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/environment';
import { logger } from '../utils';

export interface GenerateTestCasesRequest {
  question_id: string;
  oracle_code: string;
  count?: number;
  use_gemini?: boolean;
  use_supervision?: boolean;
}

export interface TestCaseResponse {
  input: string;
  output: string;
}

export interface GenerateTestCasesResponse {
  test_cases: TestCaseResponse[];
  total_generated: number;
  algorithm_type?: string;
  format_schema?: any;
}

@injectable()
export class TestCaseGeneratorMicroservice {
  private axiosInstance: AxiosInstance;
  private apiUrl: string;
  private timeout: number;

  constructor() {
    this.apiUrl = config.testCaseManager.apiUrl;
    this.timeout = config.testCaseManager.timeout;

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ATALJudge-Backend/1.0'
      },
      timeout: this.timeout,
      // Configurações adicionais para evitar problemas de conexão
      httpAgent: new (require('http').Agent)({ 
        keepAlive: true,
        timeout: this.timeout 
      }),
      httpsAgent: new (require('https').Agent)({ 
        keepAlive: true,
        timeout: this.timeout 
      })
    });

    logger.info(`[TestCaseMicroservice] Service initialized with API URL: ${this.apiUrl}`);
  }

  /**
   * Generates test cases by calling the microservice
   * 
   * @param request - Request data for generating test cases
   * @param jwtToken - JWT token for authentication
   * @returns Promise with generated test cases
   */
  async generateTestCases(
    request: GenerateTestCasesRequest,
    jwtToken: string
  ): Promise<GenerateTestCasesResponse> {
    try {
      logger.info('[TestCaseMicroservice] Generating test cases', {
        questionId: request.question_id,
        count: request.count,
        useGemini: request.use_gemini
      });

      const response = await this.axiosInstance.post<GenerateTestCasesResponse>(
        '/api/generate',
        {
          question_id: request.question_id,
          oracle_code: request.oracle_code,
          count: request.count || 20,
          use_gemini: request.use_gemini !== undefined ? request.use_gemini : true,
          use_supervision: request.use_supervision !== undefined ? request.use_supervision : false
        },
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        }
      );

      const data = response.data;

      logger.info('[TestCaseMicroservice] Test cases generated successfully', {
        questionId: request.question_id,
        totalGenerated: data.total_generated,
        algorithmType: data.algorithm_type
      });

      return data;
    } catch (error) {
      logger.error('[TestCaseMicroservice] Error generating test cases', {
        questionId: request.question_id,
        error: error instanceof Error ? error.message : String(error)
      });

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
        logger.error('[TestCaseMicroservice] Axios error', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
        const errorMsg = axiosError.response?.data?.detail || 
                        axiosError.response?.data?.message || 
                        axiosError.message;
        throw new Error(`Failed to generate test cases: ${errorMsg}`);
      }
      throw new Error('Failed to generate test cases from microservice');
    }
  }

  /**
   * Health check for the microservice
   * 
   * @returns Promise with health status
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await this.axiosInstance.get<{ status: string; service: string }>('/api/health');
      return response.data;
    } catch (error) {
      logger.error('[TestCaseMicroservice] Health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error('Microservice health check failed');
    }
  }
}




























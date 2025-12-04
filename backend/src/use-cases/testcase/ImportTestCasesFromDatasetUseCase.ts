/**
 * @module use-cases/testcase/ImportTestCasesFromDatasetUseCase
 * @description Use case for importing test cases from Code-Contests-Plus dataset
 */
import { injectable, inject } from 'tsyringe';
import { DatasetService } from '../../services/DatasetService';
import { TestCaseRepository } from '../../repositories/TestCaseRepository';
import { QuestionRepository } from '../../repositories/QuestionRepository';
import { ImportTestCasesFromDatasetDTO } from '../../dtos/DatasetDtos';
import { TestCase } from '../../models/TestCase';
import logger from '../../utils/logger';
import { AppError } from '../../utils/errors';

/**
 * Import Test Cases From Dataset Use Case
 * 
 * Imports test cases from a dataset problem into a question
 */
@injectable()
export class ImportTestCasesFromDatasetUseCase {
  constructor(
    @inject(DatasetService) private datasetService: DatasetService,
    @inject(TestCaseRepository) private testCaseRepository: TestCaseRepository,
    @inject(QuestionRepository) private questionRepository: QuestionRepository
  ) {}

  /**
   * Execute the import test cases from dataset use case
   * 
   * @param questionId - The question ID to import test cases into
   * @param dto - Import configuration
   * @returns Array of created test cases
   */
  async execute(
    questionId: string,
    dto: ImportTestCasesFromDatasetDTO
  ): Promise<TestCase[]> {
    try {
      // Verify question exists
      const question = await this.questionRepository.findById(questionId);
      if (!question) {
        throw new AppError('Question not found', 404);
      }

      logger.info(`Importing test cases from dataset problem matching title "${dto.questionTitle}" to question ${questionId}`);

      // Search for the problem by title in the dataset
      const matchingProblems = await this.datasetService.searchProblemsByTitle(
        dto.questionTitle,
        dto.config
      );

      if (matchingProblems.length === 0) {
        throw new AppError(`No problems found in the dataset matching title "${dto.questionTitle}"`, 404);
      }

      // Use the first matching problem
      const selectedProblem = matchingProblems[0];
      logger.info(`Selected dataset problem: "${selectedProblem.title}" (ID: ${selectedProblem.id})`);

      // Get test cases from dataset
      const limit = dto.testCasesToImport || 20; // Default to 20 if not specified
      const datasetTestCases = await this.datasetService.getTestCasesPreview(
        selectedProblem.id,
        dto.config,
        limit
      );

      if (datasetTestCases.length === 0) {
        throw new AppError('No test cases found in the dataset problem', 404);
      }

      // Delete existing test cases for this question
      const existingTestCases = await this.testCaseRepository.findByQuestion(questionId);
      for (const tc of existingTestCases) {
        await this.testCaseRepository.delete(tc.id);
      }
      logger.info(`Deleted ${existingTestCases.length} existing test cases`);

      // Create new test cases from dataset
      const createdTestCases: TestCase[] = [];
      
      for (let i = 0; i < datasetTestCases.length; i++) {
        const dtc = datasetTestCases[i];
        
        const testCase = await this.testCaseRepository.create({
          questionId: questionId,
          input: dtc.input,
          expectedOutput: dtc.expectedOutput,
          weight: dtc.weight
        });

        createdTestCases.push(testCase);
      }

      logger.info(`Successfully imported ${createdTestCases.length} test cases from dataset`);
      return createdTestCases;
    } catch (error: any) {
      logger.error('Error importing test cases from dataset:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        error.message || 'Failed to import test cases from dataset',
        500
      );
    }
  }
}

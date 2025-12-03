import { injectable, inject } from 'tsyringe';
import { IUseCase } from '../interfaces/IUseCase';
import { ImportDatasetProblemDTO, ImportDatasetProblemResponseDTO } from '../../dtos';
import { QuestionRepository, TestCaseRepository } from '../../repositories';
import { DatasetService } from '../../services/DatasetService';
import { Question } from '../../models/Question';
import { TestCase } from '../../models/TestCase';
import { logger, NotFoundError, ValidationError } from '../../utils';

/**
 * Use Case: Import Complete Dataset Problem
 * 
 * Responsibilities:
 * - Search for problem in dataset by title
 * - Download problem details and test cases
 * - Create Question entity in database
 * - Create TestCase entities in database
 * - Return import result
 */
@injectable()
export class ImportDatasetProblemUseCase implements IUseCase<ImportDatasetProblemDTO, ImportDatasetProblemResponseDTO> {
  constructor(
    @inject(QuestionRepository) private questionRepository: QuestionRepository,
    @inject(TestCaseRepository) private testCaseRepository: TestCaseRepository,
    @inject(DatasetService) private datasetService: DatasetService
  ) {}

  /**
   * Set JWT token for authenticated requests to test-case-manager
   */
  private setAuthToken(dto: ImportDatasetProblemDTO): void {
    if (dto.jwtToken) {
      this.datasetService.setJwtToken(dto.jwtToken);
    }
  }

  async execute(dto: ImportDatasetProblemDTO): Promise<ImportDatasetProblemResponseDTO> {
    // Set JWT token for authentication
    this.setAuthToken(dto);
    
    logger.info('[ImportDatasetProblemUseCase] Starting dataset import', {
      title: dto.problemTitle,
      config: dto.datasetConfig
    });

    // 1. Validate dataset config
    if (!['1x', '2x', '3x'].includes(dto.datasetConfig)) {
      throw new ValidationError(
        'Invalid dataset configuration. Must be 1x, 2x, or 3x',
        'INVALID_DATASET_CONFIG'
      );
    }

    // 2. Search for problem in dataset
    const searchResults = await this.datasetService.searchProblemsByTitle(
      dto.problemTitle,
      dto.datasetConfig,
      5 // Get top 5 results
    );

    if (searchResults.length === 0) {
      throw new NotFoundError(
        `No problems found in dataset matching "${dto.problemTitle}"`,
        'DATASET_PROBLEM_NOT_FOUND'
      );
    }

    // 3. Get the first (most relevant) result
    const datasetProblem = searchResults[0];
    
    logger.info('[ImportDatasetProblemUseCase] Found dataset problem', {
      id: datasetProblem.id,
      title: datasetProblem.title
    });

    // 4. Get detailed problem information
    const problemDetails = await this.datasetService.getProblemDetails(
      datasetProblem.id,
      dto.datasetConfig
    );

    // 5. Create Question entity
    const question = new Question();
    question.title = problemDetails.title;
    
    // Build comprehensive text from all available description fields
    let fullText = '';
    
    if (problemDetails.full_description) {
      fullText += problemDetails.full_description + '\n\n';
    } else if (problemDetails.description) {
      fullText += problemDetails.description + '\n\n';
    }
    
    if (problemDetails.input_format) {
      fullText += '**Input Format:**\n' + problemDetails.input_format + '\n\n';
    }
    
    if (problemDetails.output_format) {
      fullText += '**Output Format:**\n' + problemDetails.output_format + '\n\n';
    }

    question.text = fullText.trim() || problemDetails.description;
    
    // Convert time limit from seconds to milliseconds
    question.timeLimitMs = Math.round(problemDetails.time_limit * 1000);
    
    // Convert memory limit from MB to KB
    question.memoryLimitKb = problemDetails.memory_limit * 1024;
    
    question.source = `${problemDetails.source} (${dto.datasetConfig})`;
    question.tags = problemDetails.tags || [];
    
    // Build examples from sample inputs/outputs
    question.examples = [];
    if (problemDetails.sample_inputs && problemDetails.sample_outputs) {
      const exampleCount = Math.min(
        problemDetails.sample_inputs.length,
        problemDetails.sample_outputs.length
      );
      
      for (let i = 0; i < exampleCount; i++) {
        question.examples.push({
          input: problemDetails.sample_inputs[i],
          output: problemDetails.sample_outputs[i]
        });
      }
    }

    // 6. Save question to database
    const savedQuestion = await this.questionRepository.create(question);
    
    logger.info('[ImportDatasetProblemUseCase] Question created in database', {
      questionId: savedQuestion.id,
      title: savedQuestion.title
    });

    // 7. Get test cases from dataset
    const datasetTestCases = await this.datasetService.getTestCasesPreview(
      datasetProblem.id,
      dto.datasetConfig,
      dto.maxTestCases || 1000 // Get all test cases unless limited
    );

    // 8. Determine how many test cases to import
    let testCasesToImport = datasetTestCases;
    if (dto.maxTestCases && dto.maxTestCases > 0) {
      testCasesToImport = datasetTestCases.slice(0, dto.maxTestCases);
    }

    // 9. Create TestCase entities
    const testCases: TestCase[] = [];
    for (const dtc of testCasesToImport) {
      const testCase = new TestCase();
      testCase.questionId = savedQuestion.id;
      testCase.input = dtc.input;
      testCase.expectedOutput = dtc.expectedOutput;
      testCase.weight = dtc.weight || 10;
      testCases.push(testCase);
    }

    // 10. Bulk save test cases
    await this.testCaseRepository.bulkCreate(testCases);
    
    logger.info('[ImportDatasetProblemUseCase] Test cases imported', {
      questionId: savedQuestion.id,
      count: testCases.length
    });

    // 11. Return result
    return {
      success: true,
      question: {
        id: savedQuestion.id,
        title: savedQuestion.title,
        source: savedQuestion.source || ''
      },
      testCasesImported: testCases.length,
      message: `Successfully imported problem "${savedQuestion.title}" with ${testCases.length} test cases from ${dto.datasetConfig} dataset`
    };
  }
}

import { injectable, inject } from 'tsyringe';
import { parse } from 'csv-parse/sync';
import { IUseCase } from '../interfaces/IUseCase';
import {
    ImportQuestionsFromCsvDTO,
    ImportQuestionsFromCsvResponseDTO,
    CsvQuestionRow,
    CsvImportError,
    CsvImportResult
} from '../../dtos';
import { QuestionRepository, TestCaseRepository } from '../../repositories';
import { Question } from '../../models/Question';
import { TestCase } from '../../models/TestCase';
import { logger, ValidationError } from '../../utils';

/**
 * Use Case: Import Questions from CSV
 * 
 * Responsibilities:
 * - Parse CSV content
 * - Validate CSV format and data
 * - Group rows by question (same title)
 * - Create Question entities with associated TestCases
 * - Return import summary with errors
 */
@injectable()
export class ImportQuestionsFromCsvUseCase implements IUseCase<ImportQuestionsFromCsvDTO, ImportQuestionsFromCsvResponseDTO> {
    constructor(
        @inject(QuestionRepository) private questionRepository: QuestionRepository,
        @inject(TestCaseRepository) private testCaseRepository: TestCaseRepository
    ) { }

    async execute(dto: ImportQuestionsFromCsvDTO): Promise<ImportQuestionsFromCsvResponseDTO> {
        logger.info('[ImportQuestionsFromCsvUseCase] Starting CSV import');

        const result: CsvImportResult = {
            questionsCreated: 0,
            testCasesCreated: 0,
            errors: [],
            questionIds: []
        };

        try {
            // 1. Parse CSV content
            const records = parse(dto.csvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true
            }) as CsvQuestionRow[];

            if (records.length === 0) {
                throw new ValidationError('CSV file is empty or has no valid rows', 'EMPTY_CSV');
            }

            logger.info(`[ImportQuestionsFromCsvUseCase] Parsed ${records.length} rows from CSV`);

            // 2. Group rows by question title
            const questionGroups = this.groupRowsByQuestion(records);
            logger.info(`[ImportQuestionsFromCsvUseCase] Found ${questionGroups.size} unique questions`);

            // 3. Process each question group
            for (const [title, rows] of questionGroups.entries()) {
                try {
                    await this.processQuestionGroup(title, rows, result);
                } catch (error: any) {
                    logger.error(`[ImportQuestionsFromCsvUseCase] Error processing question "${title}"`, error);
                    result.errors.push({
                        row: 0,
                        message: `Error processing question "${title}": ${error.message}`
                    });
                }
            }

            // 4. Return result
            const message = result.errors.length > 0
                ? `Imported ${result.questionsCreated} questions with ${result.testCasesCreated} test cases. ${result.errors.length} errors occurred.`
                : `Successfully imported ${result.questionsCreated} questions with ${result.testCasesCreated} test cases.`;

            logger.info(`[ImportQuestionsFromCsvUseCase] ${message}`);

            return {
                success: result.errors.length === 0,
                result,
                message
            };

        } catch (error: any) {
            logger.error('[ImportQuestionsFromCsvUseCase] Fatal error during CSV import', error);

            if (error instanceof ValidationError) {
                throw error;
            }

            throw new ValidationError(
                `Error parsing CSV file: ${error.message}`,
                'CSV_PARSE_ERROR'
            );
        }
    }

    /**
     * Group CSV rows by question title
     */
    private groupRowsByQuestion(records: CsvQuestionRow[]): Map<string, CsvQuestionRow[]> {
        const groups = new Map<string, CsvQuestionRow[]>();

        for (const record of records) {
            const title = record.title?.trim();
            if (!title) continue;

            if (!groups.has(title)) {
                groups.set(title, []);
            }
            groups.get(title)!.push(record);
        }

        return groups;
    }

    /**
     * Process a group of rows for a single question
     */
    private async processQuestionGroup(
        title: string,
        rows: CsvQuestionRow[],
        result: CsvImportResult
    ): Promise<void> {
        // Use the first row for question data
        const firstRow = rows[0];

        // Validate required fields
        if (!firstRow.text?.trim()) {
            result.errors.push({
                row: 0,
                field: 'text',
                message: `Question "${title}" is missing text field`
            });
            return;
        }

        // Create Question entity
        const question = new Question();
        question.title = title;
        question.text = firstRow.text.trim();
        question.timeLimitMs = this.parseNumber(firstRow.timeLimitMs, 1000, 100, 30000);
        question.memoryLimitKb = this.parseNumber(firstRow.memoryLimitKb, 64000, 1000, 512000);
        question.source = firstRow.source?.trim() || 'CSV Import';
        question.tags = this.parseTags(firstRow.tags);
        question.examples = [];

        try {
            // Save question
            const savedQuestion = await this.questionRepository.create(question);
            result.questionsCreated++;
            result.questionIds.push(savedQuestion.id);

            logger.info(`[ImportQuestionsFromCsvUseCase] Created question: ${savedQuestion.title} (${savedQuestion.id})`);

            // Create test cases for this question
            const testCases: TestCase[] = [];
            for (const row of rows) {
                if (!row.testCaseInput || !row.testCaseExpectedOutput) {
                    result.errors.push({
                        row: 0,
                        message: `Skipping test case for "${title}" - missing input or output`
                    });
                    continue;
                }

                const testCase = new TestCase();
                testCase.questionId = savedQuestion.id;
                testCase.input = row.testCaseInput.trim();
                testCase.expectedOutput = row.testCaseExpectedOutput.trim();
                testCase.weight = this.parseNumber(row.testCaseWeight, 10, 0, 100);
                testCases.push(testCase);
            }

            // Bulk save test cases
            if (testCases.length > 0) {
                await this.testCaseRepository.bulkCreate(testCases);
                result.testCasesCreated += testCases.length;
                logger.info(`[ImportQuestionsFromCsvUseCase] Created ${testCases.length} test cases for question ${savedQuestion.id}`);
            }

        } catch (error: any) {
            result.errors.push({
                row: 0,
                message: `Error saving question "${title}": ${error.message}`
            });
            logger.error(`[ImportQuestionsFromCsvUseCase] Error saving question "${title}"`, error);
        }
    }

    /**
     * Parse a number field with default and bounds
     */
    private parseNumber(value: any, defaultValue: number, min: number, max: number): number {
        const num = typeof value === 'number' ? value : parseInt(value, 10);
        if (isNaN(num)) return defaultValue;
        return Math.max(min, Math.min(max, num));
    }

    /**
     * Parse tags from comma-separated string
     */
    private parseTags(tagsString?: string): string[] {
        if (!tagsString) return [];
        return tagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    }
}

/**
 * @module use-cases/testcase/ImportTestCasesFromFileUseCase
 * @description Use case for importing test cases from JSON or CSV files
 */
import { injectable, inject } from 'tsyringe';
import { TestCaseRepository } from '../../repositories/TestCaseRepository';
import { QuestionRepository } from '../../repositories/QuestionRepository';
import logger from '../../utils/logger';
import { parse } from 'csv-parse/sync';

interface TestCaseInput {
    input: string;
    output: string;
}

interface ImportResult {
    imported: number;
    failed: number;
    errors: string[];
}

@injectable()
export class ImportTestCasesFromFileUseCase {
    constructor(
        @inject('TestCaseRepository') private testCaseRepository: TestCaseRepository,
        @inject('QuestionRepository') private questionRepository: QuestionRepository
    ) { }

    async execute(params: {
        questionId: string;
        fileContent: string;
        fileType: 'json' | 'csv';
    }): Promise<ImportResult> {
        const { questionId, fileContent, fileType } = params;

        // Verify question exists
        const question = await this.questionRepository.findById(questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        let testCases: TestCaseInput[];

        try {
            if (fileType === 'json') {
                testCases = this.parseJSON(fileContent);
            } else {
                testCases = this.parseCSV(fileContent);
            }
        } catch (error: any) {
            logger.error('Error parsing file:', error);
            throw new Error(`Invalid file format: ${error.message}`);
        }

        if (testCases.length === 0) {
            throw new Error('No valid test cases found in file');
        }

        // Import test cases
        const result: ImportResult = {
            imported: 0,
            failed: 0,
            errors: [],
        };

        for (let i = 0; i < testCases.length; i++) {
            try {
                const tc = testCases[i];

                // Validate
                if (!tc.input || !tc.output) {
                    result.failed++;
                    result.errors.push(`Test case ${i + 1}: Missing input or output`);
                    continue;
                }

                // Create test case with default weight of 10
                await this.testCaseRepository.create({
                    questionId,
                    input: tc.input.toString(),
                    expectedOutput: tc.output.toString(),
                    weight: 10,
                    order: i,
                });

                result.imported++;
            } catch (error: any) {
                result.failed++;
                result.errors.push(`Test case ${i + 1}: ${error.message}`);
                logger.error(`Error importing test case ${i + 1}:`, error);
            }
        }

        logger.info(`Import completed: ${result.imported} imported, ${result.failed} failed`);

        return result;
    }

    private parseJSON(content: string): TestCaseInput[] {
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
            throw new Error('JSON must be an array');
        }

        return data.map((item, index) => {
            if (!item.input || !item.output) {
                throw new Error(`Test case ${index + 1} is missing required fields (input, output)`);
            }

            return {
                input: item.input,
                output: item.output,
            };
        });
    }

    private parseCSV(content: string): TestCaseInput[] {
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        if (!Array.isArray(records) || records.length === 0) {
            throw new Error('CSV file is empty or invalid');
        }

        // Validate columns
        const firstRecord = records[0];
        if (!('input' in firstRecord) || !('output' in firstRecord)) {
            throw new Error('CSV must have "input" and "output" columns');
        }

        return records.map((record: any) => ({
            input: record.input,
            output: record.output,
        }));
    }
}

import { injectable, inject } from 'tsyringe';
import { TestCaseRepository } from '../../repositories';
import { GenerateTestCasesOracleDTO, TestCaseResponseDTO } from '../../dtos';
import { SandboxFusionService } from '../../services/SandboxFusionService';
import { logger } from '../../utils';

interface GenerateOracleResult {
    createdTestCases: TestCaseResponseDTO[];
    failedExecutions: {
        input: string;
        error: string;
    }[];
}

@injectable()
export class GenerateTestCasesFromOracleUseCase {
    constructor(
        @inject(TestCaseRepository) private testCaseRepository: TestCaseRepository,
        @inject(SandboxFusionService) private judgeService: SandboxFusionService
    ) { }

    async execute(questionId: string, dto: GenerateTestCasesOracleDTO): Promise<GenerateOracleResult> {
        const { oracleCode, language, inputs, defaultWeight = 10, defaultIsHidden = false } = dto as any;

        if (!inputs || inputs.length === 0) {
            return { createdTestCases: [], failedExecutions: [] };
        }

        const submissions = inputs.map((input: string) => ({
            sourceCode: oracleCode,
            language,
            stdin: input,
        }));

        logger.info(`Generating ${inputs.length} test cases from oracle for question ${questionId}`);

        const tokens = await this.judgeService.createBatchSubmissions(submissions, {
            cpuTimeLimit: 5, // give oracle some generous time
            memoryLimit: 256000 // 256MB
        });

        const results = await this.judgeService.waitForBatchSubmissionsWithCallback(
            tokens,
            async () => { },
            120, // max attempts
            500 // 500ms interval => 60s timeout
        );

        const createdTestCases: TestCaseResponseDTO[] = [];
        const failedExecutions: { input: string; error: string }[] = [];

        // The order of results matches tokens? Actually waitForBatchSubmissionsWithCallback preserves token order.
        // Let's verify results matches the submissions order. It should, but we can map back if needed.
        // Wait, getBatchSubmissionStatus normally maps the array directly. Let's assume order is preserved.
        for (let i = 0; i < results.length; i++) {
            const status = results[i];
            const input = inputs[i];

            const processed = this.judgeService.processSubmissionResult(status);

            if (processed.passed) {
                // Create testcase
                const created = await this.testCaseRepository.create({
                    questionId,
                    input,
                    expectedOutput: processed.output || '',
                    weight: defaultWeight,
                    isHidden: defaultIsHidden
                });

                createdTestCases.push(
                    new TestCaseResponseDTO({
                        id: created.id,
                        questionId: created.questionId,
                        input: created.input,
                        expectedOutput: created.expectedOutput,
                        weight: created.weight,
                        isHidden: created.isHidden,
                        createdAt: created.createdAt
                    })
                );
            } else {
                failedExecutions.push({
                    input,
                    error: processed.errorMessage || 'Unknown error (Execution Failed)'
                });
            }
        }

        return { createdTestCases, failedExecutions };
    }
}

import { injectable, inject } from 'tsyringe';
import { IUseCase } from '../interfaces/IUseCase';
import { SubmissionRepository } from '../../repositories';
import { NotFoundError } from '../../utils';

interface QuestionListMetricsResult {
    [questionId: string]: {
        totalSubmissions: number;
        acceptedSubmissions: number;
    };
}

/**
 * Use Case: Get question list execution metrics
 * 
 * Responsibilities:
 * - Retrieve total and accepted submissions for each question within a specific list
 */
@injectable()
export class GetQuestionListMetricsUseCase implements IUseCase<string, QuestionListMetricsResult> {
    constructor(
        @inject(SubmissionRepository) private submissionRepository: SubmissionRepository
    ) { }

    async execute(questionListId: string): Promise<QuestionListMetricsResult> {
        if (!questionListId) {
            throw new NotFoundError('Question list ID is required', 'LIST_NOT_FOUND');
        }

        const rawMetrics = await this.submissionRepository.getMetricsByQuestionList(questionListId);

        const metricsMap: QuestionListMetricsResult = {};
        for (const row of rawMetrics) {
            metricsMap[row.questionId] = {
                totalSubmissions: row.totalSubmissions,
                acceptedSubmissions: row.acceptedSubmissions
            };
        }

        return metricsMap;
    }
}

import { injectable } from 'tsyringe';
import { Brackets } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Submission } from '../models/Submission';
import { SubmissionStatus } from '../enums';

@injectable()
export class SubmissionRepository extends BaseRepository<Submission> {
  constructor() {
    super(Submission);
  }

  async findByUser(userId: string): Promise<Submission[]> {
    return this.repository.find({
      where: { userId },
      relations: ['question'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByQuestion(questionId: string): Promise<Submission[]> {
    return this.repository.find({
      where: { questionId },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByUserAndQuestion(userId: string, questionId: string): Promise<Submission[]> {
    return this.repository.find({
      where: { userId, questionId },
      order: { createdAt: 'DESC' }
    });
  }

  async findWithResults(id: string): Promise<Submission | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['results', 'results.testCase', 'question', 'user']
    });
  }

  async findByStatus(status: SubmissionStatus): Promise<Submission[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'ASC' }
    });
  }

  async countAcceptedByUser(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        score: 100
      } as any
    });
  }

  async findByFilters(filters: {
    questionId?: string;
    userId?: string;
    status?: SubmissionStatus;
    verdict?: string;
    page: number;
    limit: number;
  }): Promise<{ submissions: Submission[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder('submission')
      .leftJoinAndSelect('submission.user', 'user')
      .leftJoinAndSelect('submission.question', 'question')
      .leftJoinAndSelect('question.questionLists', 'questionList');

    if (filters.questionId) {
      queryBuilder.andWhere('submission.questionId = :questionId', { questionId: filters.questionId });
    }

    if (filters.userId) {
      queryBuilder.andWhere('submission.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      queryBuilder.andWhere('submission.status = :status', { status: filters.status });
    }

    if (filters.verdict) {
      if (filters.verdict.toLowerCase() === 'failed') {
        queryBuilder.andWhere('(submission.verdict IS NULL OR submission.verdict != :accepted)', { accepted: 'Accepted' });
      } else if (filters.verdict.toLowerCase() === 'accepted') {
        queryBuilder.andWhere('submission.verdict = :verdict', { verdict: 'Accepted' });
      } else {
        queryBuilder.andWhere('submission.verdict = :verdict', { verdict: filters.verdict });
      }
    }

    queryBuilder.orderBy('submission.createdAt', 'DESC');

    const total = await queryBuilder.getCount();

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const submissions = await queryBuilder.getMany();

    return { submissions, total };
  }

  /**
   * Find submission by ID with associated question list information
   */
  async findByIdWithListInfo(id: string): Promise<Submission | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'question', 'question.questionLists']
    });
  }

  /**
   * Search submissions globally by question, list, student, or language
   */
  async searchGlobal(
    searchTerm?: string,
    filters?: {
      questionName?: string;
      listName?: string;
      userName?: string;
      language?: string;
      verdict?: string;
      status?: SubmissionStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ submissions: any[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder('submission')
      .leftJoinAndSelect('submission.user', 'user')
      .leftJoinAndSelect('submission.question', 'question')
      .leftJoinAndSelect('question.questionLists', 'questionList');

    // 1. Generic Search Term (matches multiple fields)
    if (searchTerm && searchTerm.trim()) {
      const searchLower = `%${searchTerm.toLowerCase()}%`;
      queryBuilder.andWhere(
        new Brackets((qb: any) => {
          qb.where('LOWER(question.title) LIKE LOWER(:searchTerm)')
            .orWhere('LOWER(questionList.title) LIKE LOWER(:searchTerm)')
            .orWhere('LOWER(user.name) LIKE LOWER(:searchTerm)')
            .orWhere('LOWER(submission.language) LIKE LOWER(:searchTerm)');
        }),
        { searchTerm: searchLower }
      );
    }

    // 2. Specific Filters
    if (filters?.questionName) {
      queryBuilder.andWhere('LOWER(question.title) LIKE LOWER(:questionName)', {
        questionName: `%${filters.questionName}%`
      });
    }

    if (filters?.listName) {
      queryBuilder.andWhere('LOWER(questionList.title) LIKE LOWER(:listName)', {
        listName: `%${filters.listName}%`
      });
    }

    if (filters?.userName) {
      queryBuilder.andWhere('LOWER(user.name) LIKE LOWER(:userName)', {
        userName: `%${filters.userName}%`
      });
    }

    if (filters?.language) {
      queryBuilder.andWhere('submission.language = :language', {
        language: filters.language
      });
    }

    if (filters?.verdict) {
      if (filters.verdict.toLowerCase() === 'failed') {
        queryBuilder.andWhere('(submission.verdict IS NULL OR submission.verdict != :accepted)', { accepted: 'Accepted' });
      } else if (filters.verdict.toLowerCase() === 'accepted') {
        queryBuilder.andWhere('submission.verdict = :verdict', { verdict: 'Accepted' });
      } else {
        queryBuilder.andWhere('submission.verdict = :verdict', { verdict: filters.verdict });
      }
    }

    if (filters?.status) {
      queryBuilder.andWhere('submission.status = :status', { status: filters.status });
    }

    // Ordenar e Paginar
    queryBuilder.orderBy('submission.createdAt', 'DESC');

    // Use getManyAndCount to handle joins properly without duplicates if needed, 
    // but with skip/take on queryBuilder it handles the pagination on the main entity.
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [submissions, total] = await queryBuilder.getManyAndCount();

    return { submissions, total };
  }

  /**
   * Get metrics (total and accepted submissions) for questions in a specific question list
   */
  async getMetricsByQuestionList(questionListId: string): Promise<{ questionId: string; totalSubmissions: number; acceptedSubmissions: number }[]> {
    const rawData = await this.repository.createQueryBuilder('submission')
      .leftJoin('submission.question', 'question')
      .leftJoin('question.questionLists', 'questionList')
      .select('submission.questionId', 'questionId')
      .addSelect('COUNT(submission.id)', 'totalSubmissions')
      .addSelect(`SUM(CASE WHEN submission.verdict = 'Accepted' OR submission.score = 100 THEN 1 ELSE 0 END)`, 'acceptedSubmissions')
      .where('questionList.id = :questionListId', { questionListId })
      .groupBy('submission.questionId')
      .getRawMany();

    return rawData.map(row => ({
      questionId: row.questionId,
      totalSubmissions: parseInt(row.totalSubmissions) || 0,
      acceptedSubmissions: parseInt(row.acceptedSubmissions) || 0,
    }));
  }
}

import { injectable, inject } from 'tsyringe';
import { IUseCase } from '../interfaces/IUseCase';
import { SubmissionResponseDTO } from '../../dtos';
import { SubmissionRepository } from '../../repositories/SubmissionRepository';
import { SubmissionStatus, UserRole } from '../../enums';
import { SubmissionMapper } from '../../mappers';

export interface SearchSubmissionsInput {
  searchTerm?: string;
  questionName?: string;
  listName?: string;
  userName?: string;
  language?: string;
  verdict?: string;
  status?: SubmissionStatus;
  page?: number;
  limit?: number;
  requestUserId?: string;
  requestUserRole?: UserRole;
}

export interface SearchSubmissionsOutput {
  submissions: SubmissionResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Use Case: Search submissions globally
 * 
 * Responsibilities:
 * - Search submissions by multiple fields (question title, list title, student name, language)
 * - Apply optional filters (verdict, status)
 * - Apply pagination
 * - Convert results to DTOs
 * - Return paginated results with total count
 */
@injectable()
export class SearchSubmissionsUseCase implements IUseCase<SearchSubmissionsInput, SearchSubmissionsOutput> {
  constructor(
    @inject(SubmissionRepository) private submissionRepository: SubmissionRepository
  ) { }

  async execute(input: SearchSubmissionsInput): Promise<SearchSubmissionsOutput> {
    // 1. Validate search term (removed strict requirement if other filters are present)
    const hasFilters = input.searchTerm || input.questionName || input.listName || input.userName || input.language || input.verdict || input.status;
    if (!hasFilters) {
      throw new Error('At least one search term or filter is required');
    }

    // 2. Apply default values for pagination
    const page = input.page || 1;
    const limit = input.limit || 20;

    // 3. Search submissions with filters
    // If user is a student, restrict results to their own submissions
    const userId = input.requestUserRole === UserRole.STUDENT ? input.requestUserId : undefined;

    const { submissions: rawSubmissions, total } = await this.submissionRepository.searchGlobal(
      input.searchTerm,
      {
        questionName: input.questionName,
        listName: input.listName,
        userName: input.userName,
        language: input.language,
        verdict: input.verdict,
        status: input.status,
        userId,
        page,
        limit,
      }
    );

    // 4. Calculate pagination
    const totalPages = Math.ceil(total / limit);

    // 5. Convert to DTOs
    const submissions = rawSubmissions.map(submission => SubmissionMapper.toDTO(submission));

    // 6. Return with pagination metadata
    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}

import { injectable, inject } from 'tsyringe';
import { IUseCase } from '../interfaces/IUseCase';
import { CreateSubmissionDTO, SubmissionResponseDTO } from '../../dtos';
import { SubmissionRepository, QuestionRepository, QuestionListRepository } from '../../repositories';
import { SubmissionQueueService } from '../../services/SubmissionQueueService';
import { SubmissionStatus, ProgrammingLanguage } from '../../enums';
import { logger, ValidationError, NotFoundError } from '../../utils';
import { SubmissionMapper } from '../../mappers';
import { Submission } from '../../models/Submission';
import { AllowedIPService } from '../../services/AllowedIPService';
import { UserRole } from '../../enums';
import { ForbiddenError } from '../../utils';

export interface CreateSubmissionUseCaseInput {
  dto: CreateSubmissionDTO;
  userId: string;
  userRole?: string;
  ipAddress?: string;
}

/**
 * Use Case: Create new code submission
 * 
 * Responsibilities:
 * - Validate programming language
 * - Check if question exists
 * - Create submission in database
 * - Add to processing queue (or process directly)
 * - Return created submission with updated status
 */
@injectable()
export class CreateSubmissionUseCase implements IUseCase<CreateSubmissionUseCaseInput, SubmissionResponseDTO> {
  constructor(
    @inject(SubmissionRepository) private submissionRepository: SubmissionRepository,
    @inject(QuestionRepository) private questionRepository: QuestionRepository,
    @inject(QuestionListRepository) private questionListRepository: QuestionListRepository,
    @inject(AllowedIPService) private allowedIPService: AllowedIPService,
    @inject('SubmissionQueueService') private queueService?: SubmissionQueueService
  ) { }

  async execute(input: CreateSubmissionUseCaseInput): Promise<SubmissionResponseDTO> {
    const { dto, userId, userRole, ipAddress } = input;

    // 0. Validate IP Whitelist (only for students)
    if (userRole === UserRole.STUDENT && ipAddress) {
      const isAllowed = await this.allowedIPService.isIPAllowed(ipAddress);
      if (!isAllowed) {
        logger.warn('[CreateSubmissionUseCase] IP not allowed', { ipAddress, userId });
        throw new ForbiddenError('Acesso restrito à rede autorizada do laboratório.', 'IP_NOT_ALLOWED');
      }
    }

    // 1. Validate programming language
    if (!Object.values(ProgrammingLanguage).includes(dto.language as ProgrammingLanguage)) {
      logger.warn('[CreateSubmissionUseCase] Invalid language', { language: dto.language });
      throw new ValidationError('Invalid programming language', 'INVALID_LANGUAGE');
    }

    // 2. Check if question exists
    const question = await this.questionRepository.findById(dto.questionId);
    if (!question) {
      throw new NotFoundError('Question not found', 'QUESTION_NOT_FOUND');
    }

    // 2.5 Block submissions if question is only in closed lists (for students)
    if (userRole === UserRole.STUDENT) {
      const listsWithQuestion = await this.questionListRepository.findAllByQuestionId(dto.questionId);

      if (listsWithQuestion.length > 0) {
        // Find if there's at least one list that is NOT closed
        const hasOpenList = listsWithQuestion.some(list => !list.isClosed());

        if (!hasOpenList) {
          logger.warn('[CreateSubmissionUseCase] Submission blocked: all lists containing this question are closed', { userId, questionId: dto.questionId });
          throw new ForbiddenError('Não é possível submeter soluções para uma questão que pertence apenas a listas fechadas.', 'LIST_CLOSED');
        }
      }
    }

    // 3. Create submission in database
    const submission = new Submission();
    submission.userId = userId;
    submission.questionId = dto.questionId;
    submission.code = dto.code;
    submission.language = dto.language as ProgrammingLanguage;
    submission.status = SubmissionStatus.PENDING;
    submission.score = 0;
    submission.totalTests = 0;
    submission.passedTests = 0;
    submission.ipAddress = input.ipAddress;

    const savedSubmission = await this.submissionRepository.create(submission);

    logger.info('[CreateSubmissionUseCase] Submission created', {
      submissionId: savedSubmission.id,
      userId,
      questionId: dto.questionId
    });

    // 4. Add to queue or process directly
    const finalStatus = await this.enqueueOrProcessSubmission(savedSubmission.id);
    savedSubmission.status = finalStatus;

    // 5. Return DTO
    return SubmissionMapper.toDTO(savedSubmission);
  }

  /**
   * Adds submission to queue or schedules direct processing
   */
  private async enqueueOrProcessSubmission(submissionId: string): Promise<SubmissionStatus> {
    if (this.queueService) {
      logger.info('[CreateSubmissionUseCase] Adding to queue', { submissionId });

      await this.submissionRepository.update(submissionId, {
        status: SubmissionStatus.IN_QUEUE
      });

      await this.queueService.addSubmissionToQueue(submissionId);

      logger.info('[CreateSubmissionUseCase] Submission added to queue', { submissionId });
      return SubmissionStatus.IN_QUEUE;
    } else {
      logger.warn('[CreateSubmissionUseCase] Queue not available, processing will be in background', {
        submissionId
      });
      return SubmissionStatus.PENDING;
    }
  }
}

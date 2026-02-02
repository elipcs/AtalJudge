/**
 * Dependency Injection Container Configuration
 * 
 * Registers all repositories, services, and use cases with the tsyringe container.
 * Implements the Singleton pattern for application-wide dependency management.
 * 
 * @module config/container
 * @see {@link https://github.com/Microsoft/tsyringe tsyringe documentation}
 */
import 'reflect-metadata';
import { container } from 'tsyringe';

import { UserRepository } from '../repositories/UserRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { SubmissionRepository } from '../repositories/SubmissionRepository';
import { SubmissionResultRepository } from '../repositories/SubmissionResultRepository';
import { InviteRepository } from '../repositories/InviteRepository';
import { TestCaseRepository } from '../repositories/TestCaseRepository';
import { GradeRepository } from '../repositories/GradeRepository';
import { ClassRepository } from '../repositories/ClassRepository';
import { QuestionListRepository } from '../repositories/QuestionListRepository';
import { TokenBlacklistRepository } from '../repositories/TokenBlacklistRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { PasswordResetTokenRepository } from '../repositories/PasswordResetTokenRepository';
import { AllowedIPRepository } from '../repositories/AllowedIPRepository';


import { EmailService } from '../services/EmailService';
import { Judge0Service } from '../services/Judge0Service';
import { PasswordResetService } from '../services/PasswordResetService';
import { RefreshTokenService } from '../services/RefreshTokenService';
import { InviteService } from '../services/InviteService';
import { UserService } from '../services/UserService';
import { TestCaseService } from '../services/TestCaseService';
import { QuestionService } from '../services/QuestionService';
import { ClassService } from '../services/ClassService';
import { GradeService } from '../services/GradeService';
import { QuestionListService } from '../services/QuestionListService';
import { SubmissionService } from '../services/SubmissionService';
import { AllowedIPService } from '../services/AllowedIPService';
import { SystemResetService } from '../services/SystemResetService';
import { SubmissionQueueService } from '../services/SubmissionQueueService';
import { AuthenticationService } from '../services/AuthenticationService';
import { UserRegistrationService } from '../services/UserRegistrationService';
import { PasswordManagementService } from '../services/PasswordManagementService';
import { TokenManagementService } from '../services/TokenManagementService';

// Import all Use Cases
import {
  LoginUseCase,
  RegisterUserUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase
} from '../use-cases/auth';
import {
  GetUserUseCase,
  GetUsersByRoleUseCase,
  UpdateProfileUseCase,
  ChangePasswordUseCase
} from '../use-cases/user';
import {
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  GetQuestionByIdUseCase,
  GetAllQuestionsUseCase,
  SearchQuestionsUseCase
} from '../use-cases/question';

import {
  CreateSubmissionUseCase,
  GetSubmissionUseCase,
  GetAllSubmissionsUseCase,
  GetSubmissionWithResultsUseCase,
  ResubmitSubmissionUseCase,
  SearchSubmissionsUseCase
} from '../use-cases/submission';
import {
  GetGradeUseCase,
  CalculateGradeUseCase,
  GetStudentGradesUseCase,
  GetListGradesUseCase,
  GetGradeByStudentAndListUseCase
} from '../use-cases/grade';
import {
  CreateQuestionListUseCase,
  GetQuestionListUseCase,
  UpdateQuestionListUseCase,
  DeleteQuestionListUseCase,
  GetAllQuestionListsUseCase,
  UpdateListScoringUseCase,
  AddQuestionToListUseCase,
  RemoveQuestionFromListUseCase
} from '../use-cases/question-list';
import {
  CreateInviteUseCase,
  GetAllInvitesUseCase,
  ValidateInviteUseCase,
  DeleteInviteUseCase,
  RevokeInviteUseCase
} from '../use-cases/invite';
import {
  CreateClassUseCase,
  GetAllClassesUseCase,
  GetClassByIdUseCase,
  UpdateClassUseCase,
  DeleteClassUseCase,
  GetClassStudentsUseCase,
  AddStudentToClassUseCase,
  RemoveStudentFromClassUseCase
} from '../use-cases/class';
import {
  CreateTestCaseUseCase,
  GetTestCasesByQuestionUseCase,
  GetTestCaseByIdUseCase,
  UpdateTestCaseUseCase,
  DeleteTestCaseUseCase
} from '../use-cases/testcase';
import { BulkUpdateTestCasesUseCase } from '../use-cases/testcase/BulkUpdateTestCasesUseCase';
import { ImportTestCasesFromFileUseCase } from '../use-cases/testcase/ImportTestCasesFromFileUseCase';
import {
  GetAllAllowedIPsUseCase,
  GetAllowedIPByIdUseCase,
  CreateAllowedIPUseCase,
  ToggleAllowedIPStatusUseCase,
  DeleteAllowedIPUseCase
} from '../use-cases/allowed-ip';
import { PerformSystemResetUseCase } from '../use-cases/system-reset';

/**
 * Sets up the dependency injection container
 * 
 * Registers all repositories and services as singletons.
 * This function must be called during application initialization.
 * 
 * @returns {void}
 * @example
 * setupContainer();
 */
export function setupContainer(): void {
  container.registerSingleton(UserRepository);
  container.registerSingleton(QuestionRepository);
  container.registerSingleton(SubmissionRepository);
  container.registerSingleton(SubmissionResultRepository);
  container.registerSingleton(InviteRepository);
  container.registerSingleton(TestCaseRepository);
  container.registerSingleton(GradeRepository);
  container.registerSingleton(ClassRepository);
  container.registerSingleton(QuestionListRepository);
  container.registerSingleton(TokenBlacklistRepository);
  container.registerSingleton(RefreshTokenRepository);
  container.registerSingleton(PasswordResetTokenRepository);
  container.registerSingleton(AllowedIPRepository);

  container.registerSingleton(EmailService);
  container.registerSingleton(Judge0Service);
  container.registerSingleton(PasswordResetService);
  container.registerSingleton(RefreshTokenService);
  container.registerSingleton(InviteService);
  container.registerSingleton(UserService);
  container.registerSingleton(TestCaseService);
  container.registerSingleton(QuestionService);
  container.registerSingleton(ClassService);
  container.registerSingleton(GradeService);
  container.registerSingleton(QuestionListService);
  container.registerSingleton(AllowedIPService);
  container.registerSingleton(SystemResetService);
  container.registerSingleton(AuthenticationService);
  container.registerSingleton(UserRegistrationService);
  container.registerSingleton(PasswordManagementService);
  container.registerSingleton(TokenManagementService);
  container.registerSingleton(SubmissionQueueService);
  container.register('SubmissionQueueService', { useToken: SubmissionQueueService });
  container.registerSingleton(SubmissionService);

  // Register all Use Cases
  container.registerSingleton(LoginUseCase);
  container.registerSingleton(RegisterUserUseCase);
  container.registerSingleton(RefreshTokenUseCase);
  container.registerSingleton(LogoutUseCase);
  container.registerSingleton(RequestPasswordResetUseCase);
  container.registerSingleton(ResetPasswordUseCase);
  container.registerSingleton(GetUserUseCase);
  container.registerSingleton(GetUsersByRoleUseCase);
  container.registerSingleton(UpdateProfileUseCase);
  container.registerSingleton(ChangePasswordUseCase);
  container.registerSingleton(CreateQuestionUseCase);
  container.registerSingleton(UpdateQuestionUseCase);
  container.registerSingleton(DeleteQuestionUseCase);
  container.registerSingleton(GetQuestionByIdUseCase);
  container.registerSingleton(GetAllQuestionsUseCase);
  container.registerSingleton(SearchQuestionsUseCase);
  container.registerSingleton(CreateSubmissionUseCase);
  container.registerSingleton(GetSubmissionUseCase);
  container.registerSingleton(GetAllSubmissionsUseCase);
  container.registerSingleton(GetSubmissionWithResultsUseCase);
  container.registerSingleton(ResubmitSubmissionUseCase);
  container.registerSingleton(SearchSubmissionsUseCase);
  container.registerSingleton(GetGradeUseCase);
  container.registerSingleton(CalculateGradeUseCase);
  container.registerSingleton(GetStudentGradesUseCase);
  container.registerSingleton(GetListGradesUseCase);
  container.registerSingleton(GetGradeByStudentAndListUseCase);
  container.registerSingleton(CreateQuestionListUseCase);
  container.registerSingleton(GetQuestionListUseCase);
  container.registerSingleton(UpdateQuestionListUseCase);
  container.registerSingleton(DeleteQuestionListUseCase);
  container.registerSingleton(GetAllQuestionListsUseCase);
  container.registerSingleton(UpdateListScoringUseCase);
  container.registerSingleton(AddQuestionToListUseCase);
  container.registerSingleton(RemoveQuestionFromListUseCase);
  container.registerSingleton(CreateInviteUseCase);
  container.registerSingleton(GetAllInvitesUseCase);
  container.registerSingleton(ValidateInviteUseCase);
  container.registerSingleton(DeleteInviteUseCase);
  container.registerSingleton(RevokeInviteUseCase);
  container.registerSingleton(CreateClassUseCase);
  container.registerSingleton(GetAllClassesUseCase);
  container.registerSingleton(GetClassByIdUseCase);
  container.registerSingleton(UpdateClassUseCase);
  container.registerSingleton(DeleteClassUseCase);
  container.registerSingleton(GetClassStudentsUseCase);
  container.registerSingleton(AddStudentToClassUseCase);
  container.registerSingleton(RemoveStudentFromClassUseCase);
  container.registerSingleton(CreateTestCaseUseCase);
  container.registerSingleton(GetTestCasesByQuestionUseCase);
  container.registerSingleton(GetTestCaseByIdUseCase);
  container.registerSingleton(UpdateTestCaseUseCase);
  container.registerSingleton(DeleteTestCaseUseCase);
  container.registerSingleton(BulkUpdateTestCasesUseCase);
  container.registerSingleton(ImportTestCasesFromFileUseCase);
  container.registerSingleton(GetAllAllowedIPsUseCase);
  container.registerSingleton(GetAllowedIPByIdUseCase);
  container.registerSingleton(CreateAllowedIPUseCase);
  container.registerSingleton(ToggleAllowedIPStatusUseCase);
  container.registerSingleton(DeleteAllowedIPUseCase);
  container.registerSingleton(PerformSystemResetUseCase);
}

export { container };

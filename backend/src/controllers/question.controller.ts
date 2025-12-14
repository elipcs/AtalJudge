/**
 * @module controllers/question
 * @description REST API controller for question endpoints
 * Manages question creation, retrieval, updates, and deletion
 * @class QuestionController
 */
import { Router, Response } from 'express';
import multer from 'multer';
import { CreateQuestionUseCase, UpdateQuestionUseCase, DeleteQuestionUseCase, GetQuestionByIdUseCase, GetAllQuestionsUseCase, SearchQuestionsUseCase } from '../use-cases/question';
import { ImportQuestionsFromCsvUseCase } from '../use-cases/question/ImportQuestionsFromCsvUseCase';
import { authenticate, requireTeacher, AuthRequest } from '../middlewares';
import { successResponse } from '../utils/responses';
import { convertQuestionPayload } from '../middlewares/payload-converter.middleware';
import { asyncHandler } from '../utils/asyncHandler';

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

function createQuestionController(
  createQuestionUseCase: CreateQuestionUseCase,
  updateQuestionUseCase: UpdateQuestionUseCase,
  deleteQuestionUseCase: DeleteQuestionUseCase,
  getQuestionByIdUseCase: GetQuestionByIdUseCase,
  getAllQuestionsUseCase: GetAllQuestionsUseCase,
  searchQuestionsUseCase: SearchQuestionsUseCase,
  importQuestionsFromCsvUseCase: ImportQuestionsFromCsvUseCase
): Router {
  const router = Router();

  router.post(
    '/',
    authenticate,
    requireTeacher,
    convertQuestionPayload,
    asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
      const question = await createQuestionUseCase.execute({
        dto: req.body
      });

      successResponse(res, question, 'Question created successfully', 201);
    })
  );

  router.post(
    '/import-csv',
    authenticate,
    requireTeacher,
    upload.single('file'),
    asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No CSV file uploaded'
        });
        return;
      }

      // Convert buffer to string
      const csvContent = req.file.buffer.toString('utf-8');

      const result = await importQuestionsFromCsvUseCase.execute({
        csvContent
      });

      successResponse(res, result, result.message, 201);
    })
  );

  router.get(
    '/',
    authenticate,
    asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
      const questions = await getAllQuestionsUseCase.execute();

      successResponse(res, { questions }, 'List of questions');
    })
  );

  router.get(
    '/search/global',
    authenticate,
    asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
      const searchTerm = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!searchTerm || searchTerm.trim().length === 0) {
        successResponse(res, { questions: [], total: 0, page, limit }, 'No search term provided');
        return;
      }

      const result = await searchQuestionsUseCase.execute({
        searchTerm: searchTerm.trim(),
        page,
        limit
      });

      successResponse(res, result, 'Search results');
    })
  );

  router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
      const question = await getQuestionByIdUseCase.execute(req.params.id);

      successResponse(res, question, 'Question data');
    })
  );

  router.put(
    '/:id',
    authenticate,
    requireTeacher,
    convertQuestionPayload,
    asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
      const question = await updateQuestionUseCase.execute({
        questionId: req.params.id,
        dto: req.body,
        userId: req.user!.sub,
        userRole: req.user!.role
      });

      successResponse(res, question, 'Question updated successfully');
    })
  );



  router.delete(
    '/:id',
    authenticate,
    requireTeacher,
    asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
      await deleteQuestionUseCase.execute({
        questionId: req.params.id,
        userId: req.user!.sub
      });

      successResponse(res, null, 'Question deleted successfully');
    })
  );

  return router;
}

export default createQuestionController;


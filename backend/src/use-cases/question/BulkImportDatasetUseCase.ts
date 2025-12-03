import { injectable, inject } from 'tsyringe';
import { IUseCase } from '../interfaces/IUseCase';
import { BulkImportDatasetDTO, BulkImportDatasetResponseDTO } from '../../dtos';
import { DatasetService } from '../../services/DatasetService';
import { logger, ValidationError } from '../../utils';

/**
 * Use Case: Bulk Import All Dataset Problems
 * 
 * Responsibilities:
 * - List all problems from dataset
 * - Import each problem with its test cases
 * - Handle errors gracefully
 * - Provide progress tracking
 * - Return comprehensive import summary
 */
@injectable()
export class BulkImportDatasetUseCase implements IUseCase<BulkImportDatasetDTO, BulkImportDatasetResponseDTO> {
  constructor(
    @inject(DatasetService) private datasetService: DatasetService
  ) {}

  /**
   * Set JWT token for authenticated requests to test-case-manager
   */
  private setAuthToken(dto: BulkImportDatasetDTO): void {
    if (dto.jwtToken) {
      this.datasetService.setJwtToken(dto.jwtToken);
    }
  }

  async execute(dto: BulkImportDatasetDTO): Promise<BulkImportDatasetResponseDTO> {
    const startTime = Date.now();
    
    // Set JWT token for authentication
    this.setAuthToken(dto);
    
    logger.info('[BulkImportDatasetUseCase] Starting bulk import', {
      config: dto.datasetConfig,
      maxProblems: dto.maxProblems,
      skipExisting: dto.skipExisting
    });

    // 1. Validate dataset config
    if (!['1x', '2x', '3x'].includes(dto.datasetConfig)) {
      throw new ValidationError(
        'Invalid dataset configuration. Must be 1x, 2x, or 3x',
        'INVALID_DATASET_CONFIG'
      );
    }

    try {
      // 2. Call test-case-manager to import bulk dataset
      // This will list ALL problems and import them directly
      logger.info(`[BulkImportDatasetUseCase] Calling test-case-manager to import dataset (${dto.datasetConfig})`);
      
      const maxProblems = dto.maxProblems || 1000;
      await this.datasetService.listAllProblems(
        dto.datasetConfig,
        maxProblems
      );

      // Calculate duration
      const duration = Date.now() - startTime;

      // Build response
      const response: BulkImportDatasetResponseDTO = {
        success: true,
        summary: {
          totalAttempted: 0,
          successfulImports: 0,
          failedImports: 0,
          skippedExisting: 0,
          totalTestCasesImported: 0
        },
        importedQuestions: [],
        errors: [],
        message: `Bulk import iniciado: test-case-manager está importando o dataset ${dto.datasetConfig}. Verifique os logs para progresso.`,
        duration
      };

      logger.info('[BulkImportDatasetUseCase] Bulk import initiated', {
        duration: `${(duration / 1000).toFixed(2)}s`,
        config: dto.datasetConfig
      });

      return response;

    } catch (error: any) {
      logger.error('[BulkImportDatasetUseCase] Fatal error during bulk import:', error);
      throw error;
    }
  }
}

import { injectable, inject } from 'tsyringe';
import { IUseCase } from '../interfaces/IUseCase';
import { ClassResponseDTO } from '../../dtos';
import { ClassService } from '../../services/ClassService';
import { UserRole } from '../../enums';

export interface TransferClassInput {
    classId: string;
    newProfessorId: string;
    userId: string;
    userRole: UserRole;
}

@injectable()
export class TransferClassUseCase implements IUseCase<TransferClassInput, ClassResponseDTO> {
    constructor(
        @inject(ClassService) private classService: ClassService
    ) { }

    async execute(input: TransferClassInput): Promise<ClassResponseDTO> {
        const { classId, newProfessorId, userId, userRole } = input;
        return this.classService.transferClass(classId, newProfessorId, userId, userRole);
    }
}

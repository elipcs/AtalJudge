import { injectable, inject } from 'tsyringe';
import { IUseCase } from '../interfaces/IUseCase';
import { UserRepository } from '../../repositories';
import { ForbiddenError, NotFoundError, logger } from '../../utils';

interface DeleteUserInput {
    userIdToRemove: string;
    currentUserId: string;
}

/**
 * Use Case: Delete a user
 * 
 * Responsibilities:
 * - Validate that the user exists
 * - Ensure the user is not deleting themselves
 * - Remove the user from the repository
 */
@injectable()
export class DeleteUserUseCase implements IUseCase<DeleteUserInput, void> {
    constructor(
        @inject(UserRepository) private userRepository: UserRepository
    ) { }

    async execute(input: DeleteUserInput): Promise<void> {
        const { userIdToRemove, currentUserId } = input;

        logger.info('[DeleteUserUseCase] Deleting user', { userIdToRemove, currentUserId });

        // 1. Prevent self-deletion
        if (userIdToRemove === currentUserId) {
            logger.warn('[DeleteUserUseCase] User attempted to delete themselves', { currentUserId });
            throw new ForbiddenError('You cannot delete your own account from here.', 'SELF_DELETION_FORBIDDEN');
        }

        // 2. Find user
        const user = await this.userRepository.findById(userIdToRemove);
        if (!user) {
            logger.warn('[DeleteUserUseCase] User not found', { userIdToRemove });
            throw new NotFoundError(`User with ID ${userIdToRemove} not found`, 'USER_NOT_FOUND');
        }

        // 3. Delete user
        // Note: Database relations (like submissions) are handled by CASCADE or should be nullified if needed.
        // In this system, User has @OneToMany submissions which should ideally be handled by foreign key constraints in DB.
        // BaseRepository.delete uses repository.delete which executes a DELETE query.

        const deleted = await this.userRepository.delete(userIdToRemove);
        if (!deleted) {
            throw new Error('Failed to delete user');
        }

        logger.info('[DeleteUserUseCase] User deleted successfully', { userIdToRemove });
    }
}

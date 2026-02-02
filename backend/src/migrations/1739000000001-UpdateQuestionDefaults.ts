import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQuestionDefaults1739000000001 implements MigrationInterface {
    name = 'UpdateQuestionDefaults1739000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update column defaults
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "time_limit_ms" SET DEFAULT 5000`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "memory_limit_kb" SET DEFAULT 512000`);

        // Update existing records that had the old defaults
        await queryRunner.query(`UPDATE "questions" SET "time_limit_ms" = 5000 WHERE "time_limit_ms" = 1000`);
        await queryRunner.query(`UPDATE "questions" SET "memory_limit_kb" = 512000 WHERE "memory_limit_kb" = 64000`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert column defaults
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "time_limit_ms" SET DEFAULT 1000`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "memory_limit_kb" SET DEFAULT 64000`);

        // Revert existing records (This is best effort, we can't know for sure if 5000 was set by user or migration)
        // But for "down", reverting to old defaults for 5000/512000 is reasonable assumption for strict revert
        await queryRunner.query(`UPDATE "questions" SET "time_limit_ms" = 1000 WHERE "time_limit_ms" = 5000`);
        await queryRunner.query(`UPDATE "questions" SET "memory_limit_kb" = 64000 WHERE "memory_limit_kb" = 512000`);
    }
}

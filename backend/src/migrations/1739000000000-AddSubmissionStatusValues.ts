import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmissionStatusValues1739000000000 implements MigrationInterface {
  name = 'AddSubmissionStatusValues1739000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'completed' and 'error' to the submission_status enum
    // Note: We use IF NOT EXISTS to avoid errors if they were already added manually
    // However, PostgreSQL doesn't support IF NOT EXISTS for enum values directly in a simple way
    // without a DO block, but TypeORM migrations usually run once.

    // Use IF NOT EXISTS which is supported in Postgres 12+
    await queryRunner.query(`ALTER TYPE "submission_status" ADD VALUE IF NOT EXISTS 'completed'`);
    await queryRunner.query(`ALTER TYPE "submission_status" ADD VALUE IF NOT EXISTS 'error'`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing values from an ENUM type
    // To revert this, we would have to recreate the type, which is complex and risky for data.
    // For this migration, we will leave the values as they are strictly additive.
  }
}

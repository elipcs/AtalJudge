import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInternalErrorToJudgeVerdict1739000000002 implements MigrationInterface {
    name = 'AddInternalErrorToJudgeVerdict1739000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "judge_verdict" ADD VALUE IF NOT EXISTS 'Internal Error'`);
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Enum values cannot be removed easily in Postgres
    }
}

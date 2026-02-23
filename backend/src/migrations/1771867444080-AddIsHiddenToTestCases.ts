import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsHiddenToTestCases1771867444080 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "test_cases" ADD "is_hidden" boolean NOT NULL DEFAULT false`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "test_cases" DROP COLUMN "is_hidden"`
        );
    }

}

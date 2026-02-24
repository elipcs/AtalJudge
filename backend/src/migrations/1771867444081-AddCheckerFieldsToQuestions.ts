import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCheckerFieldsToQuestions1771867444081 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "questions" ADD "use_checker" boolean NOT NULL DEFAULT false`
        );
        await queryRunner.query(
            `ALTER TABLE "questions" ADD "checker_code" text`
        );
        await queryRunner.query(
            `ALTER TABLE "questions" ADD "checker_language" varchar(20)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "questions" DROP COLUMN "checker_language"`
        );
        await queryRunner.query(
            `ALTER TABLE "questions" DROP COLUMN "checker_code"`
        );
        await queryRunner.query(
            `ALTER TABLE "questions" DROP COLUMN "use_checker"`
        );
    }

}

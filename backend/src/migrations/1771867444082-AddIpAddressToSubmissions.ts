import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIpAddressToSubmissions1771867444082 implements MigrationInterface {
    name = 'AddIpAddressToSubmissions1771867444082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "submissions" ADD "ip_address" character varying(45)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "submissions" DROP COLUMN "ip_address"`);
    }

}

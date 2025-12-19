import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshToken1766110842000 implements MigrationInterface {
  name = 'AddRefreshToken1766110842000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "refreshToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
  }
}

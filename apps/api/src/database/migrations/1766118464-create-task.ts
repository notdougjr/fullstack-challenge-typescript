import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTask1766118464000 implements MigrationInterface {
  name = 'CreateTask1766118464000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "task_status_enum" AS ENUM('PENDING', 'COMPLETED')`,
    );

    await queryRunner.query(
      `CREATE TYPE "task_type_enum" AS ENUM('TASK', 'SUBTASK')`,
    );

    await queryRunner.query(
      `CREATE TABLE "task" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "status" "task_status_enum" NOT NULL DEFAULT 'PENDING',
        "type" "task_type_enum" NOT NULL DEFAULT 'TASK',
        "createdBy" uuid NOT NULL,
        "assignedTo" uuid,
        "parentId" uuid,
        "startDate" date,
        "dueDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE "task_type_enum"`);
    await queryRunner.query(`DROP TYPE "task_status_enum"`);
  }
}


import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class ModifyCoverUrlColumnMigration1663346287926 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'news',
            'cover_url',
            new TableColumn({
                name: 'cover_url',
                type: 'text',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'news',
            'cover_url',
            new TableColumn({
                name: 'cover_url',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }
}
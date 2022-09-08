import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddLinkColumnToNewsTableMigration1662628394714 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'news',
            new TableColumn({
                name: 'link',
                type: 'text',
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('news', 'link');
    }
}
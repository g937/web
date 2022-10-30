import {MigrationInterface, QueryRunner, TableColumn} from "typeorm"

export class AddDateColumnToNewsTableMigration1665658833244 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'news',
            new TableColumn({
                name: 'date',
                type: 'datetime',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('news', 'date');
    }
}

import {MigrationInterface, QueryRunner, TableColumn} from "typeorm"

export class ChangeTitleColumnMigration1670062394614 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'news',
            'title',
            new TableColumn({
                name: 'title',
                type: 'varchar(255)',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'news',
            'title',
            new TableColumn({
                name: 'title',
                type: 'text',
                isNullable: true,
            }),
        );
    }

}

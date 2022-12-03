import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'news' })
export class NewsEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    id: number;

    @Column({ name: 'title', type: 'varchar', nullable: true })
    title: string | null;

    @Column({ name: 'lead', type: 'text', nullable: true })
    lead: string | null;

    @Column({ name: 'content', type: 'text', nullable: true })
    content: string | null;

    @Column({ name: 'link', type: 'text', nullable: false })
    link: string;

    @Column({ name: 'cover_url', type: 'text', nullable: true })
    coverUrl: string | null;

    @Column({ name: 'date', type: 'datetime', nullable: true })
    date: Date | null;
}

export class ParsedResultDto {
    title?: string | null;

    coverUrl?: string | null;

    lead?: string | null;

    content?: string | null;

    date?: Date | null;

    links: string[];
}

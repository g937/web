import {NewsEntity} from "../../database/entities/news.entity";

export class PaginateResponseDto{
    total: number;
    data: NewsEntity[];
}
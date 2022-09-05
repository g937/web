import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { NewsEntity } from "../database/entities/news.entity";
import { NewsService } from "./news.service";

@ApiTags('News')
@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @Get()
    async getNews(): Promise<NewsEntity[]> {
        return this.newsService.getNews();
    }

    @Get(':id')
    async getNew(@Param('id') id: number): Promise<NewsEntity> {
        return this.newsService.getNew(id);
    }
}
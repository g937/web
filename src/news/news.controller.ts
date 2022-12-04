import {Controller, Get, Param, Query} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { NewsService } from "./news.service";
import {PaginateResponseDto} from "./dto/paginate-response.dto";
import {ListQueryDto} from "../common/list-query.dto";
import {NewsEntity} from "../database/entities/news.entity";

@ApiTags('News')
@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @Get()
    async getNews(@Query() query: ListQueryDto): Promise<PaginateResponseDto> {
        return this.newsService.getNews(query);
    }

    @Get(':id')
    async getOne(@Param('id') id: number): Promise<NewsEntity> {
        return this.newsService.getOne(id);
    }
}
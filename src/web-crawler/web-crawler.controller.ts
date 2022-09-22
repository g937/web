import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { WebCrawlerService } from "./web-crawler.service";

@ApiTags('Web Crawler')
@Controller('crawl')
export class WebCrawlerController {
    constructor(private readonly webCrawlerService: WebCrawlerService) {}

    @Get()
    async crawl(): Promise<void> {
        await this.webCrawlerService.crawl();
    }
}

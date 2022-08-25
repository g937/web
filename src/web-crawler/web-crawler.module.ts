import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NewsEntity } from "../database/entities/news.entity";
import { WebCrawlerController } from "./web-crawler.controller";
import { WebCrawlerService } from "./web-crawler.service";

@Module({
    imports: [TypeOrmModule.forFeature([NewsEntity])],
    providers: [WebCrawlerService],
    controllers: [WebCrawlerController],
  })
  export class WebCrawlerModule {}
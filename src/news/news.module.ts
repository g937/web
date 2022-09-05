import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NewsEntity } from "../database/entities/news.entity";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity])],
  providers: [NewsService],
  controllers: [NewsController],
})
export class NewsModule { }
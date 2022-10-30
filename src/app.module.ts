import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Config } from './config';
import { WebCrawlerModule } from './web-crawler/web-crawler.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot(Config.getOrmConfig()), WebCrawlerModule, ScheduleModule.forRoot(), NewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

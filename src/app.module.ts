import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Config } from './config';
import { WebCrawlerModule } from './web-crawler/web-crawler.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot(Config.getOrmConfig()), WebCrawlerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { NewsEntity } from '../database/entities/news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

  async getNews(): Promise<NewsEntity[]> {
    return this.newsRepository
      .createQueryBuilder('news')
      .where('news.title != :title', { title: '' })
      .orderBy('news.id', 'DESC')
      .getMany();
  }

  async getNew(id: number): Promise<NewsEntity> {
    return this.newsRepository.findOne({ where: { id } });
  }
}
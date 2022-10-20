import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { NewsEntity } from '../database/entities/news.entity';
import {paginate} from "../common/paginate";
import {PaginateResponseDto} from "./dto/paginate-response.dto";
import {ListQueryDto} from "../common/list-query.dto";

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

  async getNews(query: ListQueryDto): Promise<PaginateResponseDto> {
    const news = await this.newsRepository
      .createQueryBuilder('news')
      .where('news.title != :title', { title: '' })
      .orderBy('news.id', 'DESC')
      .getMany();

    return { total: news.length, data: paginate(news, query.page) };
  }

  async getNew(id: number): Promise<NewsEntity> {
    return this.newsRepository.findOne({ where: { id } });
  }
}
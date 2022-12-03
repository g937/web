import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import cheerio from 'cheerio';
import util from 'util';
import dayjs from 'dayjs';

import { NewsEntity } from '../database/entities/news.entity';
import { ParsedResultDto } from './dto/parsed-result.dto';

const wait = util.promisify(setTimeout);

@Injectable()
export class WebCrawlerService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) { }

  public async crawl(): Promise<void> {
    let pagesToVisit = [
      'https://hvg.hu',
      'https://index.hu',
      'https://www.origo.hu',
      'https://www.portfolio.hu',
    ];

    const linksToVisit = await this.getLinksFromPages(pagesToVisit);
    for (const link of linksToVisit) {
      try {
        const alreadyCrawled = await this.newsRepository.findOne({
          where: { link },
        });

        if (!alreadyCrawled) {
          const page = link.split('/gazdasag');
          const html = await this.getRequest(link);
          const parsedResult = this.switchParser(page[0].includes('dex.hu') ? 'https://index.hu' : page[0], html);
          await this.saveParsedResult(parsedResult, link);
          await wait(5000);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async getLinksFromPages(pagesToVisit: string[]): Promise<string[]> {
    const linksToVisit: string[] = [];
    for (const page of pagesToVisit) {
      await wait(5000);
      const html = await this.getRequest(page);
      const parsedResult = this.switchParser(page, html);
      const links = this.filterDuplicatedItems(parsedResult.links);
      for (const link of links) {
        if (page == 'https://hvg.hu') {
          linksToVisit.push('https://hvg.hu' + link);
        } else if (page == 'https://www.portfolio.hu') {
          linksToVisit.push('https://www.portfolio.hu' + link);
        } else {
          linksToVisit.push(link);
        }
        await wait(5000);
      }
    }
    return linksToVisit;
  }

  switchParser(page, html): ParsedResultDto {
    switch (page) {
      case 'https://hvg.hu':
        return this.hvgParser(html);
      case 'https://index.hu':
        return this.indexParser(html);
      case 'https://www.origo.hu':
        return this.origoParser(html);
      case 'https://www.portfolio.hu':
        return this.portfolioParser(html);
    }
  }

  filterDuplicatedItems(links: string[]): string[] {
    const filteredLinksToVisit: string[] = [];
    links.forEach((link: string) => {
      const alreadyExists = filteredLinksToVisit.includes(link);
      if (!alreadyExists) {
        filteredLinksToVisit.push(link);
      }
    });
    return filteredLinksToVisit;
  }

  async saveParsedResult(parsedResult: any, link: string): Promise<void> {
    if (!(parsedResult?.title === undefined || parsedResult?.title === '')) {
      const data = {
        title: parsedResult.title,
        coverUrl:
          parsedResult.coverUrl == 'https:undefined'
            ? null
            : parsedResult.coverUrl,
        lead: parsedResult.lead,
        content: parsedResult.content,
        date: parsedResult.date,
        link,
      };
      try {
        await this.newsRepository.save(data);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getRequest(url: string): Promise<AxiosResponse> {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.log(error)
    }
  }

  hvgParser(html: string): ParsedResultDto {
    const $ = cheerio.load(html);

    const title = $('.article-title').text().trim();

    const coverUrl = $('.article-cover-img > img').attr('src');

    const lead = $('[data-scroll-event-name="ScrollToArticleLead"]')
      .text()
      .trim();

    const content = $(
      '.entry-content > p, .entry-content > blockquote, .entry-content > h1, .entry-content > h2, .entry-content > h3, .entry-content > h4, .entry-content > ul',
    )
      .text()
      .trim();

    const _date = $('.article-datetime').text().trim();
    const date = this.dateParser(_date);

    const links = $('a')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter((link) => link.startsWith('/gazdasag/'));

    return { title, coverUrl, lead, content, date, links };
  }

  indexParser(html: string): ParsedResultDto {
    const $ = cheerio.load(html);

    const title = $('.content-title').text().trim();

    const coverUrl = $('.cikk-cover-v1 > img').attr('src');

    const lead = $('.lead').text().trim();

    const content = $(
      '.cikk-torzs > p, .cikk-torzs > blockquote, .cikk-torzs > h1, .cikk-torzs > h2, .cikk-torzs > h3, .cikk-torzs > h4, .cikk-torzs > ul, .eyecatcher_long, .eyecatcher_short',
    )
      .text()
      .trim();

    const _date = $('.datum').text().trim();
    const date = this.dateParser(_date);

    const links = $('a')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter((link) => link.includes('gazdasag'));

    return { title, coverUrl, lead, content, date, links };
  }

  origoParser(html: string): ParsedResultDto {
    const year = new Date().getFullYear();

    const $ = cheerio.load(html);

    const title = $('.article-title').text().trim();

    const coverUrl = 'https:' + $('.img-holder img').attr('src');

    const lead = $('.article-lead').text().trim();

    const content = $(
      '.article-content > p, .article-content > span, .article-content > h1, .article-content > h2, .article-content > h3, .article-content > h4, .article-content > ul',
    )
      .text()
      .trim();

    const _date = $('.article-date').text().trim();
    const date = this.dateParser(_date);

    const links = $('a')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter((link) =>
        link.startsWith(`https://www.origo.hu/gazdasag/${year}`),
      );

    return { title, coverUrl, lead, content, date, links };
  }

  portfolioParser(html: string): ParsedResultDto {
    const year = new Date().getFullYear();
    const $ = cheerio.load(html);

    const _title = $('.overlay-content').text().trim();
    const title = _title.slice(14);

    const coverUrl = $('.main-image > img').attr('src');

    const lead = $('.pfarticle-section-lead').text().trim();

    const content = $(
      '.pfarticle-section-content > p, .pfarticle-section-content > h1, .pfarticle-section-content > h2, .pfarticle-section-content > h3, .pfarticle-section-content > h4, .pfarticle-section-content > ul',
    )
      .text()
      .trim();

    const _date = $('.d-block').text().trim();
    const cuttedDate = _date.replace(
      'Ezt az űrlapot a reCAPTCHA és a Google védi.Adatvédelmi irányelvek\n\t\t és Szolgáltatási feltételek.',
      '',
    );
    const date = this.dateParser(cuttedDate);

    const links = $('a')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter((link) => link.startsWith(`/gazdasag/${year}`));

    return { title, coverUrl, lead, content, date, links };
  }

  dateParser(date: string): Date {
    const months = [
      'január',
      'február',
      'március',
      'április',
      'május',
      'június',
      'július',
      'augusztus',
      'szeptember',
      'október',
      'november',
      'december',
    ];
    let replacedDate;
    months.forEach((month: string) => {
      if (date.includes(month)) {
        const replaceValue = this.convertMonth(month);
        replacedDate = date.replace(` ${month} `, replaceValue);
      }
    });
    const formattedDate = dayjs(date).format();
    const newDate = new Date(formattedDate);
    return newDate;
  }

  convertMonth(month: string): string {
    switch (month) {
      case 'január':
        return '01.';
      case 'február':
        return '02.';
      case 'március':
        return '03';
      case 'április':
        return '04.';
      case 'május':
        return '05.';
      case 'június':
        return '06.';
      case 'július':
        return '07.';
      case 'augusztus':
        return '08.';
      case 'szeptember':
        return '09.';
      case 'október':
        return '10.';
      case 'november':
        return '11.';
      case 'december':
        return '12.';
    }
  }

  @Cron(CronExpression.EVERY_5_HOURS, { name: 'crawl' })
  async crawlCron(): Promise<void> {
    await this.crawl();
  }
}
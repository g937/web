import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import cheerio from 'cheerio';
import util from 'util';

import { NewsEntity } from '../database/entities/news.entity';
import { ParsedResultDto } from './dto/parsed-result.dto';

const wait = util.promisify(setTimeout);

@Injectable()
export class WebCrawlerService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

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

        if (!alreadyCrawled && !pagesToVisit.includes(link)) {
          const page = link.split('/gazdasag');
          const html = await this.getRequest(link);
          const parsedResult = this.switchParser(page[0], html);
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
    await this.newsRepository.save(data);
  }

  async getRequest(url: string): Promise<AxiosResponse> {
    let response;
    if (url.includes('https://www.origo.hu')) {
      response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        },
      });
    } else {
      response = await axios.get(url);
    }
    return response.data;
  }

  hvgParser(html: string): ParsedResultDto {
    const $ = cheerio.load(html);

    const title = $('.article-title').text().trim();

    const coverUrl = $('.article-cover-img > img').attr('src');

    const lead = $('[data-scroll-event-name="ScrollToArticleLead"]')
      .text()
      .trim();

    const content = $('.entry-content').text().trim();

    const date = $('.article-datetime').text().trim();

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

    const content = $('.cikk-torzs').text().trim();

    const date = $('.datum').text().trim();

    const links = $('a')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter((link) => link.startsWith('https://index.hu/gazdasag/'));

    return { title, coverUrl, lead, content, date, links };
  }

  origoParser(html: string): ParsedResultDto {
    const year = new Date().getFullYear();

    const $ = cheerio.load(html);

    const title = $('.article-title').text().trim();

    const coverUrl = 'https:' + $('.img-holder img').attr('src');

    const lead = $('.article-lead').text().trim();

    const content = $('.article-content').text().trim();

    const date = $('.article-date').text().trim();

    const links = $('a')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter((link) =>
        link.startsWith(`https://www.origo.hu/gazdasag/${year}`),
      );

    return { title, coverUrl, lead, content, date, links };
  }

  portfolioParser(html: string): ParsedResultDto {
    const $ = cheerio.load(html);

    const _title = $('.overlay-content').text().trim();
    const title = _title.slice(14);

    const coverUrl = $('.main-image > img').attr('src');

    const lead = $('.pfarticle-section-lead').text().trim();

    const _content = $('.pfarticle-section-content').text().trim();
    const index = _content.indexOf('Címlapkép');
    const content = _content.slice(792, index);

    const _date = $('.d-block').text().trim();
    const date = _date.replace(
      'Ezt az űrlapot a reCAPTCHA és a Google védi.Adatvédelmi irányelvek\n\t\t és Szolgáltatási feltételek.',
      '',
    );

    const links = $('a')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter((link) => link.startsWith('https://www.portfolio.hu/gazdasag/'));

    return { title, coverUrl, lead, content, date, links };
  }
}
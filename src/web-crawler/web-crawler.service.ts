import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import axios from "axios";
import { Repository } from "typeorm";
import cheerio from "cheerio";
import util from "util";

const wait = util.promisify(setTimeout);

import { NewsEntity } from "../database/entities/news.entity";

@Injectable()
export class WebCrawlerService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

  public async cawl(): Promise<void> {
    let pagesToVisit = [
      "https://index.hu/gazdasag/", 
      "https://hvg.hu/gazdasag/", 
      "https://www.origo.hu/gazdasag/index.html",
      "https://www.portfolio.hu/gazdasag/"
    ];
    let linksToVisit = [];
    const visitedLinks = [];
    let page;
    for (page of pagesToVisit) {
      const html = await this.getRequest(page);
      const parsedResult = this.switchParser(page, html, page);
      visitedLinks.push(page);
      for (const link of parsedResult.links) {
        if (page == "https://hvg.hu/gazdasag/") {
          linksToVisit.push("https://hvg.hu" + link)
        }
        else {
          linksToVisit.push(link);
        }
      }
    }
    while (linksToVisit.length > 0) {
      try {
        const currentUrl = linksToVisit.pop();
        if (visitedLinks.includes(currentUrl)) continue;
        console.log("now crawling " + currentUrl);

        const html = await this.getRequest(currentUrl);

        const parsedResult = this.switchParser(page, html, currentUrl);
        await this.saveParsedResult(parsedResult);

        console.log(parsedResult);
        visitedLinks.push(currentUrl);
        await wait(5000);
      } catch (err) {
        console.error(err);
      }
    }
  }

  switchParser(page, html, currentUrl) {
    switch (page) {
      case "https://index.hu/gazdasag/":
        return this.indexParser(html);
      case "https://hvg.hu/gazdasag/":
        return this.hvgParser(html);
      case "https://www.origo.hu/gazdasag/index.html":
        return this.origoParser(html);
      case "https://www.portfolio.hu/gazdasag/":
        return this.portfolioParser(html);
    }
  }

  async saveParsedResult(parsedResult) {
    const data ={
      title: parsedResult.title,
      coverUrl: parsedResult.coverUrl,
      lead: parsedResult.lead,
      content: parsedResult.content
    };
    await this.newsRepository.save(data);
  }

  async getRequest(url: string) {
    const response = await axios.get(url);
    return response.data;
  }

  hvgParser(html: string) {
    const $ = cheerio.load(html);

    const title = $(".article-title").text().trim();

    const coverUrl = $(".article-cover-img > img").attr("src");

    const lead = $('[data-scroll-event-name="ScrollToArticleLead"]').text().trim();

    const content = $(".entry-content").text().trim();

    const links = $("a").map((index, element) => $(element).attr("href")).get()
      .filter(link => link.startsWith("/gazdasag/2022"))

    return { title, coverUrl, lead, content, links }
  }

  indexParser(html: string) {
    const $ = cheerio.load(html);

    const title = $(".content-title").text().trim();

    const coverUrl = $(".cikk-cover-v1 > img").attr("src");

    const lead = $(".lead").text().trim();

    const content = $(".cikk-torzs").text().trim();

    const links = $("a").map((index, element) => $(element).attr("href")).get()
      .filter(link => link.startsWith("https://index.hu/gazdasag/"))

    return { title, coverUrl, lead, content, links }
  }

  origoParser(html: string) {
    const $ = cheerio.load(html);

    const title = $(".article-title").text().trim();

    const coverUrl = "https:" + $(".img-holder img").attr("src");

    const lead = $(".article-lead").text().trim();

    const content = $(".article-content").text().trim();

    const links = $("a").map((index, element) => $(element).attr("href")).get()
      .filter(link => link.startsWith("https://www.origo.hu/gazdasag/"));

    return { title, coverUrl, lead, content, links }
  }

  portfolioParser(html: string) {
    const $ = cheerio.load(html);

    const _title = $(".overlay-content").text().trim();
    const title = _title.slice(14);

    const coverUrl = $(".main-image > img").attr("src");

    const lead = $(".pfarticle-section-lead").text().trim();

    const _content = $(".pfarticle-section-content").text().trim();
    const index = _content.indexOf("Címlapkép");
    const content = _content.slice(792, index);

    const links = $("a").map((index, element) => $(element).attr("href")).get()
      .filter(link => link.startsWith("https://www.portfolio.hu/gazdasag/"));

    return { title, coverUrl, lead, content, links }
  }
}
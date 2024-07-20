import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { SwapiResource } from './enums/swapi.resource';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class SwapiClientService {
  private readonly baseUrl: string =
    this.configService.get<string>('swapi.baseUrl');

  public readonly CACHE_TTL = 60000;

  private useCache = true;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  withoutCache() {
    this.useCache = false;
    return this;
  }

  withCache() {
    this.useCache = true;
    return this;
  }

  async getAll(
    resource: SwapiResource,
    page = 1,
    filters: { [key: string]: any } | null = null,
  ) {
    let queryParams = `page=${page}`;

    if (filters) {
      Object.keys(filters).forEach((key) => {
        queryParams += `&${key}=${filters[key]}`;
      });
    }

    const formattedUrl = `${this.baseUrl}/${resource}?${queryParams}`;

    return this.get(formattedUrl);
  }

  async getSingle(resource: SwapiResource, id: number) {
    const formattedUrl = `${this.baseUrl}/${resource}/${id}`;

    return this.get(formattedUrl);
  }

  async get(url: string) {
    // validate base url
    if (!url.startsWith(this.baseUrl)) {
      throw new Error('Invalid URL');
    }

    const cacheKey = `swapi:${url}`;

    const cachedData: any = await this.cacheManager.get(cacheKey);

    if (cachedData && this.useCache) {
      return JSON.parse(JSON.stringify(cachedData));
    }

    const response = await lastValueFrom(this.httpService.get(url));

    await this.cacheManager.set(cacheKey, response.data, this.CACHE_TTL);

    return JSON.parse(JSON.stringify(response.data));
  }
}

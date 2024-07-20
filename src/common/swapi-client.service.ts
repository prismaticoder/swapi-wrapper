import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { SwapiResource } from './enums/swapi.resource';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable({ scope: Scope.REQUEST })
export class SwapiClientService {
  private readonly baseUrl: string =
    this.configService.get<string>('swapi.baseUrl');

  public readonly CACHE_TTL = 300_000;

  private useCache = true;

  private resource: SwapiResource = null;

  private filters: { [key: string]: any } = null;

  private dependenciesToResolve: string[] = [];

  private page = 1;

  private id: number = null;

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

  query(resource: SwapiResource): this {
    this.resource = resource;

    return this;
  }

  where(fieldToFilter: string, value: any): this {
    if (!this.filters) {
      this.filters = {};
    }

    this.filters[fieldToFilter] = value;

    return this;
  }

  load(dependenciesToResolve: string[]): this {
    this.dependenciesToResolve = dependenciesToResolve;
    return this;
  }

  async get(options: { page?: number } = null) {
    if (options?.page) {
      this.page = options.page;
    }

    const url = this.constructUrl();

    const response = await this.fetchUrl(url);

    return response;
  }

  async getById(id: number) {
    this.id = id;

    const url = this.constructUrl();

    const response = await this.fetchUrl(url);

    if (!this.dependenciesToResolve.length) {
      return response;
    }

    const urlsToFetch = [];
    const ownerFields = [];

    this.dependenciesToResolve.forEach((field) => {
      const { resource } = this.deconstructRelation(field);

      if (response[resource]) {
        const urlValue = response[resource];

        if (urlValue instanceof Array) {
          urlValue.forEach((url) => {
            urlsToFetch.push(url);
            ownerFields.push(field);
          });
        } else {
          urlsToFetch.push(urlValue);
          ownerFields.push(field);
        }

        response[resource] = urlValue instanceof Array ? [] : null;
      }
    });

    const promisesToResolve = urlsToFetch.map((url) => this.fetchUrl(url));

    const fetchedData = await Promise.allSettled(promisesToResolve);

    fetchedData.forEach((data, index) => {
      if (data.status === 'fulfilled') {
        const field = ownerFields[index];

        const [fieldName, columnToGet] = field.split(':');

        const value = columnToGet ? data.value[columnToGet] : data.value;

        if (response[fieldName] instanceof Array) {
          response[fieldName].push(value);
        } else {
          response[fieldName] = value;
        }
      }

      if (data.status === 'rejected') {
        console.error(data.reason);
      }
    });

    return response;
  }

  private constructUrl(): string {
    if (!this.resource) {
      throw new Error('Resource not set');
    }

    let url = `${this.baseUrl}/${this.resource}`;

    if (this.id) {
      url += `/${this.id}`;

      return url;
    }

    let queryParams = `?page=${this.page}`;

    if (this.filters) {
      Object.keys(this.filters).forEach((key) => {
        queryParams += `&${key}=${this.filters[key]}`;
      });
    }

    url += queryParams;

    return url;
  }

  private deconstructRelation(relation: string) {
    const [resource, column] = relation.split(':');

    return { resource, column };
  }

  async fetchUrl(url: string) {
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

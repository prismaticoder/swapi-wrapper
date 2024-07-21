import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SwapiResource } from './enums/swapi.resource';
import { AxiosError } from 'axios';
import { ResourceNotFound } from './exceptions/resource-not-found.exception';
import { ServiceUnavailable } from './exceptions/service-unavailable.exception';

@Injectable({ scope: Scope.REQUEST })
export class SwapiQueryBuilder {
  private readonly baseUrl: string =
    this.configService.get<string>('swapi.baseUrl');

  public readonly CACHE_TTL = 300_000;

  public readonly MAX_REQUEST_TIMEOUT = 3000;

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

    return await this.fetchUrl(url);
  }

  async getById(id: number) {
    this.id = id;

    const url = this.constructUrl();

    const response = await this.fetchUrl(url);

    if (!this.dependenciesToResolve.length) {
      return response;
    }

    return await this.resolveDependencies(response);
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

  private async resolveDependencies(response: any) {
    const urlsToFetch = [];
    const urlIndexMap = [];

    this.dependenciesToResolve.forEach((field) => {
      const { resource } = this.deconstructRelation(field);

      if (!response[resource]) {
        return;
      }

      const url = response[resource];

      if (url instanceof Array) {
        url.forEach((url) => {
          urlsToFetch.push(url);
          urlIndexMap.push(field);
        });
      } else {
        urlsToFetch.push(url);
        urlIndexMap.push(field);
      }

      response[resource] = null;
    });

    const promisesToResolve = urlsToFetch.map((url) => this.fetchUrl(url));

    const resolvedData = await this.resolvePromises(
      promisesToResolve,
      urlIndexMap,
    );

    return { ...response, ...resolvedData };
  }

  private async fetchUrl(url: string) {
    // validate base url
    if (!url.startsWith(this.baseUrl)) {
      throw new Error('Invalid URL');
    }

    try {
      const cacheKey = `swapi:${url}`;

      const cachedData: any = await this.cacheManager.get(cacheKey);

      if (cachedData && this.useCache) {
        return JSON.parse(JSON.stringify(cachedData));
      }

      const response = await lastValueFrom(
        this.httpService.get(url, { timeout: this.MAX_REQUEST_TIMEOUT }),
      );

      await this.cacheManager.set(cacheKey, response.data, this.CACHE_TTL);

      return JSON.parse(JSON.stringify(response.data));
    } catch (exception) {
      if (exception instanceof AxiosError) {
        if (exception.response.status === HttpStatus.NOT_FOUND) {
          throw new ResourceNotFound();
        } else {
          throw new ServiceUnavailable();
        }
      }

      throw exception;
    }
  }

  private async resolvePromises(
    promisesToResolve: any[],
    urlIndexMap: string[],
  ) {
    const response = {};

    const resolvedData = await Promise.allSettled(promisesToResolve);

    resolvedData.forEach((data, index) => {
      if (data.status === 'fulfilled') {
        const field = urlIndexMap[index];

        const { resource, column } = this.deconstructRelation(field);

        const value = column ? data.value[column] : data.value;

        if (!response[resource]) {
          response[resource] = value;
        } else {
          response[resource] =
            response[resource] instanceof Array
              ? response[resource]
              : [response[resource]];

          response[resource].push(value);
        }
      }

      if (data.status === 'rejected') {
        console.error(data.reason);
      }
    });

    return response;
  }

  private deconstructRelation(relation: string) {
    const [resource, column] = relation.split(':');

    return { resource, column };
  }
}

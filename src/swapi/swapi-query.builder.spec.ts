import { Test, TestingModule } from '@nestjs/testing';
import { SwapiQueryBuilder } from './swapi-query.builder';
import { HttpService } from '@nestjs/axios';
import { SwapiResource } from './enums/swapi.resource';
import { ConfigService } from '@nestjs/config';
import { ContextIdFactory } from '@nestjs/core';
import { when } from 'jest-when';
import { AxiosResponse, AxiosError } from 'axios';
import { of, throwError } from 'rxjs';
import { ServiceUnavailable } from './exceptions/service-unavailable.exception';
import { HttpStatus } from '@nestjs/common';
import { ResourceNotFound } from './exceptions/resource-not-found.exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('SwapiQueryBuilder', () => {
  let service: SwapiQueryBuilder;
  let httpService: HttpService;
  let configService: ConfigService;
  let cacheManager: any;

  const singlePersonResponse = {
    birth_year: '19 BBY',
    eye_color: 'Blue',
    films: ['https://swapi.dev/api/films/1/'],
    vehicles: ['https://swapi.dev/api/vehicles/1/'],
    starships: ['https://swapi.dev/api/starships/1/'],
    gender: 'Male',
    hair_color: 'Blond',
    height: '172',
    homeworld: 'https://swapi.dev/api/planets/1/',
    mass: '77',
    name: 'Luke Skywalker',
    skin_color: 'Fair',
    created: '2014-12-09T13:50:51.644000Z',
    edited: '2014-12-10T13:52:43.172000Z',
    species: ['https://swapi.dev/api/species/1/'],
    url: 'https://swapi.dev/api/people/1/',
  };

  const peopleResponse = {
    results: [singlePersonResponse],
    next: null,
    previous: null,
    count: 1,
  };

  const httpResponse: AxiosResponse<any> = {
    data: peopleResponse,
    status: 200,
    config: {
      url: 'https://swapi.dev/api/people/',
      method: 'get',
      headers: undefined,
    },
    headers: {},
    statusText: 'OK',
  };

  const peopleCacheKey = 'swapi:https://swapi.dev/api/people?page=1';
  const peopleLockKey = 'lock:https://swapi.dev/api/people?page=1';

  const singlePersonCacheKey = 'swapi:https://swapi.dev/api/people/1';
  const singlePersonLockKey = 'lock:https://swapi.dev/api/people/1';

  const jestFn = jest.fn();

  when(jestFn)
    .calledWith('swapi.baseUrl')
    .mockReturnValue('https://swapi.dev/api');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwapiQueryBuilder,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jestFn },
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { error: jest.fn(), info: jest.fn(), alert: jest.fn() },
        },
      ],
    }).compile();

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    service = await module.resolve(SwapiQueryBuilder, contextId);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    cacheManager = module.get('CACHE_MANAGER');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Builder methods', () => {
    it('should return an instance of the class when a builder method is called', () => {
      expect(service.query(SwapiResource.People)).toBe(service);
      expect(service.where('name', 'anotherName')).toBe(service);
      expect(service.load(['homeworld'])).toBe(service);
      expect(service.withCache()).toBe(service);
      expect(service.withoutCache()).toBe(service);
    });
  });

  describe('get method', () => {
    it('should return the response in the cache if available', async () => {
      const response = {
        results: [singlePersonResponse],
        next: null,
        previous: null,
        count: 1,
      };

      jest.spyOn(cacheManager, 'get').mockReturnValue(response);
      const httpSpy = jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of(httpResponse));

      const result = await service
        .withCache()
        .query(SwapiResource.People)
        .get();

      expect(result).toEqual({
        total: response.count,
        per_page: service.ITEMS_PER_PAGE,
        previous: response.previous,
        next: response.next,
        results: [singlePersonResponse],
      });

      expect(httpSpy).not.toHaveBeenCalled();
    });

    it('should call the API if no data is available in cache', async () => {
      jest.spyOn(cacheManager, 'get').mockReturnValue(null);
      const httpSpy = jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of(httpResponse));

      const result = await service
        .withCache()
        .query(SwapiResource.People)
        .get();

      expect(httpSpy).toHaveBeenCalled();

      expect(result).toEqual({
        total: peopleResponse.count,
        per_page: service.ITEMS_PER_PAGE,
        previous: peopleResponse.previous,
        next: peopleResponse.next,
        results: peopleResponse.results,
      });
    });

    it('should call the API if data is available in cache but withoutCache is set', async () => {
      const cacheSpy = jest.spyOn(cacheManager, 'get');

      when(cacheSpy).calledWith(peopleCacheKey).mockReturnValue(peopleResponse);

      const httpSpy = jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of(httpResponse));

      const result = await service
        .withoutCache()
        .query(SwapiResource.People)
        .get();

      expect(httpSpy).toHaveBeenCalled();

      expect(result).toEqual({
        total: peopleResponse.count,
        per_page: service.ITEMS_PER_PAGE,
        previous: peopleResponse.previous,
        next: peopleResponse.next,
        results: peopleResponse.results,
      });
    });

    it('should save data to cache after calling the API', async () => {
      jest.spyOn(cacheManager, 'get').mockReturnValue(null);
      const httpSpy = jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of(httpResponse));

      const setSpy = jest.spyOn(cacheManager, 'set');

      await service.withCache().query(SwapiResource.People).get();

      expect(httpSpy).toHaveBeenCalled();

      expect(setSpy).toHaveBeenLastCalledWith(
        peopleCacheKey,
        peopleResponse,
        service.CACHE_TTL,
      );
    });

    it('should release the lock after getting the data', async () => {
      const cacheSpy = jest.spyOn(cacheManager, 'get');

      when(cacheSpy).calledWith(peopleCacheKey).mockReturnValue(peopleResponse);

      const httpSpy = jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of(httpResponse));

      const releaseLockSpy = jest.spyOn(cacheManager, 'del');

      await service.withoutCache().query(SwapiResource.People).get();

      expect(httpSpy).toHaveBeenCalled();
      expect(releaseLockSpy).toHaveBeenCalledWith(peopleLockKey);
    });

    it('should throw a service unavailable error if the API call fails', async () => {
      jest.spyOn(cacheManager, 'get').mockReturnValue(null);

      const failedHttpResponse = {
        code: '404',
        config: { headers: undefined },
        message: 'Unable to connect to the API',
        request: undefined,
        response: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          statusText: 'Internal Server Error',
          config: {
            url: 'https://swapi.dev/api/people',
            method: 'get',
            headers: undefined,
          },
          headers: {},
          data: {},
        },
      };

      const failedAxiosError = new AxiosError(
        failedHttpResponse.message,
        failedHttpResponse.code,
        failedHttpResponse.config,
        failedHttpResponse.request,
        failedHttpResponse.response,
      );

      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => throwError(() => failedAxiosError));

      expect(async () => {
        await service.withoutCache().query(SwapiResource.People).get();
      }).rejects.toThrow(new ServiceUnavailable());
    });

    it('should throw an error if the resource is not set', async () => {
      expect(async () => {
        await service.get();
      }).rejects.toThrow(new Error('Resource not set'));
    });
  });

  describe('getById method', () => {
    it('should return the response as is if no dependencies are to be loaded', async () => {
      const cacheSpy = jest
        .spyOn(cacheManager, 'get')
        .mockReturnValue(singlePersonResponse);

      const result = await service
        .withCache()
        .query(SwapiResource.People)
        .getById(1);

      expect(cacheSpy).toHaveBeenCalledWith(singlePersonCacheKey);
      expect(result).toEqual(singlePersonResponse);
    });

    it('should not load dependencies when the load method is not chained', async () => {
      jest.spyOn(cacheManager, 'get').mockReturnValue(singlePersonResponse);

      const result = await service
        .withCache()
        .query(SwapiResource.People)
        .getById(1);

      expect(result).toEqual(singlePersonResponse);
    });

    it('should load dependencies when the load method is chained', async () => {
      jest.spyOn(cacheManager, 'get').mockReturnValue(singlePersonResponse);

      const result = await service
        .withCache()
        .load(['starships:name', 'vehicles:name', 'homeworld:name'])
        .query(SwapiResource.People)
        .getById(1);

      // we use the name field since it's singlePersonResponse that is mocked in the cache so it will return it for every url
      expect(result).toEqual({
        ...singlePersonResponse,
        homeworld: singlePersonResponse.name,
        vehicles: [singlePersonResponse.name],
        starships: [singlePersonResponse.name],
      });
    });

    it('should throw a resource not found exception when the API returns a 404', async () => {
      jest.spyOn(cacheManager, 'get').mockReturnValue(null);

      const failedHttpResponse = {
        code: '404',
        config: { headers: undefined },
        message: 'Not Found chief',
        request: undefined,
        response: {
          status: HttpStatus.NOT_FOUND,
          statusText: 'Not Found',
          config: {
            url: 'https://swapi.dev/api/people/1',
            method: 'get',
            headers: undefined,
          },
          headers: {},
          data: {},
        },
      };

      const failedAxiosError = new AxiosError(
        failedHttpResponse.message,
        failedHttpResponse.code,
        failedHttpResponse.config,
        failedHttpResponse.request,
        failedHttpResponse.response,
      );

      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() => throwError(() => failedAxiosError));

      expect(async () => {
        await service.query(SwapiResource.People).getById(1);
      }).rejects.toThrow(new ResourceNotFound());
    });
  });
});

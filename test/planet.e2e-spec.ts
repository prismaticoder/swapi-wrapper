import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PeopleModule } from '../src/people/people.module';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppModule } from '../src/app.module';
import { ResourceNotFound } from '../src/swapi/exceptions/resource-not-found.exception';
import { ServiceUnavailable } from '../src/swapi/exceptions/service-unavailable.exception';
import { PlanetService } from '../src/planet/planet.service';

describe('Planets', () => {
  let app: INestApplication;

  const singlePlanetData = {
    name: 'Tatooine',
    diameter: '10465',
    rotation_period: '23',
    orbital_period: '304',
    gravity: '1 standard',
    population: '200000',
    climate: 'arid',
    terrain: 'desert',
    surface_water: '1',
    residents: ['Luke Skywalker', 'Cliegg Lars'],
    films: ['A New Hope', 'Return of the Jedi'],
    created: '2014-12-09T13:50:51.644000Z',
    edited: '2014-12-10T13:52:43.172000Z',
    url: 'https://swapi.dev/api/people/1/',
  };

  const planetService = {
    findAll: () => {
      return {
        total: 1,
        per_page: 10,
        previous: null,
        next: null,
        results: [singlePlanetData],
      };
    },
    findById: () => singlePlanetData,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PeopleModule, AppModule],
    })
      .overrideProvider(PlanetService)
      .useValue(planetService)
      .overrideProvider(CACHE_MANAGER)
      .useValue({ get: jest.fn(), set: jest.fn(), del: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /planets', async () => {
    return await request(app.getHttpServer())
      .get('/planets')
      .expect(200)
      .expect({
        message: 'Planets retrieved successfully.',
        response: planetService.findAll(),
      });
  });

  it('GET /planets/1', async () => {
    return await request(app.getHttpServer())
      .get('/planets/1')
      .expect(200)
      .expect({
        message: 'Planet retrieved successfully.',
        response: planetService.findById(),
      });
  });

  // throws 404
  it('returns 404 for invalid ID', async () => {
    jest.spyOn(planetService, 'findById').mockImplementation(() => {
      throw new ResourceNotFound();
    });

    return await request(app.getHttpServer())
      .get('/planets/100')
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The requested resource was not found.',
      });
  });

  it('returns 503 for service unavailable', async () => {
    jest.spyOn(planetService, 'findById').mockImplementation(() => {
      throw new ServiceUnavailable();
    });

    return await request(app.getHttpServer())
      .get('/planets/1')
      .expect(HttpStatus.SERVICE_UNAVAILABLE)
      .expect({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message:
          'This service is currently unavailable, please try again later.',
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

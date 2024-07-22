import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PeopleModule } from '../src/people/people.module';
import { PeopleService } from '../src/people/people.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppModule } from '../src/app.module';
import { ResourceNotFound } from '../src/swapi/exceptions/resource-not-found.exception';
import { ServiceUnavailable } from '../src/swapi/exceptions/service-unavailable.exception';

describe('People', () => {
  let app: INestApplication;

  const singlePersonData = {
    birth_year: '19 BBY',
    eye_color: 'Blue',
    films: [
      'A New Hope',
      'The Empire Strikes Back',
      'Return of the Jedi',
      'Revenge of the Sith',
    ],
    vehicles: ['Snowspeeder', 'Imperial Speeder Bike'],
    starships: ['X-wing', 'Imperial shuttle'],
    gender: 'Male',
    hair_color: 'Blond',
    height: '172',
    homeworld: 'Tatooine',
    mass: '77',
    name: 'Luke Skywalker',
    skin_color: 'Fair',
    created: '2014-12-09T13:50:51.644000Z',
    edited: '2014-12-10T13:52:43.172000Z',
    species: ['https://swapi.dev/api/species/1/'],
    url: 'https://swapi.dev/api/people/1/',
  };

  const peopleService = {
    findAll: () => {
      return {
        total: 1,
        per_page: 10,
        previous: null,
        next: null,
        results: [singlePersonData],
      };
    },
    findById: () => singlePersonData,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PeopleModule, AppModule],
    })
      .overrideProvider(PeopleService)
      .useValue(peopleService)
      .overrideProvider(CACHE_MANAGER)
      .useValue({ get: jest.fn(), set: jest.fn(), del: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /people', async () => {
    return await request(app.getHttpServer())
      .get('/people')
      .expect(200)
      .expect({
        message: 'People retrieved successfully.',
        response: peopleService.findAll(),
      });
  });

  it('GET /people/1', async () => {
    return await request(app.getHttpServer())
      .get('/people/1')
      .expect(200)
      .expect({
        message: 'Person retrieved successfully.',
        response: peopleService.findById(),
      });
  });

  // throws 404
  it('returns 404 for invalid ID', async () => {
    jest.spyOn(peopleService, 'findById').mockImplementation(() => {
      throw new ResourceNotFound();
    });

    return await request(app.getHttpServer())
      .get('/people/100')
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The requested resource was not found.',
      });
  });

  it('returns 503 for service unavailable', async () => {
    jest.spyOn(peopleService, 'findById').mockImplementation(() => {
      throw new ServiceUnavailable();
    });

    return await request(app.getHttpServer())
      .get('/people/1')
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

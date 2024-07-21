import { Test, TestingModule } from '@nestjs/testing';
import { PeopleService } from './people.service';
import { SwapiQueryBuilder } from '../swapi/swapi-query.builder';
import { SwapiResource } from '../swapi/enums/swapi.resource';
import { ResourceNotFound } from '../swapi/exceptions/resource-not-found.exception';

const singlePersonResponse = {
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

describe('PeopleService', () => {
  let service: PeopleService;
  let starWarsApiMock: SwapiQueryBuilder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeopleService,
        {
          provide: SwapiQueryBuilder,
          useValue: {
            query: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({
              total: 1,
              per_page: 10,
              previous: null,
              next: null,
              results: [singlePersonResponse],
            }),
            load: jest.fn().mockReturnThis(),
            getById: jest.fn().mockResolvedValue(singlePersonResponse),
          },
        },
      ],
    }).compile();

    service = module.get<PeopleService>(PeopleService);
    starWarsApiMock = module.get<SwapiQueryBuilder>(SwapiQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find all', () => {
    it('should return paginated results of People when called without filters', async () => {
      const formattedResponse = service.formatResponse(singlePersonResponse);

      const whereSpy = jest.spyOn(starWarsApiMock, 'where');
      const querySpy = jest.spyOn(starWarsApiMock, 'query');

      expect(await service.findAll(1, {})).toEqual({
        total: 1,
        per_page: 10,
        previous: null,
        next: null,
        results: [formattedResponse],
      });

      expect(whereSpy).not.toHaveBeenCalled();
      expect(querySpy).toHaveBeenCalledWith(SwapiResource.People);
    });

    it('should handle empty results gracefully', async () => {
      const expectedResult = {
        total: 0,
        per_page: 10,
        previous: null,
        next: null,
        results: [],
      };

      jest.spyOn(starWarsApiMock, 'get').mockResolvedValue(expectedResult);

      expect(await service.findAll(1, {})).toEqual(expectedResult);
    });

    it('should pass filters to the star wars api builder', async () => {
      const starWarsApiSpy = jest.spyOn(starWarsApiMock, 'where');
      const name = 'Luke';

      await service.findAll(1, { name });

      expect(starWarsApiSpy).toHaveBeenCalledWith('search', name);
    });

    it('should call formatResponse for each item in results array', async () => {
      const formatResponseMock = jest.spyOn(service, 'formatResponse');

      await service.findAll(1, {});

      expect(formatResponseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Find By Id', () => {
    it('should return a single person by id', async () => {
      const personId = 1;
      const formattedResponse = service.formatResponse(singlePersonResponse);

      const getByIdSpy = jest.spyOn(starWarsApiMock, 'getById');
      const loadSpy = jest.spyOn(starWarsApiMock, 'load');
      const querySpy = jest.spyOn(starWarsApiMock, 'query');

      expect(await service.findById(personId)).toEqual({
        ...formattedResponse,
        homeworld: singlePersonResponse.homeworld,
        films: singlePersonResponse.films,
        vehicles: singlePersonResponse.vehicles,
        starships: singlePersonResponse.starships,
      });

      expect(querySpy).toHaveBeenCalledWith(SwapiResource.People);
      expect(getByIdSpy).toHaveBeenCalledWith(personId);
      expect(loadSpy).toHaveBeenCalledWith([
        'films:title',
        'starships:name',
        'vehicles:name',
        'homeworld:name',
      ]);
    });

    it('should throw a resource not found error when swapi returns null', async () => {
      jest.spyOn(starWarsApiMock, 'getById').mockResolvedValue(null);

      expect(async () => {
        await service.findById(1);
      }).rejects.toThrow(new ResourceNotFound());
    });
  });
});

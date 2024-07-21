import { Test, TestingModule } from '@nestjs/testing';
import { PlanetService } from './planet.service';
import { SwapiQueryBuilder } from '../swapi/swapi-query.builder';
import { SwapiResource } from '../swapi/enums/swapi.resource';
import { ResourceNotFound } from '../swapi/exceptions/resource-not-found.exception';

const singlePlanetResponse = {
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
describe('PlanetService', () => {
  let service: PlanetService;
  let starWarsApiMock: SwapiQueryBuilder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanetService,
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
              results: [singlePlanetResponse],
            }),
            load: jest.fn().mockReturnThis(),
            getById: jest.fn().mockResolvedValue(singlePlanetResponse),
          },
        },
      ],
    }).compile();

    service = module.get<PlanetService>(PlanetService);
    starWarsApiMock = module.get<SwapiQueryBuilder>(SwapiQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find all', () => {
    it('should return paginated results of Planets when called without filters', async () => {
      const formattedResponse = service.formatResponse(singlePlanetResponse);

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
      expect(querySpy).toHaveBeenCalledWith(SwapiResource.Planets);
    });

    it('should return paginated results of Planets when called with filters', async () => {
      const formattedResponse = service.formatResponse(singlePlanetResponse);

      const whereSpy = jest.spyOn(starWarsApiMock, 'where');
      const querySpy = jest.spyOn(starWarsApiMock, 'query');

      expect(await service.findAll(1, { name: 'Tatooine' })).toEqual({
        total: 1,
        per_page: 10,
        previous: null,
        next: null,
        results: [formattedResponse],
      });

      expect(whereSpy).toHaveBeenCalledWith('search', 'Tatooine');
      expect(querySpy).toHaveBeenCalledWith(SwapiResource.Planets);
    });
  });

  describe('Find by id', () => {
    it('should return a single Planet when called with an id', async () => {
      const formattedResponse = service.formatResponse(singlePlanetResponse);

      const loadSpy = jest.spyOn(starWarsApiMock, 'load');
      const querySpy = jest.spyOn(starWarsApiMock, 'query');

      expect(await service.findById(1)).toEqual({
        ...formattedResponse,
        residents: singlePlanetResponse.residents,
        films: singlePlanetResponse.films,
      });

      expect(loadSpy).toHaveBeenCalledWith(['residents:name', 'films:title']);
      expect(querySpy).toHaveBeenCalledWith(SwapiResource.Planets);
    });

    it('should throw a resource not found error when swapi returns null', async () => {
      jest.spyOn(starWarsApiMock, 'getById').mockResolvedValue(null);

      expect(async () => {
        await service.findById(1);
      }).rejects.toThrow(new ResourceNotFound());
    });
  });
});

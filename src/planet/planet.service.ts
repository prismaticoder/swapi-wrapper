import { Injectable } from '@nestjs/common';
import { SwapiQueryBuilder } from '../swapi/swapi-query.builder';
import { Planet } from './interfaces/planet.interface';
import { SwapiResource } from '../swapi/enums/swapi.resource';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { ResourceNotFound } from '../swapi/exceptions/resource-not-found.exception';

@Injectable()
export class PlanetService {
  constructor(private readonly starWarsApi: SwapiQueryBuilder) {}

  async findAll(page = 1, filters: any): Promise<PaginatedResult<Planet>> {
    const baseQuery = this.starWarsApi.query(SwapiResource.Planets);

    if (filters && filters.name) {
      baseQuery.where('search', filters.name);
    }

    const response = await baseQuery.get({ page });

    response.results = response.results.map((result) => {
      return this.formatResponse(result);
    });

    return response;
  }

  async findById(id: number): Promise<Planet | null> {
    const response = await this.starWarsApi
      .query(SwapiResource.Planets)
      .load(['residents:name', 'films:title'])
      .getById(id);

    if (!response) {
      throw new ResourceNotFound();
    }

    return {
      ...this.formatResponse(response),
      residents: response.residents,
      films: response.films,
    };
  }

  formatResponse(response: any): Planet {
    return {
      id: response.url.split('/').reverse()[1],
      name: response.name,
      diameter: response.diameter,
      rotation_period: response.rotation_period,
      orbital_period: response.orbital_period,
      gravity: response.gravity,
      population: response.population,
      climate: response.climate,
      terrain: response.terrain,
      surface_water: response.surface_water,
    };
  }
}

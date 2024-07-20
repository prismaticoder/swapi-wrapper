import { Injectable } from '@nestjs/common';
import { SwapiQueryBuilder } from 'src/common/swapi-query.builder';
import { Planet } from './entities/planet.entity';
import { SwapiResource } from 'src/common/enums/swapi.resource';

@Injectable()
export class PlanetService {
  constructor(private readonly starWarsApi: SwapiQueryBuilder) {}

  async findAll(page = 1, filters: any): Promise<Planet[]> {
    const baseQuery = this.starWarsApi.query(SwapiResource.Planets);

    if (filters && filters.name) {
      baseQuery.where('search', filters.name);
    }

    const response = await baseQuery.get({ page });

    response.results = response.results.map((result) => {
      return {
        id: result.url.split('/').reverse()[1],
        name: result.name,
        diameter: result.diameter,
        rotation_period: result.rotation_period,
        orbital_period: result.orbital_period,
        gravity: result.gravity,
        population: result.population,
        climate: result.climate,
        terrain: result.terrain,
        surface_water: result.surface_water,
      };
    });

    return response;
  }

  async findById(id: number): Promise<Partial<Planet> | null> {
    const response = await this.starWarsApi
      .query(SwapiResource.Planets)
      .load(['residents:name', 'films:title'])
      .getById(id);

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
      residents: response.residents,
      films: response.films,
    };
  }
}

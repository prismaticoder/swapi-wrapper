import { Injectable } from '@nestjs/common';
import { People } from './interfaces/people.interface';
import { SwapiQueryBuilder } from '../swapi/swapi-query.builder';
import { SwapiResource } from '../swapi/enums/swapi.resource';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { ResourceNotFound } from '../swapi/exceptions/resource-not-found.exception';

@Injectable()
export class PeopleService {
  constructor(private readonly starWarsApi: SwapiQueryBuilder) {}

  async findAll(page = 1, filters: any): Promise<PaginatedResult<People>> {
    const baseQuery = this.starWarsApi.query(SwapiResource.People);

    if (filters && filters.name) {
      baseQuery.where('search', filters.name);
    }

    const response = await baseQuery.get({ page });

    response.results = response.results.map((result) => {
      return this.formatResponse(result);
    });

    return response;
  }

  async findById(id: number): Promise<People | null> {
    const response = await this.starWarsApi
      .query(SwapiResource.People)
      .load([
        'films:title',
        'starships:name',
        'vehicles:name',
        'homeworld:name',
      ])
      .getById(id);

    if (!response) {
      throw new ResourceNotFound();
    }

    return {
      ...this.formatResponse(response),
      homeworld: response.homeworld,
      films: response.films,
      vehicles: response.vehicles,
      starships: response.starships,
    };
  }

  formatResponse(response: any): People {
    return {
      id: response.url.split('/').reverse()[1],
      name: response.name,
      birth_year: response.birth_year,
      height: response.height,
      eye_color: response.eye_color,
      mass: response.mass,
      hair_color: response.hair_color,
      skin_color: response.skin_color,
      gender: response.gender,
    };
  }
}

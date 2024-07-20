import { Injectable, Scope } from '@nestjs/common';
import { People } from './entities/people.entity';
import { SwapiClientService } from 'src/common/swapi-client.service';
import { SwapiResource } from 'src/common/enums/swapi.resource';

@Injectable()
export class PeopleService {
  constructor(private readonly swapiClient: SwapiClientService) {}

  async findAll(): Promise<People[]> {
    const response = await this.swapiClient.query(SwapiResource.People).get();

    response.results = response.results.map((result) => {
      return this.formatResponse(result);
    });

    return response;
  }

  async findById(id: number): Promise<Partial<People> | null> {
    const response = await this.swapiClient
      .query(SwapiResource.People)
      .load([
        'films:title',
        'starships:name',
        'vehicles:name',
        'homeworld:name',
      ])
      .getById(id);

    return {
      ...this.formatResponse(response),
      homeworld: response.homeworld,
      films: response.films,
      vehicles: response.vehicles,
      starships: response.starships,
    };
  }

  private formatResponse(response: any): Partial<People> {
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

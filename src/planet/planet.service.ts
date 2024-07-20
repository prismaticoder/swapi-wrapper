import { Injectable, Scope } from '@nestjs/common';
import { SwapiClientService } from 'src/common/swapi-client.service';
import { SwapiResource } from 'src/common/enums/swapi.resource';
import { Planet } from './entities/planet.entity';

@Injectable()
export class PlanetService {
  constructor(private readonly swapiClient: SwapiClientService) {}

  async findAll(): Promise<Planet[]> {
    const response = await this.swapiClient.getAll(SwapiResource.Planets);

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

  async findById(id: number): Promise<Planet | null> {
    const response = await this.swapiClient.getSingle(
      SwapiResource.Planets,
      id,
    );

    let urlsToFetch = [];

    urlsToFetch = urlsToFetch.concat(response.films);
    urlsToFetch = urlsToFetch.concat(response.residents);

    const promisesToResolve = urlsToFetch.map((url) =>
      this.swapiClient.get(url),
    );

    const fetchedData = await Promise.allSettled(promisesToResolve);

    const films: string[] = [];
    const residents: string[] = [];

    fetchedData.forEach((data, index) => {
      if (data.status === 'fulfilled') {
        const url = urlsToFetch[index];

        if (response.films.includes(url)) {
          films.push(data.value.title);
        } else if (response.residents.includes(url)) {
          residents.push(data.value.name);
        }
      }

      if (data.status === 'rejected') {
        console.error(data.reason);
      }
    });

    response.id = response.url.split('/').reverse()[1];
    response.films = films;
    response.residents = residents;

    return response;
  }
}

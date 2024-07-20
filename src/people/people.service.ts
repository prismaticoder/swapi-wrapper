import { Injectable, Scope } from '@nestjs/common';
import { People } from './entities/people.entity';
import { SwapiClientService } from 'src/common/swapi-client.service';
import { SwapiResource } from 'src/common/enums/swapi.resource';

@Injectable()
export class PeopleService {
  constructor(private readonly swapiClient: SwapiClientService) {}

  async findAll(): Promise<People[]> {
    const response = await this.swapiClient.getAll(SwapiResource.People);

    response.results = response.results.map((result) => {
      return {
        id: result.url.split('/').reverse()[1],
        name: result.name,
        birth_year: result.birth_year,
        height: result.height,
        eye_color: result.eye_color,
        gender: result.gender,
        hair_color: result.hair_color,
        mass: result.mass,
        skin_color: result.skin_color,
      };
    });

    return response;
  }

  async findById(id: number): Promise<People | null> {
    const response = await this.swapiClient.getSingle(SwapiResource.People, id);

    console.log('get films', response.films);

    let urlsToFetch = [];

    urlsToFetch = urlsToFetch.concat(response.films);
    urlsToFetch = urlsToFetch.concat(response.starships);
    urlsToFetch = urlsToFetch.concat(response.vehicles);
    urlsToFetch = urlsToFetch.concat(response.homeworld);

    const promisesToResolve = urlsToFetch.map((url) =>
      this.swapiClient.get(url),
    );

    const fetchedData = await Promise.allSettled(promisesToResolve);

    const films: string[] = [];
    const starships: string[] = [];
    const vehicles: string[] = [];
    let homeworld: string = null;

    fetchedData.forEach((data, index) => {
      if (data.status === 'fulfilled') {
        const url = urlsToFetch[index];

        if (response.films.includes(url)) {
          films.push(data.value.title);
        } else if (response.starships.includes(url)) {
          starships.push(data.value.name);
        } else if (response.vehicles.includes(url)) {
          vehicles.push(data.value.name);
        } else if (response.homeworld === url) {
          homeworld = data.value.name;
        }
      }

      if (data.status === 'rejected') {
        console.error(data.reason);
      }
    });

    (response.id = response.url.split('/').reverse()[1]),
      (response.films = films);
    response.starships = starships;
    response.vehicles = vehicles;
    response.homeworld = homeworld;
    response.the_man_himself = 'The man himself';

    return response;
  }
}

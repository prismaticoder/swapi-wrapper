import {
  CacheTTL,
  Controller,
  Get,
  Param,
  Query,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { PlanetService } from './planet.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JsonResponse } from 'src/common/helpers/json-response';
import { SwapiExceptionFilter } from 'src/common/filters/swapi-exception.filter';

@Controller('planets')
@UseInterceptors(CacheInterceptor)
@UseFilters(SwapiExceptionFilter)
@CacheTTL(180)
export class PlanetController {
  constructor(private readonly planetService: PlanetService) {}

  @Get('')
  async index(@Query() query: any) {
    const planets = await this.planetService.findAll(query.page, query);

    return JsonResponse.create('Planets retrieved successfully.', planets);
  }

  @Get(':id')
  async show(@Param('id') id: string | number) {
    const planet = await this.planetService.findById(Number(id));

    return JsonResponse.create('Planet retrieved successfully.', planet);
  }
}

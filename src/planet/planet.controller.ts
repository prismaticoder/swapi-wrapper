import {
  CacheTTL,
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PlanetService } from './planet.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('planets')
@UseInterceptors(CacheInterceptor)
@CacheTTL(180)
export class PlanetController {
  constructor(private readonly planetService: PlanetService) {}

  @Get('')
  async index(@Query() query: any) {
    return await this.planetService.findAll(query.page, query);
  }

  @Get(':id')
  async show(@Param('id') id: string | number) {
    return await this.planetService.findById(Number(id));
  }
}

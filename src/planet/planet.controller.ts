import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlanetService } from './planet.service';

@Controller('planets')
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

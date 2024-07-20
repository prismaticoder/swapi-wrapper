import { Controller, Get, Req } from '@nestjs/common';
import { PlanetService } from './planet.service';
import { Request } from 'express';

@Controller('planets')
export class PlanetController {
  constructor(private readonly planetService: PlanetService) {}

  @Get('')
  async index() {
    return await this.planetService.findAll();
  }

  @Get(':id')
  async show(@Req() request: Request) {
    const { id } = request.params;

    return await this.planetService.findById(Number(id));
  }
}

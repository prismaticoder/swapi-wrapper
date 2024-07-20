import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get('')
  async index() {
    const result = await this.peopleService.findAll();

    return result;
  }

  @Get(':id')
  async show(@Req() request: Request) {
    const { id } = request.params;

    const result = await this.peopleService.findById(Number(id));

    return result;
  }
}

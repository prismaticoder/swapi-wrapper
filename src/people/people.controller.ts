import {
  CacheTTL,
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PeopleService } from './people.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('people')
@UseInterceptors(CacheInterceptor)
@CacheTTL(180)
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get('')
  async index(@Query() query: any) {
    const result = await this.peopleService.findAll(query.page, query);

    return result;
  }

  @Get(':id')
  async show(@Param('id') id: string | number) {
    const result = await this.peopleService.findById(Number(id));

    return result;
  }
}

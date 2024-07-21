import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SwapiQueryBuilder } from './swapi-query.builder';

@Module({
  imports: [HttpModule],
  providers: [SwapiQueryBuilder],
  exports: [SwapiQueryBuilder],
})
export class CommonModule {}

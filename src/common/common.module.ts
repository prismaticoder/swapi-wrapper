import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SwapiQueryBuilder } from './swapi-query.builder';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [SwapiQueryBuilder],
  exports: [SwapiQueryBuilder],
})
export class CommonModule {}

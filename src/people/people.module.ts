import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { HttpModule } from '@nestjs/axios';
import { PeopleController } from './people.controller';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SwapiModule } from '../swapi/swapi.module';

@Module({
  imports: [HttpModule, SwapiModule],
  providers: [
    PeopleService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [PeopleController],
})
export class PeopleModule {}

import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { People } from './entities/people.entity';
import { HttpModule } from '@nestjs/axios';
import { PeopleController } from './people.controller';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SwapiModule } from 'src/swapi/swapi.module';

@Module({
  imports: [TypeOrmModule.forFeature([People]), HttpModule, SwapiModule],
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

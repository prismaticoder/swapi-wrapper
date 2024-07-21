import { Module } from '@nestjs/common';
import { PlanetController } from './planet.controller';
import { PlanetService } from './planet.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SwapiModule } from 'src/swapi/swapi.module';

@Module({
  imports: [SwapiModule],
  controllers: [PlanetController],
  providers: [
    PlanetService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class PlanetModule {}

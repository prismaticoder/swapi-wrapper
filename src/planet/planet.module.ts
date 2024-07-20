import { Module } from '@nestjs/common';
import { PlanetController } from './planet.controller';
import { PlanetService } from './planet.service';
import { CommonModule } from 'src/common/common.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [CommonModule],
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

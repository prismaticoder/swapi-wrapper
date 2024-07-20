import { Module } from '@nestjs/common';
import { PlanetController } from './planet.controller';
import { PlanetService } from './planet.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [PlanetController],
  providers: [PlanetService],
})
export class PlanetModule {}

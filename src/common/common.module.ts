import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SwapiClientService } from './swapi-client.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [SwapiClientService],
  exports: [SwapiClientService],
})
export class CommonModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { PeopleModule } from './people/people.module';
import { PlanetModule } from './planet/planet.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { SwapiModule } from './swapi/swapi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config], isGlobal: true }),
    PeopleModule,
    PlanetModule,
    SwapiModule,
    ThrottlerModule.forRoot([
      {
        ttl: 300_000, // 5 minutes
        limit: 30,
      },
    ]),
    CacheModule.register({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

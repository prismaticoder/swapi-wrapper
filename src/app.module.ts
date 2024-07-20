import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleModule } from './vehicle/vehicle.module';
import { SpecieModule } from './specie/specie.module';
import { StarshipModule } from './starship/starship.module';
import { PeopleModule } from './people/people.module';
import { FilmModule } from './film/film.module';
import { PlanetModule } from './planet/planet.module';
import { People } from './people/entities/people.entity';
import { Film } from './film/entities/film.entity';
import { Specie } from './specie/entities/specie.entity';
import { Planet } from './planet/entities/planet.entity';
import { Vehicle } from './vehicle/entities/vehicle.entity';
import { Starship } from './starship/entities/starship.entity';
import { CommonModule } from './common/common.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config], isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_NAME,
      entities: [People, Film, Specie, Planet, Vehicle, Starship],
      synchronize: true,
    }),
    VehicleModule,
    SpecieModule,
    StarshipModule,
    PeopleModule,
    FilmModule,
    PlanetModule,
    CommonModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

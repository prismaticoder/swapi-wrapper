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

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config] }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

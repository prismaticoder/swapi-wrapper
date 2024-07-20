import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { People } from './entities/people.entity';
import { HttpModule } from '@nestjs/axios';
import { PeopleController } from './people.controller';
import { CommonModule } from 'src/common/common.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [TypeOrmModule.forFeature([People]), HttpModule, CommonModule],
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

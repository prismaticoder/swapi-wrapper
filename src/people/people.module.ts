import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { People } from './entities/people.entity';
import { HttpModule } from '@nestjs/axios';
import { PeopleController } from './people.controller';
import { CommonModule } from 'src/common/common.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmModule.forFeature([People]), HttpModule, CommonModule],
  providers: [PeopleService],
  controllers: [PeopleController],
})
export class PeopleModule {}

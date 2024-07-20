import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  title: string;

  @Column()
  episode_id: number;

  @Column()
  opening_crawl: string;

  @Column()
  director: string;

  @Column()
  producer: string;

  @Index()
  @Column('date')
  release_date: string;

  @Column('simple-json')
  species: string[];

  @Column('simple-json')
  starships: string[];

  @Column('simple-json')
  vehicles: string[];

  @Column('simple-json')
  characters: string[];

  @Column('simple-json')
  planets: string[];

  @Index()
  @Column()
  url: string;

  @Column('datetime')
  created: string;

  @Column('datetime')
  edited: string;
}

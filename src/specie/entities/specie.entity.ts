import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('species')
export class Specie {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column()
  classification: string;

  @Column()
  designation: string;

  @Column()
  average_height: string;

  @Column()
  average_lifespan: string;

  @Column()
  eye_colors: string;

  @Column()
  hair_colors: string;

  @Column()
  skin_colors: string;

  @Column()
  language: string;

  @Index()
  @Column()
  homeworld: string;

  @Column('simple-json')
  people: string[];

  @Column('simple-json')
  films: string[];

  @Index()
  @Column()
  url: string;

  @Column()
  created: string;

  @Column()
  edited: string;
}

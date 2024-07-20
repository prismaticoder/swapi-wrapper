import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class People {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column()
  birth_year: string;

  @Column()
  eye_color: string;

  @Column()
  gender: string;

  @Column()
  hair_color: string;

  @Column()
  height: string;

  @Column()
  mass: string;

  @Column()
  skin_color: string;

  @Column()
  homeworld: string;

  @Column('simple-json')
  films: string[];

  @Column('simple-json')
  starships: string[];

  @Column('simple-json')
  vehicles: string[];
}

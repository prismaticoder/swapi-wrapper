import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('planets')
export class Planet {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column()
  diameter: string;

  @Column()
  rotation_period: string;

  @Column()
  orbital_period: string;

  @Column()
  gravity: string;

  @Column()
  population: string;

  @Column()
  climate: string;

  @Column()
  terrain: string;

  @Column()
  surface_water: string;

  @Column('simple-json')
  residents: string[];

  @Column('simple-json')
  films: string[];

  @Index()
  @Column()
  url: string;

  @Column('datetime')
  created: string;

  @Column('datetime')
  edited: string;
}

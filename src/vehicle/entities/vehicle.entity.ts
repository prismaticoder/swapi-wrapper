import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Index()
  @Column()
  model: string;

  @Column()
  vehicle_class: string;

  @Column()
  manufacturer: string;

  @Column()
  cost_in_credits: string;

  @Column()
  length: string;

  @Column()
  crew: string;

  @Column()
  passengers: string;

  @Column()
  max_atmosphering_speed: string;

  @Column()
  cargo_capacity: string;

  @Column()
  consumables: string;

  @Column('simple-json')
  films: string[];

  @Column('simple-json')
  pilots: string[];

  @Index()
  @Column()
  url: string;

  @Column()
  created: string;

  @Column()
  edited: string;
}

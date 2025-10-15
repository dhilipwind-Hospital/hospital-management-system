import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Service } from './Service';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column('text')
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  headOfDepartment?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  operatingHours?: string;

  @Column({ type: 'varchar', default: 'active' })
  @IsString()
  status: 'active' | 'inactive' | 'under_maintenance' = 'active';

  @OneToMany(() => Service, service => service.department)
  services!: Service[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

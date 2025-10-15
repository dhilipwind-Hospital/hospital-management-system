import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { IsEmail, Length, IsDateString, IsOptional, IsString, IsDate, IsEnum } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Appointment } from './Appointment';
import { Department } from './Department';
import { RefreshToken } from './RefreshToken';
import { UserRole, Permission } from '../types/roles';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Length(2, 50)
  firstName: string = '';

  @Column()
  @Length(2, 50)
  lastName: string = '';

  @Column({ unique: true })
  @IsEmail()
  email: string = '';

  @Column()
  @IsString()
  @Length(7, 20)
  phone: string = '';

  @Column()
  @Length(8)
  password: string = '';

  @Column({
    type: 'enum',
    enum: Object.values(UserRole),
    default: UserRole.PATIENT
  })
  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole = UserRole.PATIENT;

  @Column({
    type: 'enum',
    enum: Object.values(Permission),
    array: true,
    default: []
  })
  @IsOptional()
  permissions: Permission[] = [];

  @Column({ default: true })
  isActive: boolean = true;

  @Column({ type: 'date', nullable: true })
  @IsDate()
  @IsOptional()
  dateOfBirth?: Date;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  gender?: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  city?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  state?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  preferences?: Record<string, any>;

  // Patient ID fields (for multi-location system)
  @Column({ unique: true, nullable: true, name: 'global_patient_id' })
  @IsString()
  @IsOptional()
  globalPatientId?: string; // CHN-2025-00001

  @Column({ nullable: true, name: 'location_code' })
  @IsString()
  @IsOptional()
  locationCode?: string; // CHN, MUM, DEL

  @Column({ nullable: true, name: 'registered_location' })
  @IsString()
  @IsOptional()
  registeredLocation?: string; // Chennai, Mumbai, Delhi

  @Column({ nullable: true, name: 'registered_year', type: 'int' })
  @IsOptional()
  registeredYear?: number; // 2025

  @Column({ nullable: true, name: 'patient_sequence_number', type: 'int' })
  @IsOptional()
  patientSequenceNumber?: number; // 1, 2, 3...

  // Department relationships
  // For doctors: which department they belong to
  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department | null;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId?: string | null;

  // For patients: primary department assignment
  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'primary_department_id' })
  primaryDepartment?: Department | null;

  @Column({ name: 'primary_department_id', type: 'uuid', nullable: true })
  primaryDepartmentId?: string | null;

  // Relationships
  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments!: Appointment[];

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  async hashPassword(): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  profileImage?: string;
  preferences?: Record<string, any>;
}

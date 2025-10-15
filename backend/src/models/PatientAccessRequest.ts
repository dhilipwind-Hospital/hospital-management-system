import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum AccessRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('patient_access_requests')
export class PatientAccessRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient!: User;

  @Column({ name: 'requesting_doctor_id', type: 'uuid' })
  requestingDoctorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requesting_doctor_id' })
  requestingDoctor!: User;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'requested_duration_hours', type: 'integer', default: 24 })
  requestedDurationHours!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: AccessRequestStatus.PENDING,
  })
  status!: AccessRequestStatus;

  @Column({ name: 'approved_by_patient_at', type: 'timestamp', nullable: true })
  approvedByPatientAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum AuditAction {
  REQUEST_CREATED = 'request_created',
  REQUEST_APPROVED = 'request_approved',
  REQUEST_REJECTED = 'request_rejected',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_EXPIRED = 'access_expired',
  ACCESS_REVOKED = 'access_revoked',
  RECORD_VIEWED = 'record_viewed',
  PRESCRIPTION_VIEWED = 'prescription_viewed',
  APPOINTMENT_VIEWED = 'appointment_viewed',
}

@Entity('patient_access_audit')
export class PatientAccessAudit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient!: User;

  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctorId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: User;

  @Column({ type: 'varchar', length: 50 })
  action!: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

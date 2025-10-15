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
import { PatientAccessRequest } from './PatientAccessRequest';

@Entity('patient_shared_access')
export class PatientSharedAccess {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient!: User;

  @Column({ name: 'doctor_id', type: 'uuid' })
  doctorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor!: User;

  @Column({ name: 'access_request_id', type: 'uuid' })
  accessRequestId!: string;

  @ManyToOne(() => PatientAccessRequest)
  @JoinColumn({ name: 'access_request_id' })
  accessRequest!: PatientAccessRequest;

  @Column({ name: 'granted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  grantedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

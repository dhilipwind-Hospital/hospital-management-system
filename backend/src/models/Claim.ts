import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export type ClaimStatus = 'Submitted' | 'Processing' | 'Approved' | 'Rejected';

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount!: number;

  @Column({ type: 'varchar', default: 'Submitted' })
  status!: ClaimStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

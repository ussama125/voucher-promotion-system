import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index({ unique: true })
  code: string;

  @Column()
  discountType: 'percentage' | 'fixed';

  @Column('decimal', { precision: 10, scale: 2 })
  discountValue: number;

  @Column()
  @Index('idx_voucher_expiration_date', ['expirationDate'])
  expirationDate: Date;

  @Column()
  usageLimit: number;

  @Column({ nullable: true })
  minimumOrderValue: number;

  @Column({ default: 0 })
  usageCount: number;
}

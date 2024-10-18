import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ unique: true })
  code: string;

  @Column('simple-array')
  eligibleIds: string[];

  @Column()
  eligibleOn: string;

  @Column()
  discountType: string;

  @Column('decimal', { precision: 10, scale: 2 })
  discountValue: number;

  @Column()
  @Index('idx_promo_expiration_date', ['expirationDate'])
  expirationDate: Date;

  @Column()
  usageLimit: number;

  @Column({ default: 0 })
  usageCount: number;
}

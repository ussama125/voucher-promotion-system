import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  discountType: 'percentage' | 'fixed';

  @Column('decimal')
  discountValue: number;

  @Column()
  expirationDate: Date;

  @Column()
  usageLimit: number;

  @Column({ nullable: true })
  minimumOrderValue: number;

  @Column({ default: 0 })
  usageCount: number;
}

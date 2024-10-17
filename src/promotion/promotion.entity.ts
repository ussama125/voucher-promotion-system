import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column('simple-array')
  eligibleCategories: string[];

  @Column()
  discountType: 'percentage' | 'fixed';

  @Column('decimal')
  discountValue: number;

  @Column()
  expirationDate: Date;

  @Column()
  usageLimit: number;

  @Column({ default: 0 })
  usageCount: number;
}

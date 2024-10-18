import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

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
  expirationDate: Date;

  @Column()
  usageLimit: number;

  @Column({ default: 0 })
  usageCount: number;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Order } from '../order/order.entity';

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

  @ManyToMany(() => Order)
  @JoinTable()
  orders: Order[];
}

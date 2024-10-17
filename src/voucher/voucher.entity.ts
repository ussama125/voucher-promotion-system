import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Order } from '../order/order.entity';

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

  @ManyToMany(() => Order)
  @JoinTable()
  orders: Order[];
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Voucher } from '../voucher/voucher.entity';
import { Promotion } from '../promotion/promotion.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  totalAmount: number;

  @Column('simple-json')
  items: {
    productId: number;
    quantity: number;
    price: number;
    category: string;
  }[];

  @ManyToMany(() => Voucher)
  @JoinTable()
  vouchers: Voucher[];

  @ManyToMany(() => Promotion)
  @JoinTable()
  promotions: Promotion[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
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

  @ManyToMany(() => Voucher, (voucher) => voucher.orders)
  vouchers: Voucher[];

  @ManyToMany(() => Promotion, (promotion) => promotion.orders)
  promotions: Promotion[];
}

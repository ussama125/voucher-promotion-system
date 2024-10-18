import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Voucher } from '../voucher/voucher.entity';
import { Promotion } from '../promotion/promotion.entity';
import { OrderItem } from './entities/order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  totalAmount: number;

  @Column({ type: 'decimal', nullable: true })
  discount: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @ManyToMany(() => Voucher)
  @JoinTable()
  vouchers: Voucher[];

  @ManyToMany(() => Promotion)
  @JoinTable()
  promotions: Promotion[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // @Expose()
  // getItems() {
  //   return this.items;
  // }
}

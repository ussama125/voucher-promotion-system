import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from '../order.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  @Exclude()
  order: Order;

  @Column()
  productId: string;

  @Column()
  category: string;

  @Column('decimal')
  price: number;

  @Column('int')
  quantity: number;
}

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sale } from "./sale.entity";
import { Product } from "../../product/entities/product.entity";

@Entity()
export class SaleItem {
    @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
    id: number;

    @ManyToOne(() => Sale, (sale) => sale.items)
    sale: Sale;

    @ManyToOne(() => Product)
    product: Product;

    @Column({ type: 'integer' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    priceAtSale: number;
}

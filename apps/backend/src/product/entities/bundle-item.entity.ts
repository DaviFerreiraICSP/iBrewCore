import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class BundleItem {
    @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
    id: number;

    @ManyToOne(() => Product, (product) => product.bundleAsParent, { onDelete: 'CASCADE' })
    bundle: Product;

    @ManyToOne(() => Product, (product) => product.bundleAsChild)
    product: Product;

    @Column({ type: 'integer', unsigned: true, default: 1 })
    quantity: number;
}

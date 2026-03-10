import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "../../category/entities/category.entity";
import { BundleItem } from "./bundle-item.entity";

@Entity()
export class Product {

    @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'integer', unsigned: true, default: 0 })
    stock: number;

    @Column({ type: 'boolean', default: true })
    trackStock: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    imageUrl: string;

    @ManyToOne(() => Category, (category) => category.products, { nullable: true })
    category: Category;

    @Column({ type: 'boolean', default: false })
    isBundle: boolean;

    @OneToMany(() => BundleItem, (item) => item.bundle, { cascade: true })
    bundleItems: BundleItem[];

    // Helps tracking if a product is part of bundles
    @OneToMany(() => BundleItem, (item) => item.product)
    bundleAsChild: BundleItem[];

    // Helps tracking parents for a bundle
    @OneToMany(() => BundleItem, (item) => item.bundle)
    bundleAsParent: BundleItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

}

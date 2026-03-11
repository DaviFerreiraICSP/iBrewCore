import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";

@Entity()
export class Category {
    @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    icon: string;

    @Column({ type: 'varchar', length: 50, nullable: true, default: '#003f82' })
    color: string;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

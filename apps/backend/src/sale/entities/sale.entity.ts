import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "../../user/entities/user.entity";
import { SaleItem } from "./sale-item.entity";

@Entity()
export class Sale {

    @PrimaryGeneratedColumn({ type: "integer", unsigned: true })
    id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'varchar', length: 50, default: 'PENDING' })
    status: string;

    @Column({ type: 'varchar', length: 20, default: 'CASH' })
    paymentMethod: string;

    @Column({ type: 'varchar', length: 20, default: 'PAID' })
    paymentStatus: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    transactionId: string;

    @ManyToOne(() => User, (user) => user.sales)
    user: User;

    @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
    items: SaleItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}


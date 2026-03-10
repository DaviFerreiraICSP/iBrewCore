import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Sale } from "../../sale/entities/sale.entity";

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

@Entity()
export class User {

    @PrimaryGeneratedColumn({ type: "integer", unsigned: true })
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ type: 'varchar', length: 20, default: UserRole.USER })
    role: UserRole;

    @Column({ select: false, nullable: true })
    twoFactorSecret?: string;

    @Column({ default: false })
    isTwoFactorEnabled: boolean;

    @Column({ nullable: true })
    avatarUrl?: string;

    @Column({ select: false, nullable: true })
    recoveryCode?: string;

    @Column({ type: 'datetime', nullable: true })
    recoveryCodeExpires?: Date;

    @OneToMany(() => Sale, (sale) => sale.user)
    sales: Sale[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

}

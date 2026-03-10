import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn({ type: "integer", unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 50 })
    action: string; // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'

    @Column({ type: 'varchar', length: 50 })
    module: string; // e.g., 'PRODUCT', 'SALE', 'USER'

    @Column({ type: 'integer', unsigned: true, nullable: true })
    entityId: number;

    @Column({ type: 'text', nullable: true })
    details: string;

    @ManyToOne(() => User, { nullable: true })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}

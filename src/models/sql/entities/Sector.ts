import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";

@Index("fk_sector_created_by_idx", ["createdBy"], {})
@Index("fk_sector_updated_by_idx", ["updatedBy"], {})
@Index("uk_sector_ids", ["key"], { unique: true })
@Entity("sector")
export class Sector {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "key", unique: true, length: 250 })
  key: string;

  @Column("varchar", { name: "value", length: 250 })
  value: string;

  @Column("bigint", { name: "created_by", nullable: true, unsigned: true })
  createdBy: string | null;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("bigint", { name: "updated_by", nullable: true, unsigned: true })
  updatedBy: string | null;

  @Column("datetime", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => ClientDetails, (clientDetails) => clientDetails.sector)
  clientDetails: ClientDetails[];

  @ManyToOne(() => User, (user) => user.sectors, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.sectors2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;
}

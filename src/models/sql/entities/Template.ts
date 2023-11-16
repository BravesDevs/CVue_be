import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Index("fk_template_1", ["createdBy"], {})
@Index("fk_template_2_idx", ["modifiedBy"], {})
@Index("template_name", ["name", "createdBy"], { unique: true })
@Entity("template")
export class Template {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 750 })
  name: string;

  @Column("varchar", { name: "title", length: 750 })
  title: string;

  @Column("varchar", { name: "from", length: 250 })
  from: string;

  @Column("enum", {
    name: "type",
    enum: ["KUDOS", "AWARD", "BADGE", "GENERAL", "REWARD", "TRAINING"],
  })
  type: "KUDOS" | "AWARD" | "BADGE" | "GENERAL" | "REWARD" | "TRAINING";

  @Column("json", { name: "body" })
  body: object;

  @Column("tinyint", { name: "is_default", default: () => "'0'" })
  isDefault: number;

  @Column("bigint", { name: "created_by", nullable: true, unsigned: true })
  createdBy: string | null;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("bigint", { name: "modified_by", nullable: true, unsigned: true })
  modifiedBy: string | null;

  @Column("datetime", {
    name: "modified_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  modifiedAt: Date;

  @ManyToOne(() => User, (user) => user.templates, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.templates2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "modified_by", referencedColumnName: "id" }])
  modifiedBy2: User;
}

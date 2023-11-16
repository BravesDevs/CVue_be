import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("faq")
export class Faq {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("varchar", { name: "question", length: 500 })
  question: string;

  @Column("json", { name: "answer" })
  answer: object;

  @Column("enum", { name: "type", enum: ["FAQ", "LINK_TO_SUPPORT"] })
  type: "FAQ" | "LINK_TO_SUPPORT";

  @Column("int", { name: "display_order" })
  displayOrder: number;

  @Column("tinyint", { name: "is_visible", width: 1 })
  isVisible: boolean;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("datetime", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}

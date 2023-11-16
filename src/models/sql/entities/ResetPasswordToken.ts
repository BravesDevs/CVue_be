import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Index("fk_reset_password_token_user_id_idx", ["userId"], {})
@Entity("reset_password_token")
export class ResetPasswordToken {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "token", length: 500 })
  token: string;

  @Column("bigint", { name: "user_id", nullable: true, unsigned: true })
  userId: string | null;

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => User, (user) => user.resetPasswordTokens, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}

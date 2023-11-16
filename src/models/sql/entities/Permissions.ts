import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Features } from "./Features";
import { UserType } from "./UserType";

@Index("fk_permissions_created_by_idx", ["createdBy"], {})
@Index("fk_permissions_feature_id_idx", ["featureId"], {})
@Index("fk_permissions_updated_by_idx", ["updatedBy"], {})
@Index("fk_permissions_user_type_id_idx", ["userTypeId"], {})
@Entity("permissions")
export class Permissions {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("int", { name: "access_type" })
  accessType: number;

  @Column("bigint", { name: "user_type_id", unsigned: true })
  userTypeId: string;

  @Column("bigint", { name: "feature_id", unsigned: true })
  featureId: string;

  @Column("bigint", { name: "created_by", unsigned: true })
  createdBy: string;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("bigint", { name: "updated_by", unsigned: true })
  updatedBy: string;

  @Column("datetime", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.permissions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Features, (features) => features.permissions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "feature_id", referencedColumnName: "id" }])
  feature: Features;

  @ManyToOne(() => User, (user) => user.permissions2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => UserType, (userType) => userType.permissions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_type_id", referencedColumnName: "id" }])
  userType: UserType;
}

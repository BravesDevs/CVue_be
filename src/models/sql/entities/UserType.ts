import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Permissions } from "./Permissions";
import { User } from "./User";

@Index("fk_user_type_created_by_idx", ["createdBy"], {})
@Index("fk_user_type_parent_id_idx", ["parentId"], {})
@Index("fk_user_type_updated_by", ["updatedBy"], {})
@Index("uk_user_type", ["type"], { unique: true })
@Entity("user_type")
export class UserType {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "type", unique: true, length: 250 })
  type: string;

  @Column("varchar", { name: "name", nullable: true, length: 100 })
  name: string | null;

  @Column("bigint", { name: "parent_id", nullable: true, unsigned: true })
  parentId: string | null;

  @Column("bigint", { name: "created_by", nullable: true, unsigned: true })
  createdBy: string | null;

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

  @Column("bigint", { name: "updated_by", nullable: true, unsigned: true })
  updatedBy: string | null;

  @OneToMany(() => Permissions, (permissions) => permissions.userType)
  permissions: Permissions[];

  @OneToMany(() => User, (user) => user.userType_2)
  users: User[];

  @ManyToOne(() => User, (user) => user.userTypes, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => UserType, (userType) => userType.userTypes, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: UserType;

  @OneToMany(() => UserType, (userType) => userType.parent)
  userTypes: UserType[];

  @ManyToOne(() => User, (user) => user.userTypes2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;
}

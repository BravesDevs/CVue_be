import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Site } from "./Site";
import { User } from "./User";

@Index(
  "user_site_association_site_id_user_id_unique_index",
  ["siteId", "userId"],
  { unique: true }
)
@Index("user_site_association_user_id_fk", ["userId"], {})
@Index("user_site_association_user_id_fk_2", ["createdBy"], {})
@Entity("user_site_association")
export class UserSiteAssociation {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", unsigned: true })
  userId: string;

  @Column("bigint", { name: "site_id", unsigned: true })
  siteId: string;

  @Column("bigint", { name: "created_by", nullable: true, unsigned: true })
  createdBy: string | null;

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("bigint", { name: "updated_by", nullable: true, unsigned: true })
  updatedBy: string | null;

  @Column("datetime", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => Site, (site) => site.userSiteAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(() => User, (user) => user.userSiteAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @ManyToOne(() => User, (user) => user.userSiteAssociations2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;
}

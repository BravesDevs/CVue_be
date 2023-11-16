import { Column, Entity } from "typeorm";

@Entity("mobile_version")
export class MobileVersion {
  @Column("bigint", { primary: true, name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", nullable: true, length: 45 })
  name: string | null;

  @Column("varchar", { name: "description", nullable: true, length: 250 })
  description: string | null;

  @Column("varchar", { name: "ios_version", length: 45 })
  iosVersion: string;

  @Column("varchar", { name: "android_version", length: 45 })
  androidVersion: string;

  @Column("tinyint", {
    name: "is_forced_update",
    nullable: true,
    default: () => "'1'",
  })
  isForcedUpdate: number | null;

  @Column("tinyint", {
    name: "is_latest_running",
    nullable: true,
    default: () => "'0'",
  })
  isLatestRunning: number | null;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;
}

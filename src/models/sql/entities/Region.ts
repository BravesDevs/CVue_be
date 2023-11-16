import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./Booking";
import { User } from "./User";
import { ClientDetails } from "./ClientDetails";
import { Site } from "./Site";
import { TimeAndAttendanceData } from "./TimeAndAttendanceData";

@Index("admin_id", ["adminId"], { unique: true })
@Index("uk_region_ids", ["name", "clientId"], { unique: true })
@Index("agency_region_admin_id", ["agencyRegionAdminId"], { unique: true })
@Index("fk_region_client_id", ["clientId"], {})
@Index("fk_region_admin_id_idx", ["adminId"], {})
@Index("fk_region_created_by_idx", ["createdBy"], {})
@Index("fk_region_updated_by_idx", ["updatedBy"], {})
@Entity("region")
export class Region {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 250 })
  name: string;

  @Column("bigint", { name: "client_id", nullable: true, unsigned: true })
  clientId: string | null;

  @Column("bigint", {
    name: "admin_id",
    nullable: true,
    unique: true,
    unsigned: true,
  })
  adminId: string | null;

  @Column("bigint", {
    name: "agency_region_admin_id",
    nullable: true,
    unique: true,
    unsigned: true,
  })
  agencyRegionAdminId: string | null;

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

  @OneToMany(() => Booking, (booking) => booking.region)
  bookings: Booking[];

  @OneToOne(() => User, (user) => user.region, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "agency_region_admin_id", referencedColumnName: "id" }])
  agencyRegionAdmin: User;

  @OneToOne(() => User, (user) => user.region2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "admin_id", referencedColumnName: "id" }])
  admin: User;

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.regions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.regions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.regions2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(() => Site, (site) => site.region)
  sites: Site[];

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.region
  )
  timeAndAttendanceData: TimeAndAttendanceData[];
}

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
import { Departments } from "./Departments";
import { Region } from "./Region";
import { Shift } from "./Shift";
import { Site } from "./Site";
import { User } from "./User";
import { BookingAssociation } from "./BookingAssociation";

@Index("FK_booking_client_details", ["clientId"], {})
@Index("FK_booking_departments", ["departmentId"], {})
@Index("FK_booking_region", ["regionId"], {})
@Index("FK_booking_shift", ["shiftTypeId"], {})
@Index("FK_booking_site", ["siteId"], {})
@Index("FK_booking_user", ["createdBy"], {})
@Index("FK_booking_user_2", ["updatedBy"], {})
@Entity("booking")
export class Booking {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "client_id", unsigned: true })
  clientId: string;

  @Column("bigint", { name: "site_id", unsigned: true })
  siteId: string;

  @Column("bigint", { name: "region_id", unsigned: true })
  regionId: string;

  @Column("datetime", { name: "start_date" })
  startDate: Date;

  @Column("datetime", { name: "end_Date" })
  endDate: Date;

  @Column("bigint", { name: "department_id", unsigned: true })
  departmentId: string;

  @Column("bigint", { name: "shift_type_id", unsigned: true })
  shiftTypeId: string;

  @Column("json", { name: "required_heads" })
  requiredHeads: object;

  @Column("int", { name: "total", unsigned: true })
  total: number;

  @Column("enum", {
    name: "status",
    enum: ["0", "1", "2"],
    default: () => "'0'",
  })
  status: "0" | "1" | "2";

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

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => Departments, (departments) => departments.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "department_id", referencedColumnName: "id" }])
  department: Departments;

  @ManyToOne(() => Region, (region) => region.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "region_id", referencedColumnName: "id" }])
  region: Region;

  @ManyToOne(() => Shift, (shift) => shift.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "shift_type_id", referencedColumnName: "id" }])
  shiftType: Shift;

  @ManyToOne(() => Site, (site) => site.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(() => User, (user) => user.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.bookings2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(
    () => BookingAssociation,
    (bookingAssociation) => bookingAssociation.booking
  )
  bookingAssociations: BookingAssociation[];
}

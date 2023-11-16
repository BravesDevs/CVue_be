import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Booking } from "./Booking";
import { AgencyDetails } from "./AgencyDetails";

@Index("FK_booking_association_agency_details", ["agencyId"], {})
@Index("FK_booking_association_booking", ["bookingId"], {})
@Index("FK_booking_association_user", ["createdBy"], {})
@Index("FK_booking_association_user_2", ["updatedBy"], {})
@Entity("booking_association")
export class BookingAssociation {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "agency_id", unsigned: true })
  agencyId: string;

  @Column("json", { name: "requested_heads" })
  requestedHeads: object;

  @Column("json", { name: "fulfilled_heads", nullable: true })
  fulfilledHeads: object | null;

  @Column("int", { name: "requested_total" })
  requestedTotal: number;

  @Column("int", { name: "fulfilled_total", nullable: true })
  fulfilledTotal: number | null;

  @Column("bigint", { name: "booking_id", unsigned: true })
  bookingId: string;

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
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("bigint", { name: "updated_by", unsigned: true })
  updatedBy: string;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @ManyToOne(() => User, (user) => user.bookingAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => User, (user) => user.bookingAssociations2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Booking, (booking) => booking.bookingAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Booking;

  @ManyToOne(
    () => AgencyDetails,
    (agencyDetails) => agencyDetails.bookingAssociations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;
}
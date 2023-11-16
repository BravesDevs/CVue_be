import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./Booking";
import { Job } from "./Job";
import { User } from "./User";
import { ClientDetails } from "./ClientDetails";
import { TimeAndAttendanceData } from "./TimeAndAttendanceData";

@Index("fk_shift_created_by_idx", ["createdBy"], {})
@Index("fk_shift_updated_by_idx", ["updatedBy"], {})
@Index("shift_FK", ["clientId"], {})
@Entity("shift")
export class Shift {
  @Column("bigint", { name: "client_id", unsigned: true })
  clientId: string;

  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 250 })
  name: string;

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

  @OneToMany(() => Booking, (booking) => booking.shiftType)
  bookings: Booking[];

  @OneToMany(() => Job, (job) => job.shift)
  jobs: Job[];

  @ManyToOne(() => User, (user) => user.shifts, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.shifts2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.shifts, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.shift
  )
  timeAndAttendanceData: TimeAndAttendanceData[];
}

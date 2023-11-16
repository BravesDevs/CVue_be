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
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";
import { JobAssociation } from "./JobAssociation";
import { TimeAndAttendanceData } from "./TimeAndAttendanceData";

@Index("fk_departments_client_id", ["clientId"], {})
@Index("fk_departments_created_by_idx", ["createdBy"], {})
@Index("fk_departments_updated_by_idx", ["updatedBy"], {})
@Entity("departments")
export class Departments {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 250 })
  name: string;

  @Column("bigint", { name: "client_id", unsigned: true })
  clientId: string;

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

  @OneToMany(() => Booking, (booking) => booking.department)
  bookings: Booking[];

  @ManyToOne(
    () => ClientDetails,
    (clientDetails) => clientDetails.departments,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.departments, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.departments2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(
    () => JobAssociation,
    (jobAssociation) => jobAssociation.department
  )
  jobAssociations: JobAssociation[];

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.department
  )
  timeAndAttendanceData: TimeAndAttendanceData[];
}

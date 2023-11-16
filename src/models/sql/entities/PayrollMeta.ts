import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Payroll } from "./Payroll";
import { AgencyDetails } from "./AgencyDetails";
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";
import { Site } from "./Site";
import { TimeAndAttendance } from "./TimeAndAttendance";
import { PayrollSummary } from "./PayrollSummary";

@Index("fk_payroll_meta_agency_id", ["agencyId"], {})
@Index("fk_payroll_meta_client_id", ["clientId"], {})
@Index("fk_payroll_meta_created_by_idx", ["createdBy"], {})
@Index("fk_payroll_meta_site_id", ["siteId"], {})
@Index("fk_payroll_meta_time_and_attendance_id", ["timeAndAttendanceId"], {})
@Index("fk_payroll_meta_updated_by_idx", ["updatedBy"], {})
@Entity("payroll_meta")
export class PayrollMeta {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("varchar", { name: "path", length: 250 })
  path: string;

  @Column("varchar", { name: "status", length: 45 })
  status: string;

  @Column("bigint", { name: "client_id", unsigned: true })
  clientId: string;

  @Column("bigint", { name: "agency_id", nullable: true, unsigned: true })
  agencyId: string | null;

  @Column("bigint", { name: "site_id", nullable: true, unsigned: true })
  siteId: string | null;

  @Column("bigint", { name: "time_and_attendance_id", unsigned: true })
  timeAndAttendanceId: string;

  @Column("int", { name: "week", nullable: true })
  week: number | null;

  @Column("date", { name: "start_date", nullable: true })
  startDate: string | null;

  @Column("date", { name: "end_date", nullable: true })
  endDate: string | null;

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

  @OneToMany(() => Payroll, (payroll) => payroll.payrollMeta)
  payrolls: Payroll[];

  @ManyToOne(
    () => AgencyDetails,
    (agencyDetails) => agencyDetails.payrollMetas,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(
    () => ClientDetails,
    (clientDetails) => clientDetails.payrollMetas,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.payrollMetas, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Site, (site) => site.payrollMetas, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(
    () => TimeAndAttendance,
    (timeAndAttendance) => timeAndAttendance.payrollMetas,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "time_and_attendance_id", referencedColumnName: "id" }])
  timeAndAttendance: TimeAndAttendance;

  @ManyToOne(() => User, (user) => user.payrollMetas2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(
    () => PayrollSummary,
    (payrollSummary) => payrollSummary.payrollMeta
  )
  payrollSummaries: PayrollSummary[];
}

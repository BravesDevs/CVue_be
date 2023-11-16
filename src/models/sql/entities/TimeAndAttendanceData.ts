import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AgencyDetails } from "./AgencyDetails";
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";
import { Departments } from "./Departments";
import { Region } from "./Region";
import { Shift } from "./Shift";
import { Site } from "./Site";
import { TimeAndAttendance } from "./TimeAndAttendance";
import { Workers } from "./Workers";

@Index("fk_time_and_attendance_data_agency_id_idx", ["agencyId"], {})
@Index("fk_time_and_attendance_data_client_id_idx", ["clientId"], {})
@Index("fk_time_and_attendance_data_created_by_idx", ["createdBy"], {})
@Index("fk_time_and_attendance_data_department_id", ["departmentId"], {})
@Index("fk_time_and_attendance_data_region_id", ["regionId"], {})
@Index("fk_time_and_attendance_data_shift_id", ["shiftId"], {})
@Index("fk_time_and_attendance_data_site_id", ["siteId"], {})
@Index(
  "fk_time_and_attendance_data_time_and_attendance_id_idx",
  ["timeAndAttendanceId"],
  {}
)
@Index("fk_time_and_attendance_data_updated_by_idx", ["updatedBy"], {})
@Index("fk_time_and_attendance_data_worker_id_idx", ["workerId"], {})
@Entity("time_and_attendance_data")
export class TimeAndAttendanceData {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "time_and_attendance_id", unsigned: true })
  timeAndAttendanceId: string;

  @Column("bigint", { name: "agency_id", nullable: true, unsigned: true })
  agencyId: string | null;

  @Column("varchar", { name: "payroll_ref", nullable: true, length: 100 })
  payrollRef: string | null;

  @Column("bigint", { name: "client_id", nullable: true, unsigned: true })
  clientId: string | null;

  @Column("bigint", { name: "worker_id", nullable: true, unsigned: true })
  workerId: string | null;

  @Column("bigint", { name: "department_id", nullable: true, unsigned: true })
  departmentId: string | null;

  @Column("bigint", { name: "shift_id", nullable: true, unsigned: true })
  shiftId: string | null;

  @Column("bigint", { name: "site_id", nullable: true, unsigned: true })
  siteId: string | null;

  @Column("float", {
    name: "weekly_hours",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  weeklyHours: number | null;

  @Column("varchar", { name: "pay_type", nullable: true, length: 45 })
  payType: string | null;

  @Column("date", { name: "start_date", nullable: true })
  startDate: string | null;

  @Column("int", { name: "week", nullable: true })
  week: number | null;

  @Column("bigint", { name: "region_id", nullable: true, unsigned: true })
  regionId: string | null;

  @Column("date", { name: "end_date", nullable: true })
  endDate: string | null;

  @Column("float", {
    name: "day_1",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  day_1: number | null;

  @Column("float", {
    name: "day_2",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  day_2: number | null;

  @Column("float", {
    name: "day_3",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  day_3: number | null;

  @Column("float", {
    name: "day_4",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  day_4: number | null;

  @Column("float", {
    name: "day_5",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  day_5: number | null;

  @Column("float", {
    name: "day_6",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  day_6: number | null;

  @Column("float", {
    name: "day_7",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  day_7: number | null;

  @Column("float", {
    name: "pay_rate",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  payRate: number | null;

  @Column("float", {
    name: "charge_rate",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  chargeRate: number | null;

  @Column("float", {
    name: "standard_pay",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  standardPay: number | null;

  @Column("float", {
    name: "overtime_pay",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  overtimePay: number | null;

  @Column("float", {
    name: "total_charge",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  totalCharge: number | null;

  @Column("float", {
    name: "standard_charge",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  standardCharge: number | null;

  @Column("float", {
    name: "overtime_charge",
    nullable: true,
    precision: 12,
    default: () => "'0'",
  })
  overtimeCharge: number | null;

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

  @ManyToOne(
    () => AgencyDetails,
    (agencyDetails) => agencyDetails.timeAndAttendanceData,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(
    () => ClientDetails,
    (clientDetails) => clientDetails.timeAndAttendanceData,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.timeAndAttendanceData, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(
    () => Departments,
    (departments) => departments.timeAndAttendanceData,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "department_id", referencedColumnName: "id" }])
  department: Departments;

  @ManyToOne(() => Region, (region) => region.timeAndAttendanceData, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "region_id", referencedColumnName: "id" }])
  region: Region;

  @ManyToOne(() => Shift, (shift) => shift.timeAndAttendanceData, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "shift_id", referencedColumnName: "id" }])
  shift: Shift;

  @ManyToOne(() => Site, (site) => site.timeAndAttendanceData, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(
    () => TimeAndAttendance,
    (timeAndAttendance) => timeAndAttendance.timeAndAttendanceData,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "time_and_attendance_id", referencedColumnName: "id" }])
  timeAndAttendance: TimeAndAttendance;

  @ManyToOne(() => User, (user) => user.timeAndAttendanceData2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => Workers, (workers) => workers.timeAndAttendanceData, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "worker_id", referencedColumnName: "id" }])
  worker: Workers;
}

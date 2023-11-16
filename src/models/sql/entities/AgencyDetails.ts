import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AgencyClientAssociation } from "./AgencyClientAssociation";
import { User } from "./User";
import { BookingAssociation } from "./BookingAssociation";
import { Message } from "./Message";
import { Payroll } from "./Payroll";
import { PayrollMeta } from "./PayrollMeta";
import { PayrollSummary } from "./PayrollSummary";
import { SurveyResult } from "./SurveyResult";
import { TimeAndAttendance } from "./TimeAndAttendance";
import { TimeAndAttendanceData } from "./TimeAndAttendanceData";
import { Workers } from "./Workers";

@Index("fk_agency_details_created_by_idx", ["createdBy"], {})
@Index("fk_agency_details_updated_by_idx", ["updatedBy"], {})
@Entity("agency_details")
export class AgencyDetails {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 250 })
  name: string;

  @Column("json", { name: "address", nullable: true })
  address: object | null;

  @Column("varchar", { name: "post_code", nullable: true, length: 45 })
  postCode: string | null;

  @Column("varchar", { name: "city", nullable: true, length: 250 })
  city: string | null;

  @Column("varchar", { name: "country", nullable: true, length: 250 })
  country: string | null;

  @Column("varchar", { name: "resource", nullable: true, length: 50 })
  resource: string | null;

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

  @OneToMany(
    () => AgencyClientAssociation,
    (agencyClientAssociation) => agencyClientAssociation.agency
  )
  agencyClientAssociations: AgencyClientAssociation[];

  @ManyToOne(() => User, (user) => user.agencyDetails, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.agencyDetails2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(
    () => BookingAssociation,
    (bookingAssociation) => bookingAssociation.agency
  )
  bookingAssociations: BookingAssociation[];

  @OneToMany(() => Message, (message) => message.agency)
  messages: Message[];

  @OneToMany(() => Payroll, (payroll) => payroll.agency)
  payrolls: Payroll[];

  @OneToMany(() => PayrollMeta, (payrollMeta) => payrollMeta.agency)
  payrollMetas: PayrollMeta[];

  @OneToMany(() => PayrollSummary, (payrollSummary) => payrollSummary.agency)
  payrollSummaries: PayrollSummary[];

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.agency)
  surveyResults: SurveyResult[];

  @OneToMany(
    () => TimeAndAttendance,
    (timeAndAttendance) => timeAndAttendance.agency
  )
  timeAndAttendances: TimeAndAttendance[];

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.agency
  )
  timeAndAttendanceData: TimeAndAttendanceData[];

  @OneToMany(() => User, (user) => user.agency)
  users: User[];

  @OneToMany(() => Workers, (workers) => workers.agency)
  workers: Workers[];
}

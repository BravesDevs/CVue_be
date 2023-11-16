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
import { Booking } from "./Booking";
import { User } from "./User";
import { Sector } from "./Sector";
import { Departments } from "./Departments";
import { JobAssociation } from "./JobAssociation";
import { Message } from "./Message";
import { Payroll } from "./Payroll";
import { PayrollMeta } from "./PayrollMeta";
import { PayrollSummary } from "./PayrollSummary";
import { RateCard } from "./RateCard";
import { Region } from "./Region";
import { Shift } from "./Shift";
import { Site } from "./Site";
import { SurveyResult } from "./SurveyResult";
import { TimeAndAttendance } from "./TimeAndAttendance";
import { TimeAndAttendanceData } from "./TimeAndAttendanceData";
import { Workers } from "./Workers";

@Index("fk_client_details_created_by_idx", ["createdBy"], {})
@Index("fk_client_details_updated_by_idx", ["updatedBy"], {})
@Index("fk_sector_id_idx", ["sectorId"], {})
@Entity("client_details")
export class ClientDetails {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 250 })
  name: string;

  @Column("bigint", { name: "sector_id", nullable: true, unsigned: true })
  sectorId: string | null;

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
    (agencyClientAssociation) => agencyClientAssociation.client
  )
  agencyClientAssociations: AgencyClientAssociation[];

  @OneToMany(() => Booking, (booking) => booking.client)
  bookings: Booking[];

  @ManyToOne(() => User, (user) => user.clientDetails, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Sector, (sector) => sector.clientDetails, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "sector_id", referencedColumnName: "id" }])
  sector: Sector;

  @ManyToOne(() => User, (user) => user.clientDetails2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(() => Departments, (departments) => departments.client)
  departments: Departments[];

  @OneToMany(() => JobAssociation, (jobAssociation) => jobAssociation.client)
  jobAssociations: JobAssociation[];

  @OneToMany(() => Message, (message) => message.client)
  messages: Message[];

  @OneToMany(() => Payroll, (payroll) => payroll.client)
  payrolls: Payroll[];

  @OneToMany(() => PayrollMeta, (payrollMeta) => payrollMeta.client)
  payrollMetas: PayrollMeta[];

  @OneToMany(() => PayrollSummary, (payrollSummary) => payrollSummary.client)
  payrollSummaries: PayrollSummary[];

  @OneToMany(() => RateCard, (rateCard) => rateCard.client)
  rateCards: RateCard[];

  @OneToMany(() => Region, (region) => region.client)
  regions: Region[];

  @OneToMany(() => Shift, (shift) => shift.client)
  shifts: Shift[];

  @OneToMany(() => Site, (site) => site.client)
  sites: Site[];

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.client)
  surveyResults: SurveyResult[];

  @OneToMany(
    () => TimeAndAttendance,
    (timeAndAttendance) => timeAndAttendance.client
  )
  timeAndAttendances: TimeAndAttendance[];

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.client
  )
  timeAndAttendanceData: TimeAndAttendanceData[];

  @OneToMany(() => User, (user) => user.client)
  users: User[];

  @OneToMany(() => Workers, (workers) => workers.client)
  workers: Workers[];
}

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
import { JobAssociation } from "./JobAssociation";
import { Message } from "./Message";
import { Payroll } from "./Payroll";
import { PayrollMeta } from "./PayrollMeta";
import { PayrollSummary } from "./PayrollSummary";
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";
import { Region } from "./Region";
import { SurveyResult } from "./SurveyResult";
import { TimeAndAttendance } from "./TimeAndAttendance";
import { TimeAndAttendanceData } from "./TimeAndAttendanceData";
import { UserSiteAssociation } from "./UserSiteAssociation";

@Index("FK_site_client_details", ["clientId"], {})
@Index("fk_region_id_idx", ["regionId"], {})
@Index("fk_site_created_by_idx", ["createdBy"], {})
@Index("fk_site_updated_by_idx", ["updatedBy"], {})
@Entity("site")
export class Site {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 250 })
  name: string;

  @Column("bigint", { name: "region_id", nullable: true, unsigned: true })
  regionId: string | null;

  @Column("bigint", { name: "client_id", nullable: true, unsigned: true })
  clientId: string | null;

  @Column("json", { name: "address", nullable: true })
  address: object | null;

  @Column("varchar", { name: "post_code", nullable: true, length: 45 })
  postCode: string | null;

  @Column("varchar", { name: "city", nullable: true, length: 250 })
  city: string | null;

  @Column("varchar", { name: "country", nullable: true, length: 250 })
  country: string | null;

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

  @OneToMany(() => Booking, (booking) => booking.site)
  bookings: Booking[];

  @OneToMany(() => JobAssociation, (jobAssociation) => jobAssociation.site)
  jobAssociations: JobAssociation[];

  @OneToMany(() => Message, (message) => message.site)
  messages: Message[];

  @OneToMany(() => Payroll, (payroll) => payroll.site)
  payrolls: Payroll[];

  @OneToMany(() => PayrollMeta, (payrollMeta) => payrollMeta.site)
  payrollMetas: PayrollMeta[];

  @OneToMany(() => PayrollSummary, (payrollSummary) => payrollSummary.site)
  payrollSummaries: PayrollSummary[];

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.sites, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.sites, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Region, (region) => region.sites, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "region_id", referencedColumnName: "id" }])
  region: Region;

  @ManyToOne(() => User, (user) => user.sites2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.site)
  surveyResults: SurveyResult[];

  @OneToMany(
    () => TimeAndAttendance,
    (timeAndAttendance) => timeAndAttendance.site
  )
  timeAndAttendances: TimeAndAttendance[];

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.site
  )
  timeAndAttendanceData: TimeAndAttendanceData[];

  @OneToMany(
    () => UserSiteAssociation,
    (userSiteAssociation) => userSiteAssociation.site
  )
  userSiteAssociations: UserSiteAssociation[];
}

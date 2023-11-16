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
import { AgencyClientAssociation } from "./AgencyClientAssociation";
import { AgencyDetails } from "./AgencyDetails";
import { Booking } from "./Booking";
import { BookingAssociation } from "./BookingAssociation";
import { ClientDetails } from "./ClientDetails";
import { Departments } from "./Departments";
import { Features } from "./Features";
import { Job } from "./Job";
import { JobAssociation } from "./JobAssociation";
import { Message } from "./Message";
import { MessageReceiverWorkers } from "./MessageReceiverWorkers";
import { Payroll } from "./Payroll";
import { PayrollMeta } from "./PayrollMeta";
import { PayrollSummary } from "./PayrollSummary";
import { Permissions } from "./Permissions";
import { RateCard } from "./RateCard";
import { Region } from "./Region";
import { ResetPasswordToken } from "./ResetPasswordToken";
import { Sector } from "./Sector";
import { Shift } from "./Shift";
import { Site } from "./Site";
import { Survey } from "./Survey";
import { SurveyAnswer } from "./SurveyAnswer";
import { SurveyQuestions } from "./SurveyQuestions";
import { SurveyResult } from "./SurveyResult";
import { Template } from "./Template";
import { TimeAndAttendance } from "./TimeAndAttendance";
import { TimeAndAttendanceData } from "./TimeAndAttendanceData";
import { UserType } from "./UserType";
import { UserSiteAssociation } from "./UserSiteAssociation";
import { WorkerTraining } from "./WorkerTraining";
import { Workers } from "./Workers";

@Index("email_UNIQUE", ["email"], { unique: true })
@Index("country_code", ["countryCode"], {})
@Index("email", ["email"], {})
@Index("fk_agency_id_idx", ["agencyId"], {})
@Index("fk_client_id_idx", ["clientId"], {})
@Index("fk_user_created_by_idx", ["createdBy"], {})
@Index("fk_user_type_id_idx", ["userTypeId"], {})
@Index("fk_user_updated_by_idx", ["updatedBy"], {})
@Index("mobile", ["mobile"], {})
@Entity("user")
export class User {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_type_id", unsigned: true })
  userTypeId: string;

  @Column("bigint", { name: "agency_id", nullable: true, unsigned: true })
  agencyId: string | null;

  @Column("bigint", { name: "client_id", nullable: true, unsigned: true })
  clientId: string | null;

  @Column("varchar", {
    name: "national_insurance_number",
    nullable: true,
    length: 250,
  })
  nationalInsuranceNumber: string | null;

  @Column("varchar", { name: "name", nullable: true, length: 250 })
  name: string | null;

  @Column("varchar", { name: "email", unique: true, length: 250 })
  email: string;

  @Column("varchar", { name: "country_code", nullable: true, length: 45 })
  countryCode: string | null;

  @Column("varchar", { name: "mobile", nullable: true, length: 45 })
  mobile: string | null;

  @Column("text", { name: "password", nullable: true })
  password: string | null;

  @Column("tinyint", {
    name: "is_verified",
    nullable: true,
    default: () => "'0'",
  })
  isVerified: number | null;

  @Column("json", { name: "documents", nullable: true })
  documents: object | null;

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
    (agencyClientAssociation) => agencyClientAssociation.createdBy2
  )
  agencyClientAssociations: AgencyClientAssociation[];

  @OneToMany(
    () => AgencyClientAssociation,
    (agencyClientAssociation) => agencyClientAssociation.updatedBy2
  )
  agencyClientAssociations2: AgencyClientAssociation[];

  @OneToMany(() => AgencyDetails, (agencyDetails) => agencyDetails.createdBy2)
  agencyDetails: AgencyDetails[];

  @OneToMany(() => AgencyDetails, (agencyDetails) => agencyDetails.updatedBy2)
  agencyDetails2: AgencyDetails[];

  @OneToMany(() => Booking, (booking) => booking.createdBy2)
  bookings: Booking[];

  @OneToMany(() => Booking, (booking) => booking.updatedBy2)
  bookings2: Booking[];

  @OneToMany(
    () => BookingAssociation,
    (bookingAssociation) => bookingAssociation.createdBy2
  )
  bookingAssociations: BookingAssociation[];

  @OneToMany(
    () => BookingAssociation,
    (bookingAssociation) => bookingAssociation.updatedBy2
  )
  bookingAssociations2: BookingAssociation[];

  @OneToMany(() => ClientDetails, (clientDetails) => clientDetails.createdBy2)
  clientDetails: ClientDetails[];

  @OneToMany(() => ClientDetails, (clientDetails) => clientDetails.updatedBy2)
  clientDetails2: ClientDetails[];

  @OneToMany(() => Departments, (departments) => departments.createdBy2)
  departments: Departments[];

  @OneToMany(() => Departments, (departments) => departments.updatedBy2)
  departments2: Departments[];

  @OneToMany(() => Features, (features) => features.createdBy2)
  features: Features[];

  @OneToMany(() => Features, (features) => features.updatedBy2)
  features2: Features[];

  @OneToMany(() => Job, (job) => job.createdBy2)
  jobs: Job[];

  @OneToMany(() => Job, (job) => job.updatedBy2)
  jobs2: Job[];

  @OneToMany(
    () => JobAssociation,
    (jobAssociation) => jobAssociation.createdBy2
  )
  jobAssociations: JobAssociation[];

  @OneToMany(
    () => JobAssociation,
    (jobAssociation) => jobAssociation.updatedBy2
  )
  jobAssociations2: JobAssociation[];

  @OneToMany(() => Message, (message) => message.createdBy2)
  messages: Message[];

  @OneToMany(() => Message, (message) => message.sendBy2)
  messages2: Message[];

  @OneToMany(() => Message, (message) => message.updatedBy2)
  messages3: Message[];

  @OneToMany(
    () => MessageReceiverWorkers,
    (messageReceiverWorkers) => messageReceiverWorkers.createdBy2
  )
  messageReceiverWorkers: MessageReceiverWorkers[];

  @OneToMany(
    () => MessageReceiverWorkers,
    (messageReceiverWorkers) => messageReceiverWorkers.updatedBy2
  )
  messageReceiverWorkers2: MessageReceiverWorkers[];

  @OneToMany(() => Payroll, (payroll) => payroll.createdBy2)
  payrolls: Payroll[];

  @OneToMany(() => Payroll, (payroll) => payroll.updatedBy2)
  payrolls2: Payroll[];

  @OneToMany(() => PayrollMeta, (payrollMeta) => payrollMeta.createdBy2)
  payrollMetas: PayrollMeta[];

  @OneToMany(() => PayrollMeta, (payrollMeta) => payrollMeta.updatedBy2)
  payrollMetas2: PayrollMeta[];

  @OneToMany(
    () => PayrollSummary,
    (payrollSummary) => payrollSummary.createdBy2
  )
  payrollSummaries: PayrollSummary[];

  @OneToMany(
    () => PayrollSummary,
    (payrollSummary) => payrollSummary.updatedBy2
  )
  payrollSummaries2: PayrollSummary[];

  @OneToMany(() => Permissions, (permissions) => permissions.createdBy2)
  permissions: Permissions[];

  @OneToMany(() => Permissions, (permissions) => permissions.updatedBy2)
  permissions2: Permissions[];

  @OneToMany(() => RateCard, (rateCard) => rateCard.createdBy2)
  rateCards: RateCard[];

  @OneToMany(() => RateCard, (rateCard) => rateCard.updatedBy2)
  rateCards2: RateCard[];

  @OneToOne(() => Region, (region) => region.agencyRegionAdmin)
  region2: Region;

  @OneToOne(() => Region, (region) => region.admin)
  region: Region;

  @OneToMany(() => Region, (region) => region.createdBy2)
  regions: Region[];

  @OneToMany(() => Region, (region) => region.updatedBy2)
  regions2: Region[];

  @OneToMany(
    () => ResetPasswordToken,
    (resetPasswordToken) => resetPasswordToken.user
  )
  resetPasswordTokens: ResetPasswordToken[];

  @OneToMany(() => Sector, (sector) => sector.createdBy2)
  sectors: Sector[];

  @OneToMany(() => Sector, (sector) => sector.updatedBy2)
  sectors2: Sector[];

  @OneToMany(() => Shift, (shift) => shift.createdBy2)
  shifts: Shift[];

  @OneToMany(() => Shift, (shift) => shift.updatedBy2)
  shifts2: Shift[];

  @OneToMany(() => Site, (site) => site.createdBy2)
  sites: Site[];

  @OneToMany(() => Site, (site) => site.updatedBy2)
  sites2: Site[];

  @OneToMany(() => Survey, (survey) => survey.createdBy2)
  surveys: Survey[];

  @OneToMany(() => Survey, (survey) => survey.updatedBy2)
  surveys2: Survey[];

  @OneToMany(() => SurveyAnswer, (surveyAnswer) => surveyAnswer.createdBy2)
  surveyAnswers: SurveyAnswer[];

  @OneToMany(() => SurveyAnswer, (surveyAnswer) => surveyAnswer.updatedBy2)
  surveyAnswers2: SurveyAnswer[];

  @OneToMany(
    () => SurveyQuestions,
    (surveyQuestions) => surveyQuestions.createdBy2
  )
  surveyQuestions: SurveyQuestions[];

  @OneToMany(
    () => SurveyQuestions,
    (surveyQuestions) => surveyQuestions.updatedBy2
  )
  surveyQuestions2: SurveyQuestions[];

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.createdBy2)
  surveyResults: SurveyResult[];

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.updatedBy2)
  surveyResults2: SurveyResult[];

  @OneToMany(() => Template, (template) => template.createdBy2)
  templates: Template[];

  @OneToMany(() => Template, (template) => template.modifiedBy2)
  templates2: Template[];

  @OneToMany(
    () => TimeAndAttendance,
    (timeAndAttendance) => timeAndAttendance.createdBy2
  )
  timeAndAttendances: TimeAndAttendance[];

  @OneToMany(
    () => TimeAndAttendance,
    (timeAndAttendance) => timeAndAttendance.updatedBy2
  )
  timeAndAttendances2: TimeAndAttendance[];

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.createdBy2
  )
  timeAndAttendanceData: TimeAndAttendanceData[];

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.updatedBy2
  )
  timeAndAttendanceData2: TimeAndAttendanceData[];

  @ManyToOne(() => AgencyDetails, (agencyDetails) => agencyDetails.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @OneToMany(() => User, (user) => user.createdBy2)
  users: User[];

  @ManyToOne(() => UserType, (userType) => userType.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_type_id", referencedColumnName: "id" }])
  userType_2: UserType;

  @ManyToOne(() => User, (user) => user.users2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(() => User, (user) => user.updatedBy2)
  users2: User[];

  @OneToMany(
    () => UserSiteAssociation,
    (userSiteAssociation) => userSiteAssociation.user
  )
  userSiteAssociations: UserSiteAssociation[];

  @OneToMany(
    () => UserSiteAssociation,
    (userSiteAssociation) => userSiteAssociation.createdBy2
  )
  userSiteAssociations2: UserSiteAssociation[];

  @OneToMany(() => UserType, (userType) => userType.createdBy2)
  userTypes: UserType[];

  @OneToMany(() => UserType, (userType) => userType.updatedBy2)
  userTypes2: UserType[];

  @OneToMany(
    () => WorkerTraining,
    (workerTraining) => workerTraining.createdBy2
  )
  workerTrainings: WorkerTraining[];

  @OneToMany(
    () => WorkerTraining,
    (workerTraining) => workerTraining.updatedBy2
  )
  workerTrainings2: WorkerTraining[];

  @OneToMany(() => Workers, (workers) => workers.createdBy2)
  workers: Workers[];

  @OneToMany(() => Workers, (workers) => workers.updatedBy2)
  workers2: Workers[];

  @OneToMany(() => Workers, (workers) => workers.user)
  workers3: Workers[];
}

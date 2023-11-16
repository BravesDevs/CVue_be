import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MessageReceiverWorkers } from "./MessageReceiverWorkers";
import { Payroll } from "./Payroll";
import { SurveyResult } from "./SurveyResult";
import { TimeAndAttendanceData } from "./TimeAndAttendanceData";
import { WorkerTraining } from "./WorkerTraining";
import { AgencyDetails } from "./AgencyDetails";
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";
import { Job } from "./Job";

@Index("fk_agency_id_idx", ["agencyId"], {})
@Index("fk_workers_client_id_idx", ["clientId"], {})
@Index("fk_workers_created_by_idx", ["createdBy"], {})
@Index("fk_workers_job_id_idx", ["jobId"], {})
@Index("fk_workers_updated_by_idx", ["updatedBy"], {})
@Index("workers_user_id_fk", ["userId"], {})
@Entity("workers")
export class Workers {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "user_id", nullable: true, unsigned: true })
  userId: string | null;

  @Column("varchar", { name: "first_name", nullable: true, length: 250 })
  firstName: string | null;

  @Column("varchar", { name: "last_name", nullable: true, length: 250 })
  lastName: string | null;

  @Column("enum", {
    name: "type",
    enum: ["TEMPORARY", "PERMANENT"],
  })
  type: "TEMPORARY" | "PERMANENT";

  @Column("varchar", { name: "country_code", nullable: true, length: 45 })
  countryCode: string | null;

  @Column("varchar", { name: "mobile", nullable: true, length: 45 })
  mobile: string | null;

  @Column("text", { name: "device_token", nullable: true })
  deviceToken: string | null;

  @Column("varchar", {
    name: "national_insurance_number",
    nullable: true,
    length: 250,
  })
  nationalInsuranceNumber: string | null;

  @Column("varchar", { name: "payroll_ref", nullable: true, length: 250 })
  payrollRef: string | null;

  @Column("date", { name: "date_of_birth", nullable: true })
  dateOfBirth: string | null;

  @Column("varchar", { name: "post_code", nullable: true, length: 45 })
  postCode: string | null;

  @Column("date", { name: "start_date", nullable: true })
  startDate: string | null;

  @Column("varchar", { name: "nationality", nullable: true, length: 250 })
  nationality: string | null;

  @Column("varchar", { name: "orientation", nullable: true, length: 250 })
  orientation: string | null;

  @Column("bigint", { name: "agency_id", nullable: true, unsigned: true })
  agencyId: string | null;

  @Column("bigint", { name: "client_id", nullable: true, unsigned: true })
  clientId: string | null;

  @Column("bigint", { name: "job_id", nullable: true, unsigned: true })
  jobId: string | null;

  @Column("tinyint", { name: "is_active", width: 1, default: () => "'1'" })
  isActive: boolean;

  @Column("datetime", { name: "in_actived_at", nullable: true })
  inActivedAt: Date | null;

  @Column("json", { name: "appreciation", nullable: true })
  appreciation: object | null;

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

  @Column("varchar", { name: "employee_id", nullable: true, length: 250 })
  employeeId: string | null;

  @OneToMany(
    () => MessageReceiverWorkers,
    (messageReceiverWorkers) => messageReceiverWorkers.worker
  )
  messageReceiverWorkers: MessageReceiverWorkers[];

  @OneToMany(() => Payroll, (payroll) => payroll.worker)
  payrolls: Payroll[];

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.worker)
  surveyResults: SurveyResult[];

  @OneToMany(
    () => TimeAndAttendanceData,
    (timeAndAttendanceData) => timeAndAttendanceData.worker
  )
  timeAndAttendanceData: TimeAndAttendanceData[];

  @OneToMany(() => WorkerTraining, (workerTraining) => workerTraining.worker)
  workerTrainings: WorkerTraining[];

  @ManyToOne(() => AgencyDetails, (agencyDetails) => agencyDetails.workers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.workers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.workers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Job, (job) => job.workers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "job_id", referencedColumnName: "id" }])
  job: Job;

  @ManyToOne(() => User, (user) => user.workers2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => User, (user) => user.workers3, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}

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
import { PayrollMeta } from "./PayrollMeta";
import { Site } from "./Site";
import { Workers } from "./Workers";

@Index("fk_payroll_agency_id", ["agencyId"], {})
@Index("fk_payroll_client_id", ["clientId"], {})
@Index("fk_payroll_created_by", ["createdBy"], {})
@Index("fk_payroll_site_id", ["siteId"], {})
@Index("fk_payroll_payroll_meta_id", ["payrollMetaId"], {})
@Index("fk_payroll_updated_by", ["updatedBy"], {})
@Index("fk_payroll_worker_id", ["workerId"], {})
@Entity("payroll")
export class Payroll {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "payroll_meta_id", unsigned: true })
  payrollMetaId: string;

  @Column("bigint", { name: "worker_id", unsigned: true })
  workerId: string;

  @Column("bigint", { name: "client_id", unsigned: true })
  clientId: string;

  @Column("bigint", { name: "site_id", nullable: true, unsigned: true })
  siteId: string | null;

  @Column("bigint", { name: "agency_id", unsigned: true })
  agencyId: string;

  @Column("float", { name: "total_hours", nullable: true, precision: 12 })
  totalHours: number | null;

  @Column("float", { name: "total_charge", precision: 12 })
  totalCharge: number;

  @Column("float", { name: "total_pay", precision: 12 })
  totalPay: number;

  @Column("float", { name: "national_insurance", precision: 12 })
  nationalInsurance: number;

  @Column("float", { name: "holiday", precision: 12 })
  holiday: number;

  @Column("float", { name: "apprenticeship_levy", precision: 12 })
  apprenticeshipLevy: number;

  @Column("float", { name: "discount", nullable: true, precision: 12 })
  discount: number | null;

  @Column("float", { name: "pension", precision: 12 })
  pension: number;

  @Column("float", {
    name: "actual_cost_to_employ",
    nullable: true,
    precision: 12,
  })
  actualCostToEmploy: number | null;

  @Column("float", {
    name: "total_agency_margin",
    nullable: true,
    precision: 12,
  })
  totalAgencyMargin: number | null;

  @Column("float", { name: "actual_margin", nullable: true, precision: 12 })
  actualMargin: number | null;

  @Column("float", { name: "rate_card_margin", nullable: true, precision: 12 })
  rateCardMargin: number | null;

  @Column("float", { name: "credit_per_hour", nullable: true, precision: 12 })
  creditPerHour: number | null;

  @Column("float", { name: "clearvue_savings", precision: 12 })
  clearvueSavings: number;

  @Column("date", { name: "start_date", nullable: true })
  startDate: string | null;

  @Column("date", { name: "end_date", nullable: true })
  endDate: string | null;

  @Column("int", { name: "week", nullable: true })
  week: number | null;

  @Column("bigint", { name: "created_by", unsigned: true })
  createdBy: string;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("bigint", { name: "updated_by", nullable: true, unsigned: true })
  updatedBy: string | null;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @ManyToOne(() => AgencyDetails, (agencyDetails) => agencyDetails.payrolls, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.payrolls, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.payrolls, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => PayrollMeta, (payrollMeta) => payrollMeta.payrolls, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "payroll_meta_id", referencedColumnName: "id" }])
  payrollMeta: PayrollMeta;

  @ManyToOne(() => Site, (site) => site.payrolls, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(() => User, (user) => user.payrolls2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => Workers, (workers) => workers.payrolls, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "worker_id", referencedColumnName: "id" }])
  worker: Workers;
}

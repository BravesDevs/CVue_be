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

@Index("fk_payroll_summary_agency_id", ["agencyId"], {})
@Index("fk_payroll_summary_client_id", ["clientId"], {})
@Index("fk_payroll_summary_created_by", ["createdBy"], {})
@Index("fk_payroll_summary_payroll_meta_id", ["payrollMetaId"], {})
@Index("fk_payroll_summary_site_id", ["siteId"], {})
@Index("fk_payroll_summary_updated_by", ["updatedBy"], {})
@Entity("payroll_summary")
export class PayrollSummary {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "payroll_meta_id", unsigned: true })
  payrollMetaId: string;

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

  @ManyToOne(
    () => AgencyDetails,
    (agencyDetails) => agencyDetails.payrollSummaries,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(
    () => ClientDetails,
    (clientDetails) => clientDetails.payrollSummaries,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.payrollSummaries, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => PayrollMeta, (payrollMeta) => payrollMeta.payrollSummaries, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "payroll_meta_id", referencedColumnName: "id" }])
  payrollMeta: PayrollMeta;

  @ManyToOne(() => Site, (site) => site.payrollSummaries, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(() => User, (user) => user.payrollSummaries2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;
}

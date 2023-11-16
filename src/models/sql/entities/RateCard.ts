import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";

@Index("fk_rate_card_client_id", ["clientId"], {})
@Index("fk_rate_card_created_by_idx", ["createdBy"], {})
@Index("fk_rate_card_updated_by_idx", ["updatedBy"], {})
@Entity("rate_card")
export class RateCard {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", nullable: true, length: 250 })
  name: string | null;

  @Column("varchar", { name: "currency", length: 250 })
  currency: string;

  @Column("float", { name: "pay_per_hour", nullable: true, precision: 12 })
  payPerHour: number | null;

  @Column("float", { name: "insurance_rate", nullable: true, precision: 12 })
  insuranceRate: number | null;

  @Column("float", { name: "holiday_pay_rate", nullable: true, precision: 12 })
  holidayPayRate: number | null;

  @Column("float", {
    name: "apprenticeship_rate",
    nullable: true,
    precision: 12,
  })
  apprenticeshipRate: number | null;

  @Column("float", { name: "pension_rate", nullable: true, precision: 12 })
  pensionRate: number | null;

  @Column("float", { name: "full_time_hours", precision: 12 })
  fullTimeHours: number;

  @Column("float", { name: "overtime_pay", nullable: true, precision: 12 })
  overtimePay: number | null;

  @Column("float", {
    name: "pay_per_hour_dynamic",
    nullable: true,
    precision: 12,
  })
  payPerHourDynamic: number | null;

  @Column("float", {
    name: "insurance_rate_dynamic",
    nullable: true,
    precision: 12,
  })
  insuranceRateDynamic: number | null;

  @Column("float", {
    name: "full_time_hours_dynamic",
    nullable: true,
    precision: 12,
  })
  fullTimeHoursDynamic: number | null;

  @Column("float", {
    name: "overtime_pay_dynamic",
    nullable: true,
    precision: 12,
  })
  overtimePayDynamic: number | null;

  @Column("float", {
    name: "holiday_pay_rate_dynamic",
    nullable: true,
    precision: 12,
  })
  holidayPayRateDynamic: number | null;

  @Column("bigint", { name: "client_id", nullable: true, unsigned: true })
  clientId: string | null;

  @Column("float", {
    name: "apprenticeship_rate_dynamic",
    nullable: true,
    precision: 12,
  })
  apprenticeshipRateDynamic: number | null;

  @Column("float", {
    name: "pension_rate_dynamic",
    nullable: true,
    precision: 12,
  })
  pensionRateDynamic: number | null;

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

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.rateCards, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.rateCards, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.rateCards2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;
}

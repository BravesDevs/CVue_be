import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Shift } from "./Shift";
import { JobAssociation } from "./JobAssociation";
import { Workers } from "./Workers";

@Index("fk_job_created_by_idx", ["createdBy"], {})
@Index("fk_job_shift_id_idx", ["shiftId"], {})
@Index("fk_job_updated_by_idx", ["updatedBy"], {})
@Entity("job")
export class Job {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 250 })
  name: string;

  @Column("enum", { name: "type", nullable: true, enum: ["1", "2", "3"] })
  type: "1" | "2" | "3" | null;

  @Column("bigint", { name: "shift_id", nullable: true, unsigned: true })
  shiftId: string | null;

  @Column("decimal", {
    name: "hours_per_week",
    nullable: true,
    precision: 20,
    scale: 2,
  })
  hoursPerWeek: string | null;

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

  @ManyToOne(() => User, (user) => user.jobs, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Shift, (shift) => shift.jobs, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "shift_id", referencedColumnName: "id" }])
  shift: Shift;

  @ManyToOne(() => User, (user) => user.jobs2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(() => JobAssociation, (jobAssociation) => jobAssociation.job)
  jobAssociations: JobAssociation[];

  @OneToMany(() => Workers, (workers) => workers.job)
  workers: Workers[];
}

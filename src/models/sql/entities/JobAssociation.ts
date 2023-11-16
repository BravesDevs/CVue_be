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
import { Departments } from "./Departments";
import { Job } from "./Job";
import { Site } from "./Site";

@Index("fk_job_association_client_agency_association_id_idx", ["clientId"], {})
@Index("fk_job_association_created_by_id_idx", ["createdBy"], {})
@Index("fk_job_association_department_id_idx", ["departmentId"], {})
@Index("fk_job_association_job_id_idx", ["jobId"], {})
@Index("fk_job_association_site_id_idx", ["siteId"], {})
@Index("fk_job_association_updated_by_idx", ["updatedBy"], {})
@Entity("job_association")
export class JobAssociation {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "job_id", unsigned: true })
  jobId: string;

  @Column("bigint", { name: "site_id", unsigned: true })
  siteId: string;

  @Column("bigint", { name: "department_id", unsigned: true })
  departmentId: string;

  @Column("bigint", { name: "client_id", nullable: true, unsigned: true })
  clientId: string | null;

  @Column("bigint", { name: "created_by", unsigned: true })
  createdBy: string;

  @Column("bigint", { name: "updated_by", unsigned: true })
  updatedBy: string;

  @Column("datetime", { name: "created_at" })
  createdAt: Date;

  @Column("datetime", { name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(
    () => ClientDetails,
    (clientDetails) => clientDetails.jobAssociations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.jobAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Departments, (departments) => departments.jobAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "department_id", referencedColumnName: "id" }])
  department: Departments;

  @ManyToOne(() => Job, (job) => job.jobAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "job_id", referencedColumnName: "id" }])
  job: Job;

  @ManyToOne(() => Site, (site) => site.jobAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(() => User, (user) => user.jobAssociations2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;
}

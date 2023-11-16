import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AgencyDetails } from "./AgencyDetails";
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";
import { Site } from "./Site";
import { MessageReceiverWorkers } from "./MessageReceiverWorkers";
import { WorkerTraining } from "./WorkerTraining";

@Index("fk_message_send_by_idx", ["sendBy"], {})
@Index("fk_message_created_by_idx", ["createdBy"], {})
@Index("fk_message_modified_by_idx", ["updatedBy"], {})
@Index("fk_message_name_idx", ["name"], {})
@Index("fk_message_type_idx", ["type"], {})
@Index("fk_message_agency_id", ["agencyId"], {})
@Index("fk_message_client_id", ["clientId"], {})
@Index("fk_message_site_id", ["siteId"], {})
@Entity("message")
export class Message {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", length: 750 })
  name: string;

  @Column("varchar", { name: "title", length: 750 })
  title: string;

  @Column("enum", {
    name: "type",
    enum: ["GENERAL", "KUDOS", "AWARD", "REWARD", "TRAINING", "BADGE", "SYSTEM", "SYSTEM_DEFAULT"],
  })
  type: "GENERAL" | "KUDOS" | "AWARD" | "REWARD" | "TRAINING" | "BADGE" | "SYSTEM" | "SYSTEM_DEFAULT";

  @Column("varchar", { name: "from", length: 250 })
  from: string;

  @Column("bigint", { name: "client_id", nullable: true, unsigned: true })
  clientId: string | null;

  @Column("bigint", { name: "site_id", nullable: true, unsigned: true })
  siteId: string | null;

  @Column("bigint", { name: "agency_id", nullable: true, unsigned: true })
  agencyId: string | null;

  @Column("varchar", { name: "label", nullable: true, length: 250 })
  label: string | null;

  @Column("json", { name: "body", nullable: true })
  body: object | null;

  @Column("json", { name: "receiver" })
  receiver: object;

  @Column("bigint", { name: "send_by", unsigned: true })
  sendBy: string;

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

  @ManyToOne(() => AgencyDetails, (agencyDetails) => agencyDetails.messages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(() => ClientDetails, (clientDetails) => clientDetails.messages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.messages2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "send_by", referencedColumnName: "id" }])
  sendBy2: User;

  @ManyToOne(() => Site, (site) => site.messages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(() => User, (user) => user.messages3, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(
    () => MessageReceiverWorkers,
    (messageReceiverWorkers) => messageReceiverWorkers.message
  )
  messageReceiverWorkers: MessageReceiverWorkers[];

  @OneToMany(() => WorkerTraining, (workerTraining) => workerTraining.message)
  workerTrainings: WorkerTraining[];
}

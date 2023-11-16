import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";
import { Workers } from "./Workers";

@Index("fk_worker_training_created_by_idx", ["createdBy"], {})
@Index("fk_worker_training_updated_by_idx", ["updatedBy"], {})
@Index("fk_worker_training_worker_idx", ["workerId"], {})
@Index("fk_worker_training_message_idx", ["messageId"], {})
@Entity("worker_training")
export class WorkerTraining {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "message_id", unsigned: true })
  messageId: string;

  @Column("bigint", { name: "worker_id", unsigned: true })
  workerId: string;

  @Column("tinyint", {
    name: "is_training_completed",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isTrainingCompleted: boolean | null;

  @Column("datetime", { name: "training_completed_at", nullable: true })
  trainingCompletedAt: Date | null;

  @Column("tinyint", {
    name: "require_more_training",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  requireMoreTraining: boolean | null;

  @Column("datetime", { name: "require_training_updated_at", nullable: true })
  requireTrainingUpdatedAt: Date | null;

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

  @ManyToOne(() => User, (user) => user.workerTrainings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Message, (message) => message.workerTrainings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "message_id", referencedColumnName: "id" }])
  message: Message;

  @ManyToOne(() => User, (user) => user.workerTrainings2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => Workers, (workers) => workers.workerTrainings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "worker_id", referencedColumnName: "id" }])
  worker: Workers;
}

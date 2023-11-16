import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Message } from "./Message";
import { User } from "./User";
import { Workers } from "./Workers";

@Index("fk_message_receiver_workers_created_by_idx", ["createdBy"], {})
@Index("fk_message_receiver_workers_modified_by_idx", ["updatedBy"], {})
@Index("idx_message_receiver_workers_worker_id", ["workerId"], {})
@Index("idx_message_receiver_message_id", ["messageId"], {})
@Entity("message_receiver_workers")
export class MessageReceiverWorkers {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "message_id", unsigned: true })
  messageId: string;

  @Column("bigint", { name: "worker_id", unsigned: true })
  workerId: string;

  @Column("tinyint", {
    name: "is_message_read",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isMessageRead: boolean | null;

  @Column("datetime", { name: "message_read_at", nullable: true })
  messageReadAt: Date | null;

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

  @ManyToOne(() => Message, (message) => message.messageReceiverWorkers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "message_id", referencedColumnName: "id" }])
  message: Message;

  @ManyToOne(() => User, (user) => user.messageReceiverWorkers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.messageReceiverWorkers2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => Workers, (workers) => workers.messageReceiverWorkers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "worker_id", referencedColumnName: "id" }])
  worker: Workers;
}

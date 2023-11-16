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

@Index("fk_agency_client_association_agency_id_idx", ["agencyId"], {})
@Index("fk_agency_client_association_client_id_idx", ["clientId"], {})
@Index("fk_agency_client_association_created_by_idx", ["createdBy"], {})
@Index("fk_agency_client_association_updated_by_idx", ["updatedBy"], {})
@Entity("agency_client_association")
export class AgencyClientAssociation {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("float", { name: "margin", precision: 12 })
  margin: number;

  @Column("bigint", { name: "agency_id", unsigned: true })
  agencyId: string;

  @Column("bigint", { name: "client_id", unsigned: true })
  clientId: string;

  @Column("varchar", { name: "currency", nullable: true, length: 50 })
  currency: string | null;

  @Column("bigint", { name: "created_by", unsigned: true })
  createdBy: string;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("bigint", { name: "updated_by", unsigned: true })
  updatedBy: string;

  @Column("datetime", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(
    () => AgencyDetails,
    (agencyDetails) => agencyDetails.agencyClientAssociations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(
    () => ClientDetails,
    (clientDetails) => clientDetails.agencyClientAssociations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.agencyClientAssociations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.agencyClientAssociations2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;
}

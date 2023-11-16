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
import { SurveyQuestions } from "./SurveyQuestions";
import { SurveyResult } from "./SurveyResult";

@Index("fk_survey_created_by", ["createdBy"], {})
@Index("fk_survey_updated_by", ["updatedBy"], {})
@Entity("survey")
export class Survey {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "name", nullable: true, length: 250 })
  name: string | null;

  @Column("int", { name: "triggered_week", nullable: true })
  triggeredWeek: number | null;

  @Column("tinyint", { name: "is_visible", nullable: true, width: 1 })
  isVisible: boolean | null;

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

  @ManyToOne(() => User, (user) => user.surveys, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => User, (user) => user.surveys2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(() => SurveyQuestions, (surveyQuestions) => surveyQuestions.survey)
  surveyQuestions: SurveyQuestions[];

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.survey)
  surveyResults: SurveyResult[];
}

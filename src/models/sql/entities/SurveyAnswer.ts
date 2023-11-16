import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { SurveyResult } from "./SurveyResult";

@Index("fk_survey_answer_created_by", ["createdBy"], {})
@Index("fk_survey_answer_result_id", ["resultId"], {})
@Index("fk_survey_answer_updated_by", ["updatedBy"], {})
@Entity("survey_answer")
export class SurveyAnswer {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "result_id", unsigned: true })
  resultId: string;

  @Column("varchar", { name: "answer", nullable: true })
  answer: string;

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

  @ManyToOne(() => User, (user) => user.surveyAnswers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => SurveyResult, (surveyResult) => surveyResult.surveyAnswers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "result_id", referencedColumnName: "id" }])
  result: SurveyResult;

  @ManyToOne(() => User, (user) => user.surveyAnswers2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;
}

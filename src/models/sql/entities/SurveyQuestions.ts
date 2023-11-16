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
import { Survey } from "./Survey";
import { SurveyResult } from "./SurveyResult";

@Index("fk_survey_questions_created_by", ["createdBy"], {})
@Index("fk_survey_questions_survey_id", ["surveyId"], {})
@Index("fk_survey_questions_updated_by", ["updatedBy"], {})
@Entity("survey_questions")
export class SurveyQuestions {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("varchar", { name: "question_text", nullable: true, length: 250 })
  questionText: string | null;

  @Column("bigint", { name: "survey_id", unsigned: true })
  surveyId: string;

  @Column("varchar", { name: "label", nullable: true, length: 250 })
  label: string | null;

  @Column("varchar", { name: "belongs_to", nullable: true, length: 250 })
  belongsTo: string | null;

  @Column("int", { name: "sequence", nullable: true })
  sequence: number | null;

  @Column("varchar", { name: "option_type", nullable: true, length: 250 })
  optionType: string | null;

  @Column("json", { name: "options", nullable: true })
  options: object | null;

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

  @ManyToOne(() => User, (user) => user.surveyQuestions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(() => Survey, (survey) => survey.surveyQuestions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "survey_id", referencedColumnName: "id" }])
  survey: Survey;

  @ManyToOne(() => User, (user) => user.surveyQuestions2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.question)
  surveyResults: SurveyResult[];
}

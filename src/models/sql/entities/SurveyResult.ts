import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SurveyAnswer } from "./SurveyAnswer";
import { AgencyDetails } from "./AgencyDetails";
import { ClientDetails } from "./ClientDetails";
import { User } from "./User";
import { SurveyQuestions } from "./SurveyQuestions";
import { Site } from "./Site";
import { Survey } from "./Survey";
import { Workers } from "./Workers";

@Index("fk_survey_result_agency_id", ["agencyId"], {})
@Index("fk_survey_result_client_id", ["clientId"], {})
@Index("fk_survey_result_created_by", ["createdBy"], {})
@Index("fk_survey_result_question_id", ["questionId"], {})
@Index("fk_survey_result_site_id", ["siteId"], {})
@Index("fk_survey_result_survey_id", ["surveyId"], {})
@Index("fk_survey_result_updated_by", ["updatedBy"], {})
@Index("fk_survey_result_worker_id", ["workerId"], {})
@Entity("survey_result")
export class SurveyResult {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  id: string;

  @Column("bigint", { name: "worker_id", unsigned: true })
  workerId: string;

  @Column("bigint", { name: "question_id", unsigned: true })
  questionId: string;

  @Column("float", { name: "rating", nullable: true, precision: 12 })
  rating: number | null;

  @Column("bigint", { name: "site_id", unsigned: true })
  siteId: string;

  @Column("bigint", { name: "agency_id", unsigned: true })
  agencyId: string;

  @Column("bigint", { name: "client_id", unsigned: true })
  clientId: string;

  @Column("bigint", { name: "survey_id", nullable: true, unsigned: true })
  surveyId: string | null;

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

  @OneToMany(() => SurveyAnswer, (surveyAnswer) => surveyAnswer.result)
  surveyAnswers: SurveyAnswer[];

  @ManyToOne(
    () => AgencyDetails,
    (agencyDetails) => agencyDetails.surveyResults,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "agency_id", referencedColumnName: "id" }])
  agency: AgencyDetails;

  @ManyToOne(
    () => ClientDetails,
    (clientDetails) => clientDetails.surveyResults,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: ClientDetails;

  @ManyToOne(() => User, (user) => user.surveyResults, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy2: User;

  @ManyToOne(
    () => SurveyQuestions,
    (surveyQuestions) => surveyQuestions.surveyResults,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
  question: SurveyQuestions;

  @ManyToOne(() => Site, (site) => site.surveyResults, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: Site;

  @ManyToOne(() => Survey, (survey) => survey.surveyResults, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "survey_id", referencedColumnName: "id" }])
  survey: Survey;

  @ManyToOne(() => User, (user) => user.surveyResults2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy2: User;

  @ManyToOne(() => Workers, (workers) => workers.surveyResults, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "worker_id", referencedColumnName: "id" }])
  worker: Workers;
}

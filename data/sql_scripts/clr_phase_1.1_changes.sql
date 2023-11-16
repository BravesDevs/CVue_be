/* script to insert data in user type table*/

INSERT INTO user_type (type, name, parent_id, created_by) VALUES 
('agency_site_admin', 'Site Admin', NULL,NULL ),
('agency_region_admin', 'Region Admin', NULL,NULL);


/* script to insert data for agency site admin in permissions table*/

INSERT INTO permissions (access_type, user_type_id,feature_id, created_by, updated_by) VALUES
 (1, 7, 5, 1, 1),
 (3, 7, 11, 1, 1),
 (2, 7, 13, 1, 1),
 (1, 7, 8, 1, 1),
 (1, 7, 10, 1, 1),
 (3, 7, 16, 1, 1),
 (2, 7, 19, 1, 1),
 (1, 7, 20, 1, 1),
 (3, 7, 21, 1, 1),
 (1, 7, 22, 1, 1),
 (1, 7, 23, 1, 1);

/* script to insert data for agency regional admin in permissions table*/

INSERT INTO permissions (access_type, user_type_id,feature_id, created_by, updated_by) VALUES
 (1, 8, 5, 1, 1),
 (3, 8, 11, 1, 1),
 (2, 8, 13, 1, 1),
 (1, 8, 8, 1, 1),
 (1, 8, 10, 1, 1),
 (3, 8, 16, 1, 1),
 (2, 8, 19, 1, 1),
 (1, 8, 20, 1, 1),
 (3, 8, 21, 1, 1),
 (1, 8, 22, 1, 1),
 (1, 8, 23, 1, 1),
 (1, 8, 7, 1, 1);
 
 /* script to insert data for agency admin in permissions table*/

INSERT INTO permissions (access_type, user_type_id,feature_id, created_by, updated_by) VALUES
 (2, 3, 17, 1, 1),
 (3, 3, 15, 1, 1);
 
 /* script to alter data in region table*/

ALTER TABLE `region` 
ADD COLUMN `agency_region_admin_id` BIGINT UNSIGNED NULL AFTER `admin_id`,
ADD UNIQUE INDEX `agency_region_admin_id` (`agency_region_admin_id` ASC) VISIBLE;


ALTER TABLE `region` 
ADD CONSTRAINT `fk_agency_region_admin_id`
  FOREIGN KEY (`agency_region_admin_id`)
  REFERENCES `user` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

/* script to insert data in features table*/

INSERT INTO features (name, code, created_by, updated_by) VALUES
 ('Regional Agency Admin', 'agency_region_admin', 1, 1),
 ('Site Agency Admin',' agency_site_admin', 1, 1);



/* Survey builder changes*/

/* script to alter data in survey_questions table*/

ALTER TABLE `survey_questions` 
ADD COLUMN `is_default` TINYINT(4) NOT NULL DEFAULT 0 AFTER `updated_at`;

/* script to alter data in survey table*/

ALTER TABLE `survey` 
ADD COLUMN `submission_limit` ENUM('ONCE_A_MONTH', 'ONCE_A_WEEK', 'ONLY_ONCE', 'NO_LIMIT') NULL DEFAULT NULL AFTER `is_visible`;

/* script to alter data in survey table*/

UPDATE survey 
SET 
    submission_limit = 'ONLY_ONCE'
WHERE
    name IN ('New Starter Survey - Week 1' , 'New Starter Survey - Week 2', 'Feedback Survey - Week 4', 'Feedback Survey - Week 8', 'Feedback Survey - Week 12', 'Exit Survey');
    
    
UPDATE survey 
SET 
    submission_limit = 'ONCE_A_WEEK'
WHERE
    name IN ('No Hours Survey', 'Pay Query Survey');
    
      
UPDATE survey 
SET 
    submission_limit = 'ONCE_A_MONTH'
WHERE
    name IN ('General Feedback Survey');


/* General Survey Changes */

DELETE FROM survey_result WHERE question_id IN (SELECT id FROM survey_questions WHERE survey_id=7);
DELETE FROM survey_questions WHERE survey_id=7;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) VALUES 
("The training I receive is sufficient for me to perform my work well", 7, "Training", "SITE", 1, "Rating", "1", NOW(), "1", NOW(), 1),
("I feel comfortable to ask my direct line manager for help if I have difficulties with a task", 7, "Leadership", "SITE", 2, "Rating", "1", NOW(), "1", NOW(), 1),
("My co-workers and I work well together as a team", 7, "Engagement", "SITE", 3, "Rating", "1", NOW(), "1", NOW(), 1),
("I am appropriately recognised when I perform well in my regular duties", 7, "Recognition", "SITE", 4, "Rating", "1", NOW(), "1", NOW(), 1),
("I would recommend my workplace to family members and friends", 7, "Identification", "SITE", 5, "Rating", "1", NOW(), "1", NOW(), 1),
("My agency onboarding was professional and gave me an accurate insight into my role", 7, "Role Expectations", "AGENCY", 6, "Rating", "1", NOW(), "1", NOW(), 1),
("I feel comfortable to ask my agency line manager for help if I have difficulties with a task", 7, "Leadership", "AGENCY", 7, "Rating", "1", NOW(), "1", NOW(), 1),
("I feel comfortable raising any issues to my agency & issues are dealt with quickly & effectively", 7, "Engagement", "AGENCY", 8, "Rating", "1", NOW(), "1", NOW(), 1),
("I rarely have issues with my pay, including requesting & receiving holiday pay", 7, "Payroll", "AGENCY", 9, "Rating", "1", NOW(), "1", NOW(), 1),
("I would recommend my agency to family members and friends", 7, "Identification", "AGENCY", 10, "Rating", "1", NOW(), "1", NOW(), 1);



INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "The training I receive is sufficient for me to perform my work well", 7, "Training", "SITE", 1, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "I feel comfortable to ask my direct line manager for help if I have difficulties with a task", 7, "Leadership", "SITE", 2, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "My co-workers and I work well together as a team", 7, "Engagement", "SITE", 3, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "I am appropriately recognised when I perform well in my regular duties", 7, "Recognition", "SITE", 4, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "I would recommend my workplace to family members and friends", 7, "Identification", "SITE", 5, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "My agency onboarding was professional and gave me an accurate insight into my role", 7, "Role Expectations", "AGENCY", 6, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "I feel comfortable to ask my agency line manager for help if I have difficulties with a task", 7, "Leadership", "AGENCY", 7, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "I feel comfortable raising any issues to my agency & issues are dealt with quickly & effectively", 7, "Engagement", "AGENCY", 8, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "I rarely have issues with my pay, including requesting & receiving holiday pay", 7, "Payroll", "AGENCY", 9, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;

INSERT INTO survey_questions (question_text, survey_id, label, belongs_to, sequence, option_type, created_by, created_at, updated_by, updated_at, is_default) 
SELECT "I would recommend my agency to family members and friends", 7, "Identification", "AGENCY", 10, "Rating", id, NOW(), id, NOW(), 0 FROM user WHERE user_type_id = 2 AND user.id != 1;



ALTER TABLE `survey_result` 
DROP FOREIGN KEY `fk_survey_result_agency_id`;
ALTER TABLE `survey_result` 
CHANGE COLUMN `agency_id` `agency_id` BIGINT(20) UNSIGNED NULL DEFAULT NULL ;
ALTER TABLE `survey_result` 
ADD CONSTRAINT `fk_survey_result_agency_id`
  FOREIGN KEY (`agency_id`)
  REFERENCES `agency_details` (`id`);
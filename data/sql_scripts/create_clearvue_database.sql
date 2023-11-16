-- MySQL dump 10.13  Distrib 5.7.36, for Linux (x86_64)
--
-- Host: localhost    Database: clear_vue
-- ------------------------------------------------------
-- Server version	5.7.36-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- -----------------------------------------------------
-- Schema clear_vue
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `clear_vue` ;
USE `clear_vue` ;

--
-- Table structure for table `agency_details`
--

DROP TABLE IF EXISTS `agency_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agency_details` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `address` json DEFAULT NULL,
  `post_code` varchar(45) DEFAULT NULL,
  `city` varchar(250) DEFAULT NULL,
  `country` varchar(250) DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_agency_details_created_by_idx` (`created_by`),
  KEY `fk_agency_details_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_agency_details_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_agency_details_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_details`
--

DROP TABLE IF EXISTS `client_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
DROP TABLE IF EXISTS `client_details`;
CREATE TABLE IF NOT EXISTS `client_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `sector_id` bigint unsigned DEFAULT NULL,
  `address` json DEFAULT NULL,
  `post_code` varchar(45) DEFAULT NULL,
  `city` varchar(250) DEFAULT NULL,
  `country` varchar(250) DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sector_id_idx` (`sector_id`),
  KEY `fk_client_details_created_by_idx` (`created_by`),
  KEY `fk_client_details_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_client_details_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_client_details_sector_id` FOREIGN KEY (`sector_id`) REFERENCES `sector` (`id`),
  CONSTRAINT `fk_client_details_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
CREATE TABLE IF NOT EXISTS `departments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `client_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_departments_created_by_idx` (`created_by`),
  KEY `fk_departments_updated_by_idx` (`updated_by`),
  KEY `FK_departments_client_details` (`client_id`),
  CONSTRAINT `FK_departments_client_details` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`),
  CONSTRAINT `fk_departments_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_departments_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint(20) unsigned DEFAULT NULL,
  `rate_card_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(250) NOT NULL,
  `type` enum('PART TIME','FULL TIME','WEEKEND') DEFAULT NULL,
  `shift` bigint(20) unsigned DEFAULT NULL,
  `hours_per_week` int(11) DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_rate_card_id_idx` (`rate_card_id`),
  KEY `fk_job_client_id` (`client_id`),
  KEY `fk_job_created_by_idx` (`created_by`),
  KEY `fk_job_updated_by_idx` (`updated_by`),
  KEY `fk_job_shift_id_idx` (`shift`),
  CONSTRAINT `fk_job_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_job_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_job_rate_card_id` FOREIGN KEY (`rate_card_id`) REFERENCES `rate_card` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_job_shift_id` FOREIGN KEY (`shift`) REFERENCES `shift` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_job_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rate_card`
--

DROP TABLE IF EXISTS `rate_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rate_card` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) DEFAULT NULL,
  `currency` varchar(250) DEFAULT NOT NULL,
  `pay_per_hour` float DEFAULT NULL,
  `insurance_rate` float DEFAULT NULL,
  `holiday_pay_rate` float DEFAULT NULL,
  `apprenticeship_rate` float DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_rate_card_created_by_idx` (`created_by`),
  KEY `fk_rate_card_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_rate_card_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_rate_card_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `region`
--

DROP TABLE IF EXISTS `region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `region` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `client_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_region_created_by_idx` (`created_by`),
  KEY `fk_region_updated_by_idx` (`updated_by`),
  KEY `fk_region_client_id` (`client_id`),
  CONSTRAINT `fk_region_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`),
  CONSTRAINT `fk_region_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_region_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sector`
--

DROP TABLE IF EXISTS `sector`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sector` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(250) NOT NULL,
  `value` varchar(250) NOT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sector_ids` (`key`),
  KEY `fk_sector_created_by_idx` (`created_by`),
  KEY `fk_sector_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_sector_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_sector_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `reset_password_token`
--

DROP TABLE IF EXISTS `reset_password_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reset_password_token` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `token` varchar(500) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reset_password_token_user_id_idx` (`user_id`),
  CONSTRAINT `fk_reset_password_token_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shift`
--

DROP TABLE IF EXISTS `shift`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shift` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_shift_created_by_idx` (`created_by`),
  KEY `fk_shift_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_shift_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_shift_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `site`
--

DROP TABLE IF EXISTS `site`;
CREATE TABLE IF NOT EXISTS `site` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `region_id` bigint unsigned DEFAULT NULL,
  `department_id` bigint unsigned DEFAULT NULL,
  `address` json DEFAULT NULL,
  `post_code` varchar(45) DEFAULT NULL,
  `city` varchar(250) DEFAULT NULL,
  `country` varchar(250) DEFAULT NULL,
  `client_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_region_id_idx` (`region_id`),
  KEY `fk_department_id_idx` (`department_id`),
  KEY `fk_site_created_by_idx` (`created_by`),
  KEY `fk_site_updated_by_idx` (`updated_by`),
  KEY `FK_site_client_id` (`client_id`),
  CONSTRAINT `FK_site_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`),
  CONSTRAINT `fk_site_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_site_department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_site_region_id` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`),
  CONSTRAINT `fk_site_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_type_id` bigint(20) unsigned NOT NULL,
  `agency_id` bigint(20) unsigned DEFAULT NULL,
  `client_id` bigint(20) unsigned DEFAULT NULL,
  `worker_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(250) DEFAULT NULL,
  `email` varchar(250) NOT NULL,
  `country_code` varchar(45) DEFAULT NULL,
  `mobile` varchar(45) DEFAULT NULL,
  `password` text,
  `is_verified` tinyint(4) DEFAULT '0',
  `resource` VARCHAR(50) NULL DEFAULT NULL COLLATE,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `email` (`email`),
  KEY `country_code` (`country_code`),
  KEY `mobile` (`mobile`),
  KEY `fk_agency_id_idx` (`agency_id`),
  KEY `fk_client_id_idx` (`client_id`),
  KEY `fk_worker_id_idx` (`worker_id`),
  KEY `fk_user_created_by_idx` (`created_by`),
  KEY `fk_user_updated_by_idx` (`updated_by`),
  KEY `fk_user_type_id_idx` (`user_type_id`),
  CONSTRAINT `fk_user_agency_id` FOREIGN KEY (`agency_id`) REFERENCES `agency_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_type_id` FOREIGN KEY (`user_type_id`) REFERENCES `user_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_worker_id` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_type`
--

DROP TABLE IF EXISTS `user_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_type` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(250) NOT NULL,
  `parent_id` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_type` (`type`),
  KEY `fk_user_type_created_by_idx` (`created_by`),
  CONSTRAINT `fk_user_type_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  KEY `fk_user_type_parent_id_idx` (`parent_id`),
  CONSTRAINT `fk_user_type_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `user_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `features`
--

DROP TABLE IF EXISTS `features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `features` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `code` varchar(250) NOT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT(20) UNSIGNED NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_features_name` (`name`),
  UNIQUE KEY `uk_features_code` (`code`),
  KEY `fk_features_created_by_idx` (`created_by`),
  CONSTRAINT `fk_features_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  KEY `fk_features_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_features_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `access_type` INT(1) NOT NULL,
  `user_type_id` BIGINT(20) UNSIGNED NOT NULL,
  `feature_id` BIGINT(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT(20) UNSIGNED NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_permissions_created_by_idx` (`created_by`),
  CONSTRAINT `fk_permissions_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  KEY `fk_permissions_feature_id_idx` (`feature_id`),
  CONSTRAINT `fk_permissions_feature_id` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  KEY `fk_permissions_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_permissions_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  KEY `fk_permissions_user_type_id_idx` (`user_type_id`),
  CONSTRAINT `fk_permissions_user_type_id` FOREIGN KEY (`user_type_id`) REFERENCES `user_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workers`
--

DROP TABLE IF EXISTS `agency_client_association`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agency_client_association` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `currency` varchar(250) DEFAULT NOT NULL,
  `margin` float DEFAULT NOT NULL,
  `agency_id` BIGINT(20) UNSIGNED NOT NULL,
  `client_id` BIGINT(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` BIGINT(20) UNSIGNED NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_agency_client_association_created_by_idx` (`created_by`),
  CONSTRAINT `fk_agency_client_association_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  KEY `fk_agency_client_association_agency_id_idx` (`agency_id`),
  CONSTRAINT `fk_agency_client_association_agency_id` FOREIGN KEY (`agency_id`) REFERENCES `agency_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  KEY `fk_agency_client_association_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_agency_client_association_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  KEY `fk_agency_client_association_client_id_idx` (`client_id`),
  CONSTRAINT `fk_agency_client_association_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT = 0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workers`
--

DROP TABLE IF EXISTS `workers`;
CREATE TABLE IF NOT EXISTS `workers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(250) DEFAULT NULL,
  `last_name` varchar(250) DEFAULT NULL,
  `email` varchar(250) DEFAULT NULL,
  `country_code` varchar(45) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `mobile` varchar(45) DEFAULT NULL,
  `national_insurance_number` varchar(250) DEFAULT NULL,
  `payroll_ref` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `post_code` varchar(45) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `nationality` varchar(250) DEFAULT NULL,
  `orientation` varchar(250) DEFAULT NULL,
  `agency_id` bigint unsigned DEFAULT NULL,
  `client_id` bigint unsigned DEFAULT NULL,
  `job_id` bigint unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `in_actived_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `national_insurance_number_UNIQUE` (`national_insurance_number`,`agency_id`,`client_id`),
  KEY `fk_agency_id_idx` (`agency_id`),
  KEY `fk_workers_client_id_idx` (`client_id`),
  KEY `fk_workers_created_by_idx` (`created_by`),
  KEY `fk_workers_updated_by_idx` (`updated_by`),
  KEY `fk_workers_job_id_idx` (`job_id`),
  CONSTRAINT `fk_workers_agency_id` FOREIGN KEY (`agency_id`) REFERENCES `agency_details` (`id`),
  CONSTRAINT `fk_workers_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`),
  CONSTRAINT `fk_workers_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_workers_job_id` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`),
  CONSTRAINT `fk_workers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `agency_client_association`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agency_client_association` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `margin` int(20) NOT NULL,
  `agency_id` bigint(20) unsigned NOT NULL,
  `client_id` bigint(20) unsigned NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_agency_client_association_created_by_idx` (`created_by`),
  KEY `fk_agency_client_association_agency_id_idx` (`agency_id`),
  KEY `fk_agency_client_association_updated_by_idx` (`updated_by`),
  KEY `fk_agency_client_association_client_id_idx` (`client_id`),
  CONSTRAINT `fk_agency_client_association_agency_id` FOREIGN KEY (`agency_id`) REFERENCES `agency_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_agency_client_association_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_agency_client_association_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_agency_client_association_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `time_and_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `time_and_attendance` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `path` varchar(250) NOT NULL,
  `status` varchar(45) NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_by` bigint(20) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_time_and_attendance_created_by_idx` (`created_by`),
  KEY `fk_time_and_attendance_updated_by_idx` (`updated_by`),
  CONSTRAINT `fk_time_and_attendance_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_time_and_attendance_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;

/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `time_and_attendance_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `time_and_attendance_data` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agency_id` bigint(20) unsigned DEFAULT NULL,
  `client_id` bigint(20) unsigned DEFAULT NULL,
  `worker_id` bigint(20) unsigned DEFAULT NULL,
  `site_id` bigint(20) unsigned DEFAULT NULL,
  `job_id` bigint(20) unsigned DEFAULT NULL,
  `hours_approved` float DEFAULT NULL,
  `type_of_hours` varchar(45) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `payment_week` int(4) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_by` bigint(20) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_time_and_attendance_data_created_by_idx` (`created_by`),
  KEY `fk_time_and_attendance_data_updated_by_idx` (`updated_by`),
  KEY `fk_time_and_attendance_data_client_id_idx` (`client_id`),
  KEY `fk_time_and_attendance_data_agency_id_idx` (`agency_id`),
  KEY `fk_time_and_attendance_data_worker_id_idx` (`worker_id`),
  KEY `fk_time_and_attendance_data_job_id_idx` (`job_id`),
  KEY `fk_time_and_attendance_data_site_id` (`site_id`),
  CONSTRAINT `fk_time_and_attendance_data_agency_id` FOREIGN KEY (`agency_id`) REFERENCES `agency_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_time_and_attendance_data_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_time_and_attendance_data_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_time_and_attendance_data_job_id` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_time_and_attendance_data_site_id` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_time_and_attendance_data_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_time_and_attendance_data_worker_id` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payroll`
--
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payroll` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `time_and_attendance_data_id` bigint(20) unsigned NOT NULL,
  `national_insurance` float NOT NULL,
  `pay_per_hour` float NOT NULL,
  `holiday` float NOT NULL,
  `pension` float NOT NULL,
  `apprenticeship_levy` float NOT NULL,
  `national_insurance_dynamic` float NOT NULL,
  `holiday_dynamic` float NOT NULL,
  `pension_dynamic` float NOT NULL,
  `apprenticeship_levy_dynamic` float NOT NULL,
  `pay_per_hour_dynamic` float NOT NULL,
  `agency_id` bigint(20) unsigned NOT NULL,
  `client_id` bigint(20) unsigned NOT NULL,
  `worker_id` bigint(20) unsigned NOT NULL,
  `margin` float NOT NULL,
  `payroll_static_total` float NOT NULL,
  `payroll_dynamic_total` float NOT NULL,
  `clearvue_savings` float NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payroll_agency_id` (`agency_id`),
  KEY `fk_payroll_client_id` (`client_id`),
  KEY `fk_payroll_worker_id` (`worker_id`),
  KEY `fk_payroll_created_by` (`created_by`),
  KEY `fk_payroll_updated_by` (`updated_by`),
  KEY `fk_payroll_time_and_attendance_data_id` (`time_and_attendance_data_id`),
  CONSTRAINT `fk_payroll_agency_id` FOREIGN KEY (`agency_id`) REFERENCES `agency_details` (`id`),
  CONSTRAINT `fk_payroll_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`),
  CONSTRAINT `fk_payroll_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_payroll_time_and_attendance_data_id` FOREIGN KEY (`time_and_attendance_data_id`) REFERENCES `time_and_attendance_data` (`id`),
  CONSTRAINT `fk_payroll_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_payroll_worker_id` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message`
--
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(750) NOT NULL,
  `title` varchar(750) NOT NULL,
  `type` enum('GENERAL','KUDOS','AWARD','REWARD','TRAINING','BADGE') NOT NULL,
  `from` varchar(250) NOT NULL,
  `client_id` bigint unsigned NOT NULL,
  `site_id` bigint unsigned NOT NULL,
  `agency_id` bigint unsigned DEFAULT NULL,
  `label` varchar(250) DEFAULT NULL,
  `body` json NOT NULL,
  `receiver` json NOT NULL,
  `send_by` bigint unsigned NOT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_message_send_by_idx` (`send_by`),
  KEY `fk_message_created_by_idx` (`created_by`),
  KEY `fk_message_modified_by_idx` (`updated_by`),
  KEY `fk_message_name_idx` (`name`),
  KEY `fk_message_type_idx` (`type`),
  KEY `fk_message_agency_id` (`agency_id`),
  KEY `fk_message_client_id` (`client_id`),
  KEY `fk_message_site_id` (`site_id`),
  CONSTRAINT `fk_message_agency_id` FOREIGN KEY (`agency_id`) REFERENCES `agency_details` (`id`),
  CONSTRAINT `fk_message_client_id` FOREIGN KEY (`client_id`) REFERENCES `client_details` (`id`),
  CONSTRAINT `fk_message_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_message_send_by` FOREIGN KEY (`send_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_message_site_id` FOREIGN KEY (`site_id`) REFERENCES `site` (`id`),
  CONSTRAINT `fk_message_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_receiver_workers`
--
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `message_receiver_workers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message_receiver_workers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` bigint unsigned NOT NULL,
  `worker_id` bigint unsigned NOT NULL,
  `is_message_read` tinyint(1) DEFAULT '0',
  `message_read_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_message_receiver_workers_created_by_idx` (`created_by`),
  KEY `fk_message_receiver_workers_modified_by_idx` (`updated_by`),
  KEY `idx_message_receiver_workers_worker_id` (`worker_id`),
  KEY `idx_message_receiver_message_id` (`message_id`),
  CONSTRAINT `fk_message_receiver_message_id` FOREIGN KEY (`message_id`) REFERENCES `message` (`id`),
  CONSTRAINT `fk_message_receiver_workers_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_message_receiver_workers_modified_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_message_receiver_workers_worker_id` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `worker_training`
--
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `worker_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `worker_training` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` bigint unsigned NOT NULL,
  `worker_id` bigint unsigned NOT NULL,
  `is_training_completed` tinyint(1) DEFAULT '0',
  `training_completed_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_worker_training_created_by_idx` (`created_by`),
  KEY `fk_worker_training_updated_by_idx` (`updated_by`),
  KEY `fk_worker_training_worker_idx` (`worker_id`),
  KEY `fk_worker_training_message_idx` (`message_id`),
  CONSTRAINT `fk_worker_training_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_worker_training_message_id` FOREIGN KEY (`message_id`) REFERENCES `message` (`id`),
  CONSTRAINT `fk_worker_training_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_worker_training_worker_id` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

--
-- Table structure for table `faq`
--

DROP TABLE IF EXISTS `faq`;
CREATE TABLE `faq` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `question` varchar(500) NOT NULL,
  `answer` json NOT NULL,
  `type` enum('FAQ','LINK_TO_SUPPORT') NOT NULL,
  `display_order` int(11) NOT NULL,
  `is_visible` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;

/*Insert query for table `faq` */;

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ('Why do I need to register on the ClearVue app?', 
'[{"type": "text", "value": "The ClearVue app has been created as a platform for your agency and the company you work at to communicate and interact with you. By having this app you are able to provide feedback and receive recognition and reward. "}]',
'FAQ', '100', '1');

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ('How is my personal information used and stored?', 
'[{"type": "text", "value": "ClearVue takes the storing & usage of personal data seriously and treats it with utmost respect. Your data is the same that you have provided to your agency and we are providing you with the ability to see and view this information in the mobile app. We also provide you with additional work history, recognition received with skills & training logged in your profile for you to see. Should you require to see our privacy policy go to http://theclearvue.co.uk/privacy"}, {"type": "link"}]',
'FAQ', '200', '1');

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ('Can I share my profile and work history with potential future employers?', 
'[{"type": "text", "value": "Yes, your work history such as length of service & shifts completed shall be available for you to share with future employers"}]',
'FAQ', '300', '1');

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ('Can I take my Hall of Fame achievements with me for future use? ', 
'[{"type": "text", "value": "Yes, all of your achievements such as Kudos, Awards, Skills, and Training are recorded in your worker profile and will be available for you to provide to future employers"}]',
'FAQ', '400', '1');

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ('How do I setup my profile?', 
'[{"type": "text", "value": "All your information will automatically be available after the agency has set you up. If you need to update your right to work documents then you can do this through the app. Othe changes you will need to contact your agency"}]',
'FAQ', '500', '1');

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ("My profile hasn't been validated yet, what do I do?", 
'[{"type": "text", "value": "If you cannot login using your unique National Insurance number then please contact your agency to make sure you are on the platform."}]',
'FAQ', '600', '1');

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ('How can you ensure my ratings feedback remains anonymous?', 
'[{"type": "text", "value": "All the survey information gathered by ClearVue for ratings removes the worker identifier and just provides a scoring per question."}]',
'FAQ', '700', '1');

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ('How can I access my training accreditations?', 
'[{"type": "text", "value": "All of your training accreditations and skills will be automatically recorded and will be available in the Training section of the mobile application. "}]',
'FAQ', '800', '1');

INSERT INTO clear_vue_local.faq (question, answer, type, display_order, is_visible)
VALUES ('How do I raise a pay issue with my agency through the app?', 
'[{"type": "text", "value": "Click Survey in menu section then click Pay Survey. Choose the right option for you and submit. This will then notify your agency and current place of work and logged for resolving."}]',
'FAQ', '900', '1');

-- Dump completed on 2021-12-24 14:21:57

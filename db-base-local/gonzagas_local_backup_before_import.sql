mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: gonzagas_local
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
mysqldump: Error: 'Access denied; you need (at least one of) the PROCESS privilege(s) for this operation' when trying to dump tablespaces

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_type` enum('customer','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `user_identifier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_user` (`user_type`,`user_id`),
  KEY `idx_activity_action` (`action`),
  KEY `idx_activity_date` (`created_at`),
  KEY `idx_activity_entity` (`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_logs_user_id` (`user_id`),
  KEY `idx_activity_logs_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de atividades dos usuários administrativos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('master','admin','manager','viewer') COLLATE utf8mb4_unicode_ci DEFAULT 'admin',
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `login_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuários com acesso à área administrativa';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin@example.com','Administrador','admin',NULL,1,NULL,0,'2025-05-22 10:02:30','2025-05-22 10:02:30'),(3,'gonzaga','$2b$12$Wdai.cHrDOv2ZlDCldgrJuuB2UFa4MieOKFcSDbmd6njeGcOId7dK','admin@gonzagas.pt','Hugo Gonzaga Gomes','master','{\"all\": true}',1,'2025-10-09 19:14:48',6,'2025-10-09 17:22:43','2025-10-09 18:14:48');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_conversions`
--

DROP TABLE IF EXISTS `analytics_conversions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_conversions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` bigint DEFAULT NULL,
  `conversion_type` enum('whatsapp_click','phone_call','email_click','form_submit','catalog_view','product_view') COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversion_value` decimal(10,2) DEFAULT '0.00',
  `product_id` int DEFAULT NULL,
  `product_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `funnel_stage` enum('awareness','interest','consideration','intent','purchase') COLLATE utf8mb4_unicode_ci DEFAULT 'interest',
  `first_touch_source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_touch_source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `event_id` (`event_id`),
  KEY `idx_conversions_type` (`conversion_type`),
  KEY `idx_conversions_product` (`product_id`),
  KEY `idx_conversions_created` (`created_at`),
  CONSTRAINT `analytics_conversions_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `analytics_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `analytics_conversions_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `analytics_events` (`id`) ON DELETE SET NULL,
  CONSTRAINT `analytics_conversions_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_conversions`
--

LOCK TABLES `analytics_conversions` WRITE;
/*!40000 ALTER TABLE `analytics_conversions` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_conversions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_daily_stats`
--

DROP TABLE IF EXISTS `analytics_daily_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_daily_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `total_sessions` int DEFAULT '0',
  `unique_visitors` int DEFAULT '0',
  `page_views` int DEFAULT '0',
  `bounce_rate` decimal(5,2) DEFAULT '0.00',
  `avg_session_duration` int DEFAULT '0',
  `desktop_sessions` int DEFAULT '0',
  `mobile_sessions` int DEFAULT '0',
  `tablet_sessions` int DEFAULT '0',
  `total_conversions` int DEFAULT '0',
  `whatsapp_clicks` int DEFAULT '0',
  `phone_calls` int DEFAULT '0',
  `conversion_rate` decimal(5,2) DEFAULT '0.00',
  `top_pages` json DEFAULT NULL,
  `top_products` json DEFAULT NULL,
  `search_queries` json DEFAULT NULL,
  `traffic_sources` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`),
  KEY `idx_daily_stats_date` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_daily_stats`
--

LOCK TABLES `analytics_daily_stats` WRITE;
/*!40000 ALTER TABLE `analytics_daily_stats` DISABLE KEYS */;
INSERT INTO `analytics_daily_stats` VALUES (1,'2025-10-01',45,38,124,0.00,0,0,0,0,0,12,0,0.00,NULL,NULL,NULL,NULL,'2025-10-08 08:16:49','2025-10-08 08:16:49'),(2,'2025-10-02',52,44,145,0.00,0,0,0,0,0,15,0,0.00,NULL,NULL,NULL,NULL,'2025-10-08 08:16:49','2025-10-08 08:16:49'),(3,'2025-10-03',38,35,98,0.00,0,0,0,0,0,8,0,0.00,NULL,NULL,NULL,NULL,'2025-10-08 08:16:49','2025-10-08 08:16:49'),(4,'2025-10-04',61,55,178,0.00,0,0,0,0,0,18,0,0.00,NULL,NULL,NULL,NULL,'2025-10-08 08:16:49','2025-10-08 08:16:49'),(5,'2025-10-05',48,41,132,0.00,0,0,0,0,0,14,0,0.00,NULL,NULL,NULL,NULL,'2025-10-08 08:16:49','2025-10-08 08:16:49'),(6,'2025-10-06',67,58,195,0.00,0,0,0,0,0,22,0,0.00,NULL,NULL,NULL,NULL,'2025-10-08 08:16:49','2025-10-08 08:16:49'),(7,'2025-10-07',55,47,156,0.00,0,0,0,0,0,17,0,0.00,NULL,NULL,NULL,NULL,'2025-10-08 08:16:49','2025-10-08 08:16:49'),(9,'2025-10-08',3,0,0,0.00,2200,2,1,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'2025-10-09 23:00:00','2025-10-09 23:00:00');
/*!40000 ALTER TABLE `analytics_daily_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_events`
--

DROP TABLE IF EXISTS `analytics_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_value` decimal(10,2) DEFAULT NULL,
  `page_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `referrer` text COLLATE utf8mb4_unicode_ci,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` enum('desktop','mobile','tablet') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `screen_resolution` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `product_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_session` (`session_id`),
  KEY `idx_events_type` (`event_type`),
  KEY `idx_events_category` (`event_category`),
  KEY `idx_events_product` (`product_id`),
  KEY `idx_events_created` (`created_at`),
  KEY `idx_events_device` (`device_type`),
  CONSTRAINT `analytics_events_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_events`
--

LOCK TABLES `analytics_events` WRITE;
/*!40000 ALTER TABLE `analytics_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_page_views`
--

DROP TABLE IF EXISTS `analytics_page_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_page_views` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `page_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `time_on_page` int DEFAULT NULL,
  `bounce` tinyint(1) DEFAULT '0',
  `exit_page` tinyint(1) DEFAULT '0',
  `max_scroll_percentage` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `idx_page_views_session` (`session_id`),
  KEY `idx_page_views_product` (`product_id`),
  KEY `idx_page_views_type` (`page_type`),
  KEY `idx_page_views_created` (`created_at`),
  CONSTRAINT `analytics_page_views_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `analytics_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `analytics_page_views_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `analytics_page_views_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `product_families` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_page_views`
--

LOCK TABLES `analytics_page_views` WRITE;
/*!40000 ALTER TABLE `analytics_page_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_page_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_product_performance`
--

DROP TABLE IF EXISTS `analytics_product_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_product_performance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `date` date NOT NULL,
  `page_views` int DEFAULT '0',
  `unique_views` int DEFAULT '0',
  `avg_time_on_page` int DEFAULT '0',
  `bounce_rate` decimal(5,2) DEFAULT '0.00',
  `whatsapp_clicks` int DEFAULT '0',
  `image_views` int DEFAULT '0',
  `share_clicks` int DEFAULT '0',
  `search_appearances` int DEFAULT '0',
  `search_clicks` int DEFAULT '0',
  `avg_search_position` decimal(4,2) DEFAULT '0.00',
  `conversion_rate` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_date` (`product_id`,`date`),
  KEY `idx_product_perf_date` (`date`),
  KEY `idx_product_perf_views` (`page_views`),
  CONSTRAINT `analytics_product_performance_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_product_performance`
--

LOCK TABLES `analytics_product_performance` WRITE;
/*!40000 ALTER TABLE `analytics_product_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_product_performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_search_queries`
--

DROP TABLE IF EXISTS `analytics_search_queries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_search_queries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `query_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `results_count` int DEFAULT '0',
  `clicked_result_position` int DEFAULT NULL,
  `clicked_product_id` int DEFAULT NULL,
  `search_type` enum('catalog','global','navigation') COLLATE utf8mb4_unicode_ci DEFAULT 'catalog',
  `filters_applied` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `clicked_product_id` (`clicked_product_id`),
  KEY `idx_search_queries_text` (`query_text`),
  KEY `idx_search_queries_session` (`session_id`),
  KEY `idx_search_queries_created` (`created_at`),
  CONSTRAINT `analytics_search_queries_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `analytics_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `analytics_search_queries_ibfk_2` FOREIGN KEY (`clicked_product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_search_queries`
--

LOCK TABLES `analytics_search_queries` WRITE;
/*!40000 ALTER TABLE `analytics_search_queries` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_search_queries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_sessions`
--

DROP TABLE IF EXISTS `analytics_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_sessions` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `page_views` int DEFAULT '1',
  `source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medium` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keyword` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referrer` text COLLATE utf8mb4_unicode_ci,
  `device_type` enum('desktop','mobile','tablet') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `screen_resolution` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `converted` tinyint(1) DEFAULT '0',
  `conversion_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conversion_value` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_start` (`start_time`),
  KEY `idx_sessions_device` (`device_type`),
  KEY `idx_sessions_source` (`source`),
  KEY `idx_sessions_converted` (`converted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_sessions`
--

LOCK TABLES `analytics_sessions` WRITE;
/*!40000 ALTER TABLE `analytics_sessions` DISABLE KEYS */;
INSERT INTO `analytics_sessions` VALUES ('test-session-001',NULL,'2025-10-08 07:36:38','2025-10-08 08:06:38',1800,5,'direct','none',NULL,NULL,NULL,'desktop','Chrome','Windows',NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-10-08 08:36:38','2025-10-08 08:36:38'),('test-session-002',NULL,'2025-10-08 06:36:38','2025-10-08 07:36:38',3600,3,'social','instagram',NULL,NULL,NULL,'mobile','Safari','iOS',NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-10-08 08:36:38','2025-10-08 08:36:38'),('test-session-003',NULL,'2025-10-08 05:36:38','2025-10-08 06:36:38',1200,7,'search','google',NULL,NULL,NULL,'desktop','Firefox','Linux',NULL,NULL,NULL,NULL,0,NULL,NULL,'2025-10-08 08:36:38','2025-10-08 08:36:38');
/*!40000 ALTER TABLE `analytics_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` enum('data_access','consent_change','user_right_request','data_deletion','data_export','admin_access') COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `consent_changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `legal_basis` enum('consent','contract','legal_obligation','vital_interests','public_task','legitimate_interest') COLLATE utf8mb4_unicode_ci NOT NULL,
  `retention_period` enum('1 year','2 years','3 years','5 years','6 years') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_action` (`action`),
  KEY `idx_resource` (`resource`),
  KEY `idx_legal_basis` (`legal_basis`),
  KEY `idx_retention_period` (`retention_period`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_action_created` (`action`,`created_at`),
  KEY `idx_session_created` (`session_id`,`created_at`),
  CONSTRAINT `audit_logs_chk_1` CHECK (json_valid(`details`)),
  CONSTRAINT `audit_logs_chk_2` CHECK (json_valid(`consent_changes`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_sessions`
--

DROP TABLE IF EXISTS `cart_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cart_customer` (`customer_email`),
  KEY `idx_cart_product` (`product_id`),
  KEY `idx_cart_created` (`created_at`),
  CONSTRAINT `cart_sessions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_sessions`
--

LOCK TABLES `cart_sessions` WRITE;
/*!40000 ALTER TABLE `cart_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `catalog_products_optimized`
--

DROP TABLE IF EXISTS `catalog_products_optimized`;
/*!50001 DROP VIEW IF EXISTS `catalog_products_optimized`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `catalog_products_optimized` AS SELECT 
 1 AS `id`,
 1 AS `reference`,
 1 AS `name`,
 1 AS `description`,
 1 AS `sale_price`,
 1 AS `style`,
 1 AS `material`,
 1 AS `featured`,
 1 AS `current_stock`,
 1 AS `created_at`,
 1 AS `family_name`,
 1 AS `family_id`,
 1 AS `main_image`,
 1 AS `image_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `cookie_consents`
--

DROP TABLE IF EXISTS `cookie_consents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cookie_consents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `analytics_consent` tinyint(1) DEFAULT '0',
  `marketing_consent` tinyint(1) DEFAULT '0',
  `functional_consent` tinyint(1) DEFAULT '1',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cookie_consents`
--

LOCK TABLES `cookie_consents` WRITE;
/*!40000 ALTER TABLE `cookie_consents` DISABLE KEYS */;
/*!40000 ALTER TABLE `cookie_consents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_stone` enum('onix','olho-de-tigre','ametista','turquesa') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_orders` int DEFAULT '0',
  `total_spent` decimal(10,2) DEFAULT '0.00',
  `first_order_date` timestamp NULL DEFAULT NULL,
  `last_order_date` timestamp NULL DEFAULT NULL,
  `marketing_consent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_customer_email` (`email`),
  KEY `idx_customer_stone` (`preferred_stone`),
  KEY `idx_customer_spent` (`total_spent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ecommerce_settings`
--

DROP TABLE IF EXISTS `ecommerce_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecommerce_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `setting_type` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_settings_key` (`setting_key`),
  KEY `idx_settings_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecommerce_settings`
--

LOCK TABLES `ecommerce_settings` WRITE;
/*!40000 ALTER TABLE `ecommerce_settings` DISABLE KEYS */;
INSERT INTO `ecommerce_settings` VALUES (1,'site_name','Gonzaga Art & Shine','string','Nome do site','general','2025-10-09 17:21:03','2025-10-09 17:21:03'),(2,'free_shipping_threshold','75.00','number','Valor mínimo para portes grátis','shipping','2025-10-09 17:21:03','2025-10-09 17:21:03'),(3,'standard_shipping_cost','5.99','number','Custo portes standard','shipping','2025-10-09 17:21:03','2025-10-09 17:21:03'),(4,'express_shipping_cost','12.99','number','Custo portes express','shipping','2025-10-09 17:21:03','2025-10-09 17:21:03'),(5,'tax_rate','23.00','number','Taxa IVA (%)','tax','2025-10-09 17:21:03','2025-10-09 17:21:03'),(6,'order_notification_email','admin@gonzagas.pt','string','Email notificações admin','notifications','2025-10-09 17:21:03','2025-10-09 17:21:03'),(7,'maintenance_mode','false','boolean','Modo manutenção','general','2025-10-09 17:21:03','2025-10-09 17:21:03');
/*!40000 ALTER TABLE `ecommerce_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_collection_items`
--

DROP TABLE IF EXISTS `media_collection_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_collection_items` (
  `collection_id` int NOT NULL,
  `file_id` int NOT NULL,
  `position` int DEFAULT '0',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection_id`,`file_id`),
  KEY `file_id` (`file_id`),
  CONSTRAINT `media_collection_items_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `media_collections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `media_collection_items_ibfk_2` FOREIGN KEY (`file_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_collection_items`
--

LOCK TABLES `media_collection_items` WRITE;
/*!40000 ALTER TABLE `media_collection_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_collection_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_collections`
--

DROP TABLE IF EXISTS `media_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_collections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_image_id` int DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `cover_image_id` (`cover_image_id`),
  KEY `idx_slug` (`slug`),
  CONSTRAINT `media_collections_ibfk_1` FOREIGN KEY (`cover_image_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_collections`
--

LOCK TABLES `media_collections` WRITE;
/*!40000 ALTER TABLE `media_collections` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_file_tags`
--

DROP TABLE IF EXISTS `media_file_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_file_tags` (
  `file_id` int NOT NULL,
  `tag_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`file_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `media_file_tags_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE,
  CONSTRAINT `media_file_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `media_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_file_tags`
--

LOCK TABLES `media_file_tags` WRITE;
/*!40000 ALTER TABLE `media_file_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_file_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_files`
--

DROP TABLE IF EXISTS `media_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_files` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique filename stored on disk',
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Original filename when uploaded',
  `file_size` int DEFAULT NULL COMMENT 'File size in bytes',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'MIME type (image/jpeg, image/png, etc)',
  `width` int DEFAULT NULL COMMENT 'Image width in pixels',
  `height` int DEFAULT NULL COMMENT 'Image height in pixels',
  `has_thumbnail` tinyint(1) DEFAULT '0' COMMENT 'Has thumbnail variant (200x200)',
  `has_medium` tinyint(1) DEFAULT '0' COMMENT 'Has medium variant (800px)',
  `has_large` tinyint(1) DEFAULT '0' COMMENT 'Has large variant (1600px)',
  `has_webp` tinyint(1) DEFAULT '0' COMMENT 'Has WebP format version',
  `uploaded_by` int DEFAULT NULL COMMENT 'User ID who uploaded (FK to users)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last modification',
  `folder_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '/',
  `tags` json DEFAULT NULL,
  `alt_text` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `dominant_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dimensions` json DEFAULT NULL,
  `file_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `edit_history` json DEFAULT NULL,
  `upload_source` enum('web','mobile','api','bulk') COLLATE utf8mb4_unicode_ci DEFAULT 'web',
  `processed_variants` json DEFAULT NULL,
  `seo_optimized` tinyint(1) DEFAULT '0',
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_filename` (`filename`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_mime_type` (`mime_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_media_files_folder` (`folder_path`),
  KEY `idx_media_files_hash` (`file_hash`),
  KEY `idx_media_files_source` (`upload_source`),
  KEY `idx_media_files_accessed` (`last_accessed_at`),
  CONSTRAINT `fk_media_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Central media files repository with metadata and variants tracking';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_files`
--

LOCK TABLES `media_files` WRITE;
/*!40000 ALTER TABLE `media_files` DISABLE KEYS */;
INSERT INTO `media_files` VALUES (1,'test-image-1.jpg','produto-001.jpg',150000,'image/jpeg',800,600,0,0,0,0,NULL,'2025-10-08 08:33:04','2025-10-08 08:33:04','/products',NULL,'Produto de teste 1','Anel de Prata',NULL,NULL,NULL,NULL,NULL,'web',NULL,0,NULL),(2,'test-image-2.jpg','produto-002.jpg',200000,'image/jpeg',1024,768,0,0,0,0,NULL,'2025-10-08 08:33:04','2025-10-08 08:33:04','/products',NULL,'Produto de teste 2','Colar Artesanal',NULL,NULL,NULL,NULL,NULL,'web',NULL,0,NULL),(3,'test-image-3.jpg','banner-01.jpg',500000,'image/jpeg',1920,1080,0,0,0,0,NULL,'2025-10-08 08:33:04','2025-10-08 08:33:04','/banners',NULL,'Banner principal','Banner Hero',NULL,NULL,NULL,NULL,NULL,'web',NULL,0,NULL);
/*!40000 ALTER TABLE `media_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `media_files_complete`
--

DROP TABLE IF EXISTS `media_files_complete`;
/*!50001 DROP VIEW IF EXISTS `media_files_complete`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `media_files_complete` AS SELECT 
 1 AS `id`,
 1 AS `filename`,
 1 AS `original_filename`,
 1 AS `file_size`,
 1 AS `mime_type`,
 1 AS `width`,
 1 AS `height`,
 1 AS `has_thumbnail`,
 1 AS `has_medium`,
 1 AS `has_large`,
 1 AS `has_webp`,
 1 AS `uploaded_by`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `folder_path`,
 1 AS `tags`,
 1 AS `alt_text`,
 1 AS `title`,
 1 AS `description`,
 1 AS `dominant_color`,
 1 AS `dimensions`,
 1 AS `file_hash`,
 1 AS `edit_history`,
 1 AS `upload_source`,
 1 AS `processed_variants`,
 1 AS `seo_optimized`,
 1 AS `last_accessed_at`,
 1 AS `tag_names`,
 1 AS `folder_name`,
 1 AS `folder_color`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `media_folders`
--

DROP TABLE IF EXISTS `media_folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_folders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#667eea',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'folder',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `path` (`path`),
  KEY `idx_path` (`path`),
  KEY `idx_parent` (`parent_id`),
  CONSTRAINT `media_folders_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `media_folders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_folders`
--

LOCK TABLES `media_folders` WRITE;
/*!40000 ALTER TABLE `media_folders` DISABLE KEYS */;
INSERT INTO `media_folders` VALUES (1,'Products','/products',NULL,'Product images','#667eea','box','2025-10-08 08:16:24','2025-10-08 08:16:24'),(2,'Banners','/banners',NULL,'Hero and promotional banners','#f093fb','image','2025-10-08 08:16:24','2025-10-08 08:16:24'),(3,'Icons','/icons',NULL,'System icons and badges','#4facfe','star','2025-10-08 08:16:24','2025-10-08 08:16:24'),(4,'Documents','/documents',NULL,'PDFs and documents','#43e97b','file','2025-10-08 08:16:24','2025-10-08 08:16:24');
/*!40000 ALTER TABLE `media_folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_processing_jobs`
--

DROP TABLE IF EXISTS `media_processing_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_processing_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_id` int NOT NULL,
  `job_type` enum('resize','optimize','convert','watermark','ai_tag') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','processing','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `progress` int DEFAULT '0',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_file` (`file_id`),
  CONSTRAINT `media_processing_jobs_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_processing_jobs`
--

LOCK TABLES `media_processing_jobs` WRITE;
/*!40000 ALTER TABLE `media_processing_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_processing_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_tags`
--

DROP TABLE IF EXISTS `media_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#4facfe',
  `usage_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_tags`
--

LOCK TABLES `media_tags` WRITE;
/*!40000 ALTER TABLE `media_tags` DISABLE KEYS */;
INSERT INTO `media_tags` VALUES (1,'Featured','featured','Highlighted content','#667eea',0,'2025-10-08 08:16:24'),(2,'New','new','Recently added','#43e97b',0,'2025-10-08 08:16:24'),(3,'Sale','sale','On sale items','#f5576c',0,'2025-10-08 08:16:24'),(4,'Trending','trending','Popular items','#f093fb',0,'2025-10-08 08:16:24'),(5,'Handmade','handmade','Artisan products','#4facfe',0,'2025-10-08 08:16:24');
/*!40000 ALTER TABLE `media_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_usage`
--

DROP TABLE IF EXISTS `media_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_usage` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `media_id` int NOT NULL COMMENT 'FK to media_files',
  `used_in_table` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Table name where media is used (products, galleries, etc)',
  `used_in_id` int NOT NULL COMMENT 'Record ID in the referenced table',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When usage was recorded',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usage` (`media_id`,`used_in_table`,`used_in_id`),
  KEY `idx_media_id` (`media_id`),
  KEY `idx_usage` (`used_in_table`,`used_in_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_usage_media` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks media file usage across the system for safe deletion and orphan detection';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_usage`
--

LOCK TABLES `media_usage` WRITE;
/*!40000 ALTER TABLE `media_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stone_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_address` text COLLATE utf8mb4_unicode_ci,
  `customer_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('pending','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created` (`created_at`),
  KEY `idx_orders_customer_email` (`customer_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_analytics`
--

DROP TABLE IF EXISTS `product_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `date` date NOT NULL,
  `views` int DEFAULT '0',
  `cart_adds` int DEFAULT '0',
  `purchases` int DEFAULT '0',
  `revenue` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_date` (`product_id`,`date`),
  KEY `idx_analytics_date` (`date`),
  KEY `idx_analytics_product` (`product_id`),
  CONSTRAINT `product_analytics_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_analytics`
--

LOCK TABLES `product_analytics` WRITE;
/*!40000 ALTER TABLE `product_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_families`
--

DROP TABLE IF EXISTS `product_families`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_families` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_families`
--

LOCK TABLES `product_families` WRITE;
/*!40000 ALTER TABLE `product_families` DISABLE KEYS */;
INSERT INTO `product_families` VALUES (1,'PAN','Aneis',NULL,1,'2025-05-22 21:39:09','2025-05-22 21:39:09'),(2,'PPB','Brincos',NULL,1,'2025-05-22 21:39:09','2025-05-22 21:39:09'),(3,'PVO','Colares',NULL,1,'2025-05-22 21:39:09','2025-05-22 21:39:09'),(4,'PPU','Pulseiras',NULL,1,'2025-05-22 21:39:09','2025-05-22 21:39:09'),(5,'5','Pedras Naturais','',1,'2025-05-28 19:23:52','2025-05-28 19:24:09');
/*!40000 ALTER TABLE `product_families` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `media_id` int DEFAULT NULL COMMENT 'FK to media_files for advanced media management',
  `product_id` int NOT NULL,
  `image_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `idx_media_id` (`media_id`),
  KEY `idx_product_primary` (`product_id`,`is_primary`),
  KEY `idx_product_sort` (`product_id`,`sort_order`),
  CONSTRAINT `fk_product_image_media` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=192 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,NULL,1,'PAN0001.jpg',1,0,'2025-05-22 20:50:25'),(2,NULL,2,'PAN0002.jpg',1,0,'2025-05-22 20:50:25'),(3,NULL,3,'PAN0003.jpg',1,0,'2025-05-22 20:50:25'),(4,NULL,4,'PAN0004.jpg',1,0,'2025-05-22 20:50:25'),(5,NULL,5,'PAN0005.jpg',1,0,'2025-05-22 20:50:25'),(6,NULL,6,'PAN0006.jpg',1,0,'2025-05-22 20:50:25'),(7,NULL,7,'PAN0007.jpg',1,0,'2025-05-22 20:50:25'),(8,NULL,8,'PAN0008.jpg',1,0,'2025-05-22 20:50:25'),(9,NULL,9,'PAN0009.jpg',1,0,'2025-05-22 20:50:25'),(10,NULL,10,'PAN0010.jpg',1,0,'2025-05-22 20:50:25'),(11,NULL,11,'PAN0011.jpg',1,0,'2025-05-22 20:50:25'),(12,NULL,12,'PAN0012.jpg',1,0,'2025-05-22 20:50:25'),(13,NULL,13,'PAN0013.jpg',1,0,'2025-05-22 20:50:25'),(14,NULL,14,'PAN0014.jpg',1,0,'2025-05-22 20:50:25'),(15,NULL,15,'PAN0015.jpg',1,0,'2025-05-22 20:50:25'),(16,NULL,16,'PAN0016.jpg',1,0,'2025-05-22 20:50:25'),(17,NULL,17,'PAN0017.jpg',1,0,'2025-05-22 20:50:25'),(18,NULL,18,'PAN0018.jpg',1,0,'2025-05-22 20:50:25'),(19,NULL,19,'PAN0019.jpg',1,0,'2025-05-22 20:50:25'),(20,NULL,20,'PAN0020.jpg',1,0,'2025-05-22 20:50:25'),(21,NULL,21,'PAN0021.jpg',1,0,'2025-05-22 20:50:25'),(22,NULL,22,'PAN0022.jpg',1,0,'2025-05-22 20:50:25'),(23,NULL,23,'PAN0023.jpg',1,0,'2025-05-22 20:50:25'),(24,NULL,24,'PAN0024.jpg',1,0,'2025-05-22 20:50:25'),(25,NULL,25,'PAN0025.jpg',1,0,'2025-05-22 20:50:25'),(26,NULL,26,'PAN0026.jpg',1,0,'2025-05-22 20:50:25'),(27,NULL,27,'PAN0027.jpg',1,0,'2025-05-22 20:50:25'),(28,NULL,28,'PAN0028.jpg',1,0,'2025-05-22 20:50:25'),(29,NULL,29,'PAN0029.jpg',1,0,'2025-05-22 20:50:25'),(30,NULL,30,'PAN0030.jpg',1,0,'2025-05-22 20:50:25'),(31,NULL,31,'PAN0031.jpg',1,0,'2025-05-22 20:50:25'),(32,NULL,32,'PAN0032.jpg',1,0,'2025-05-22 20:50:25'),(33,NULL,33,'PAN0033.jpg',1,0,'2025-05-22 20:50:25'),(34,NULL,34,'PAN0034.jpg',1,0,'2025-05-22 20:50:25'),(35,NULL,35,'PAN0035.jpg',1,0,'2025-05-22 20:50:25'),(36,NULL,36,'PAN0036.jpg',1,0,'2025-05-22 20:50:25'),(37,NULL,37,'PAN0037.jpg',1,0,'2025-05-22 20:50:25'),(38,NULL,38,'PAN0038.jpg',1,0,'2025-05-22 20:50:25'),(39,NULL,39,'PAN0039.jpg',1,0,'2025-05-22 20:50:25'),(40,NULL,40,'PAN0040.jpg',1,0,'2025-05-22 20:50:25'),(41,NULL,41,'PAN0041.jpg',1,0,'2025-05-22 20:50:25'),(42,NULL,42,'PAN0042.jpg',1,0,'2025-05-22 20:50:25'),(43,NULL,43,'PAN0043.jpg',1,0,'2025-05-22 20:50:25'),(44,NULL,44,'PAN0044.jpg',1,0,'2025-05-22 20:50:25'),(45,NULL,45,'PAN0045.jpg',1,0,'2025-05-22 20:50:25'),(46,NULL,46,'PAN0046.jpg',1,0,'2025-05-22 20:50:25'),(47,NULL,47,'PAN0047.jpg',1,0,'2025-05-22 20:50:25'),(48,NULL,48,'PAN0048.jpg',1,0,'2025-05-22 20:50:25'),(49,NULL,49,'PAN0049.jpg',1,0,'2025-05-22 20:50:25'),(50,NULL,50,'PAN0050.jpg',1,0,'2025-05-22 20:50:25'),(51,NULL,51,'PAN0051.jpg',1,0,'2025-05-22 20:50:25'),(52,NULL,52,'PAN0052.jpg',1,0,'2025-05-22 20:50:25'),(53,NULL,53,'PAN0053.jpg',1,0,'2025-05-22 20:50:25'),(54,NULL,54,'PAN0054.jpg',1,0,'2025-05-22 20:50:25'),(55,NULL,55,'PAN0055.jpg',1,0,'2025-05-22 20:50:25'),(56,NULL,56,'PAN0056.jpg',1,0,'2025-05-22 20:50:25'),(57,NULL,57,'PAN0057.jpg',1,0,'2025-05-22 20:50:25'),(58,NULL,58,'PAN0058.jpg',1,0,'2025-05-22 20:50:25'),(59,NULL,59,'PAN0059.jpg',1,0,'2025-05-22 20:50:25'),(60,NULL,60,'PAN0060.jpg',1,0,'2025-05-22 20:50:25'),(61,NULL,61,'PAN0061.jpg',1,0,'2025-05-22 20:50:25'),(62,NULL,62,'PAN0062.jpg',1,0,'2025-05-22 20:50:25'),(63,NULL,63,'PAN0063.jpg',1,0,'2025-05-22 20:50:25'),(64,NULL,64,'PAN0064.jpg',1,0,'2025-05-22 20:50:25'),(65,NULL,65,'PAN0065.jpg',1,0,'2025-05-22 20:50:25'),(66,NULL,66,'PAN0066.jpg',1,0,'2025-05-22 20:50:25'),(67,NULL,67,'PAN0067.jpg',1,0,'2025-05-22 20:50:25'),(68,NULL,68,'PAN0068.jpg',1,0,'2025-05-22 20:50:25'),(69,NULL,69,'PAN0069.jpg',1,0,'2025-05-22 20:50:25'),(70,NULL,70,'PAN0070.jpg',1,0,'2025-05-22 20:50:25'),(71,NULL,71,'PAN0071.jpg',1,0,'2025-05-22 20:50:25'),(72,NULL,72,'PAN0072.jpg',1,0,'2025-05-22 20:50:25'),(73,NULL,73,'PAN0073.jpg',1,0,'2025-05-22 20:50:25'),(74,NULL,74,'PAN0074.jpg',1,0,'2025-05-22 20:50:25'),(75,NULL,75,'PAN0075.jpg',1,0,'2025-05-22 20:50:25'),(76,NULL,76,'PPB0001.jpg',1,0,'2025-05-22 20:50:25'),(77,NULL,77,'PPB0002.jpg',1,0,'2025-05-22 20:50:25'),(78,NULL,78,'PPB0003.jpg',1,0,'2025-05-22 20:50:25'),(79,NULL,79,'PPB0004.jpg',1,0,'2025-05-22 20:50:25'),(80,NULL,80,'PPB0005.jpg',1,0,'2025-05-22 20:50:25'),(81,NULL,81,'PPB0006.jpg',1,0,'2025-05-22 20:50:25'),(82,NULL,82,'PPB0007.jpg',1,0,'2025-05-22 20:50:25'),(83,NULL,83,'PPB0008.jpg',1,0,'2025-05-22 20:50:25'),(84,NULL,84,'PPB0009.jpg',1,0,'2025-05-22 20:50:25'),(85,NULL,85,'PPB0010.jpg',1,0,'2025-05-22 20:50:25'),(86,NULL,86,'PPB0011.jpg',1,0,'2025-05-22 20:50:25'),(87,NULL,87,'PPB0012.jpg',1,0,'2025-05-22 20:50:25'),(88,NULL,88,'PPB0013.jpg',1,0,'2025-05-22 20:50:25'),(89,NULL,89,'PPB0014.jpg',1,0,'2025-05-22 20:50:25'),(90,NULL,90,'PPB0015.jpg',1,0,'2025-05-22 20:50:25'),(91,NULL,91,'PPB0016.jpg',1,0,'2025-05-22 20:50:25'),(92,NULL,92,'PPB0017.jpg',1,0,'2025-05-22 20:50:25'),(93,NULL,93,'PPB0018.jpg',1,0,'2025-05-22 20:50:25'),(94,NULL,94,'PPB0019.jpg',1,0,'2025-05-22 20:50:25'),(95,NULL,95,'PPB0020.jpg',1,0,'2025-05-22 20:50:25'),(96,NULL,96,'PPB0021.jpg',1,0,'2025-05-22 20:50:25'),(97,NULL,97,'PPB0022.jpg',1,0,'2025-05-22 20:50:25'),(98,NULL,98,'PPB0023.jpg',1,0,'2025-05-22 20:50:25'),(99,NULL,99,'PPB0024.jpg',1,0,'2025-05-22 20:50:25'),(100,NULL,100,'PPB0025.jpg',1,0,'2025-05-22 20:50:25'),(101,NULL,101,'PPB0026.jpg',1,0,'2025-05-22 20:50:25'),(102,NULL,102,'PPB0027.jpg',1,0,'2025-05-22 20:50:25'),(103,NULL,103,'PPB0028.jpg',1,0,'2025-05-22 20:50:25'),(104,NULL,104,'PPB0029.jpg',1,0,'2025-05-22 20:50:25'),(105,NULL,105,'PPB0030.jpg',1,0,'2025-05-22 20:50:25'),(106,NULL,106,'PPB0031.jpg',1,0,'2025-05-22 20:50:25'),(107,NULL,107,'PPB0032.jpg',1,0,'2025-05-22 20:50:25'),(108,NULL,108,'PPB0033.jpg',1,0,'2025-05-22 20:50:25'),(109,NULL,109,'PPU0001.jpg',1,0,'2025-05-22 20:50:25'),(110,NULL,110,'PPU0002.jpg',1,0,'2025-05-22 20:50:25'),(111,NULL,111,'PPU0003.jpg',1,0,'2025-05-22 20:50:25'),(112,NULL,112,'PPU0004.jpg',1,0,'2025-05-22 20:50:25'),(113,NULL,113,'PPU0005.jpg',1,0,'2025-05-22 20:50:25'),(114,NULL,114,'PPU0006.jpg',1,0,'2025-05-22 20:50:25'),(115,NULL,115,'PPU0007.jpg',1,0,'2025-05-22 20:50:25'),(116,NULL,116,'PPU0008.jpg',1,0,'2025-05-22 20:50:25'),(117,NULL,117,'PPU0009.jpg',1,0,'2025-05-22 20:50:25'),(118,NULL,118,'PPU0010.jpg',1,0,'2025-05-22 20:50:25'),(119,NULL,119,'PPU0011.jpg',1,0,'2025-05-22 20:50:25'),(120,NULL,120,'PPU0012.jpg',1,0,'2025-05-22 20:50:25'),(121,NULL,121,'PPU0013.jpg',1,0,'2025-05-22 20:50:25'),(122,NULL,122,'PPU0014.jpg',1,0,'2025-05-22 20:50:25'),(123,NULL,123,'PPU0015.jpg',1,0,'2025-05-22 20:50:25'),(124,NULL,124,'PPU0016.jpg',1,0,'2025-05-22 20:50:25'),(125,NULL,125,'PPU0017.jpg',1,0,'2025-05-22 20:50:25'),(126,NULL,126,'PPU0018.jpg',1,0,'2025-05-22 20:50:25'),(127,NULL,127,'PPU0019.jpg',1,0,'2025-05-22 20:50:25'),(128,NULL,128,'PPU0020.jpg',1,0,'2025-05-22 20:50:25'),(129,NULL,129,'PPU0021.jpg',1,0,'2025-05-22 20:50:25'),(130,NULL,130,'PPU0022.jpg',1,0,'2025-05-22 20:50:25'),(131,NULL,131,'PPU0023.jpg',1,0,'2025-05-22 20:50:25'),(132,NULL,132,'PPU0024.jpg',1,0,'2025-05-22 20:50:25'),(133,NULL,133,'PPU0025.jpg',1,0,'2025-05-22 20:50:25'),(134,NULL,134,'PPU0026.jpg',1,0,'2025-05-22 20:50:25'),(135,NULL,135,'PPU0027.jpg',1,0,'2025-05-22 20:50:25'),(136,NULL,136,'PVO0001.jpg',1,0,'2025-05-22 20:50:25'),(137,NULL,137,'PPU0000.jpg',1,0,'2025-05-22 20:50:25'),(138,NULL,138,'PPU0028.jpg',1,0,'2025-05-22 20:50:25'),(139,NULL,139,'PPU0029.jpg',1,0,'2025-05-22 20:50:25'),(140,NULL,140,'PPU0030.jpg',1,0,'2025-05-22 20:50:25'),(141,NULL,141,'PPU0031.jpg',1,0,'2025-05-22 20:50:25'),(142,NULL,142,'PPU0032.jpg',1,0,'2025-05-22 20:50:25'),(143,NULL,143,'PPU0033.jpg',1,0,'2025-05-22 20:50:25'),(144,NULL,144,'PPU0034.jpg',1,0,'2025-05-22 20:50:25'),(145,NULL,145,'PPU0035.jpg',1,0,'2025-05-22 20:50:25'),(146,NULL,146,'PPU0036.jpg',1,0,'2025-05-22 20:50:25'),(147,NULL,147,'PPU0037.jpg',1,0,'2025-05-22 20:50:25'),(148,NULL,148,'PPU0038.jpg',1,0,'2025-05-22 20:50:25'),(149,NULL,149,'PPU0039.jpg',1,0,'2025-05-22 20:50:25'),(150,NULL,150,'PPU0040.jpg',1,0,'2025-05-22 20:50:25'),(151,NULL,151,'PPU0041.jpg',1,0,'2025-05-22 20:50:25'),(152,NULL,152,'PPU0042.jpg',1,0,'2025-05-22 20:50:25'),(153,NULL,153,'PPU0043.jpg',1,0,'2025-05-22 20:50:25'),(154,NULL,154,'PPU0044.jpg',1,0,'2025-05-22 20:50:25'),(155,NULL,155,'PPU0045.jpg',1,0,'2025-05-22 20:50:25'),(156,NULL,156,'PPU0046.jpg',1,0,'2025-05-22 20:50:25'),(157,NULL,157,'PPU0047.jpg',1,0,'2025-05-22 20:50:25'),(158,NULL,158,'PPU0048.jpg',1,0,'2025-05-22 20:50:25'),(159,NULL,159,'PPU0049.jpg',1,0,'2025-05-22 20:50:25'),(160,NULL,160,'PPU0050.jpg',1,0,'2025-05-22 20:50:25'),(161,NULL,161,'PPU0051.jpg',1,0,'2025-05-22 20:50:25'),(162,NULL,162,'PPU0052.jpg',1,0,'2025-05-22 20:50:25'),(163,NULL,163,'PPU0053.jpg',1,0,'2025-05-22 20:50:25'),(164,NULL,164,'PPU0054.jpg',1,0,'2025-05-22 20:50:25'),(165,NULL,165,'PPU0055.jpg',1,0,'2025-05-22 20:50:25'),(166,NULL,166,'PPU0056.jpg',1,0,'2025-05-22 20:50:25'),(167,NULL,167,'PPU0057.jpg',1,0,'2025-05-22 20:50:25'),(168,NULL,168,'PPU0058.jpg',1,0,'2025-05-22 20:50:25'),(169,NULL,169,'PPU0059.jpg',1,0,'2025-05-22 20:50:25'),(170,NULL,170,'PPU0060.jpg',1,0,'2025-05-22 20:50:25'),(171,NULL,171,'PPU0061.jpg',1,0,'2025-05-22 20:50:25'),(172,NULL,172,'PPU0062.jpg',1,0,'2025-05-22 20:50:25'),(173,NULL,173,'PPU0063.jpg',1,0,'2025-05-22 20:50:25'),(174,NULL,174,'PPU0064.jpg',1,0,'2025-05-22 20:50:25'),(175,NULL,175,'PPU0065.jpg',1,0,'2025-05-22 20:50:25'),(176,NULL,176,'PPU0066.jpg',1,0,'2025-05-22 20:50:25'),(177,NULL,177,'PPU0067.jpg',1,0,'2025-05-22 20:50:25'),(178,NULL,178,'PPU0068.jpg',1,0,'2025-05-22 20:50:25'),(179,NULL,179,'PPU0069.jpg',1,0,'2025-05-22 20:50:25'),(180,NULL,180,'PPU0070.jpg',1,0,'2025-05-22 20:50:25'),(181,NULL,181,'PPU0071.jpg',1,0,'2025-05-22 20:50:25'),(182,NULL,182,'PVO0002.jpg',1,0,'2025-05-22 20:50:25'),(183,NULL,183,'PVO0003.jpg',1,0,'2025-05-22 20:50:25'),(184,NULL,184,'PVO0004.jpg',1,0,'2025-05-22 20:50:25'),(185,NULL,185,'PVO0005.jpg',1,0,'2025-05-22 20:50:25'),(186,NULL,186,'PVO0006.jpg',1,0,'2025-05-22 20:50:25'),(187,NULL,187,'PVO0007.jpg',1,0,'2025-05-22 20:50:25'),(188,NULL,188,'PVO0008.jpg',1,0,'2025-05-22 20:50:25'),(190,NULL,190,'ONIX-001.jpg',1,1,'2025-10-09 11:01:17'),(191,NULL,191,'TIGER-001.jpg',1,1,'2025-10-09 11:01:17');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `family_id` int DEFAULT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `purchase_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `current_stock` int DEFAULT '0',
  `min_stock` int DEFAULT '5',
  `weight` decimal(10,3) DEFAULT '0.000',
  `active` tinyint(1) DEFAULT '1',
  `weight_unit` enum('g','kg') COLLATE utf8mb4_unicode_ci DEFAULT 'g',
  `dimensions` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'LxAxP em mm',
  `style` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `min_stock_level` int DEFAULT '0',
  `max_stock_level` int DEFAULT '0',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Localização no armazém',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `featured` tinyint(1) DEFAULT '0',
  `is_catalog_visible` tinyint(1) DEFAULT '1' COMMENT 'Whether the product is visible in the public catalog',
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL-friendly identifier',
  `stone_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Type of stone',
  `stone_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Display name of stone',
  `stone_origin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Geographic origin',
  `stone_properties` text COLLATE utf8mb4_unicode_ci COMMENT 'Metaphysical properties',
  `metal_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Prata 925' COMMENT 'Metal name',
  `metal_finish` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'prata_925' COMMENT 'Metal finish',
  `metal_purity` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '925' COMMENT 'Metal purity',
  `artisan_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Artisan name',
  `artisan_workshop` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Workshop name',
  `artisan_specialty` text COLLATE utf8mb4_unicode_ci COMMENT 'Artisan specialty',
  `crafting_technique` text COLLATE utf8mb4_unicode_ci COMMENT 'Crafting technique',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SEO title',
  `meta_description` text COLLATE utf8mb4_unicode_ci COMMENT 'SEO description',
  `views` int DEFAULT '0' COMMENT 'View counter',
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `family_id` (`family_id`),
  KEY `idx_products_created_by` (`created_by`),
  KEY `idx_products_updated_by` (`updated_by`),
  KEY `idx_products_reference` (`reference`),
  KEY `idx_products_name` (`name`),
  KEY `idx_active_featured` (`is_active`,`featured`),
  KEY `idx_family_active` (`family_id`,`is_active`),
  KEY `idx_search_name` (`name`(50)),
  KEY `idx_search_reference` (`reference`),
  KEY `idx_stock_status` (`current_stock`,`is_active`),
  KEY `idx_created_date` (`created_at`),
  KEY `idx_slug` (`slug`),
  KEY `idx_stone_type` (`stone_type`),
  KEY `idx_metal_finish` (`metal_finish`),
  KEY `idx_featured_active` (`featured`,`is_active`),
  CONSTRAINT `fk_products_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `product_families` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=206 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Produtos disponíveis para venda';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'PAN0001','PAN0001',1,'Produto PAN0001','Produto PAN0001',5.18,10.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 11:09:59',1,4,NULL,0,1,'produto-pan0001',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,4),(2,'PAN0002','PAN0002',1,'Produto PAN0002','Produto PAN0002 - PAN',5.18,10.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0002',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(3,'PAN0003','PAN0003',1,'Produto PAN0003','Produto PAN0003 - PAN',5.18,10.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0003',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(4,'PAN0004','PAN0004',1,'Produto PAN0004','Produto PAN0004 - PAN',5.18,10.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:45:47',1,4,NULL,1,1,'produto-pan0004',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,1),(5,'PAN0005','PAN0005',1,'Produto PAN0005','Produto PAN0005 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0005',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(6,'PAN0006','PAN0006',1,'Produto PAN0006','Produto PAN0006 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 15:40:11',1,4,NULL,1,1,'produto-pan0006',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,2),(7,'PAN0007','PAN0007',1,'Produto PAN0007','Produto PAN0007 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0007',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(8,'PAN0008','PAN0008',1,'Produto PAN0008','Produto PAN0008 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0008',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(9,'PAN0009','PAN0009',1,'Produto PAN0009','Produto PAN0009 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0009',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(10,'PAN0010','PAN0010',1,'Produto PAN0010','Produto PAN0010 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0010',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(11,'PAN0011','PAN0011',1,'Produto PAN0011','Produto PAN0011 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0011',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(12,'PAN0012','PAN0012',1,'Produto PAN0012','Produto PAN0012 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0012',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(13,'PAN0013','PAN0013',1,'Produto PAN0013','Produto PAN0013 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0013',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(14,'PAN0014','PAN0014',1,'Produto PAN0014','Produto PAN0014 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0014',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(15,'PAN0015','PAN0015',1,'Produto PAN0015','Produto PAN0015 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0015',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(16,'PAN0016','PAN0016',1,'Produto PAN0016','Produto PAN0016 - PAN',7.77,15.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0016',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(17,'PAN0017','PAN0017',1,'Produto PAN0017','Produto PAN0017 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0017',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(18,'PAN0018','PAN0018',1,'Produto PAN0018','Produto PAN0018 - PAN',7.77,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0018',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(19,'PAN0019','PAN0019',1,'Produto PAN0019','Produto PAN0019 - PAN',15.53,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0019',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(20,'PAN0020','PAN0020',1,'Produto PAN0020','Produto PAN0020 - PAN',15.53,30.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0020',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(21,'PAN0021','PAN0021',1,'Produto PAN0021','Produto PAN0021 - PAN',15.53,30.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0021',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(22,'PAN0022','PAN0022',1,'Produto PAN0022','Produto PAN0022 - PAN',15.53,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0022',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(23,'PAN0023','PAN0023',1,'Produto PAN0023','Produto PAN0023 - PAN',15.53,30.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0023',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(24,'PAN0024','PAN0024',1,'Produto PAN0024','Produto PAN0024 - PAN',15.53,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0024',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(25,'PAN0025','PAN0025',1,'Produto PAN0025','Produto PAN0025 - PAN',15.53,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0025',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(26,'PAN0026','PAN0026',1,'Produto PAN0026','Produto PAN0026 - PAN',7.77,15.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0026',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(27,'PAN0027','PAN0027',1,'Produto PAN0027','Produto PAN0027 - PAN',15.53,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0027',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(28,'PAN0028','PAN0028',1,'Produto PAN0028','Produto PAN0028 - PAN',15.53,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0028',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(29,'PAN0029','PAN0029',1,'Produto PAN0029','Produto PAN0029 - PAN',15.53,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0029',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(30,'PAN0030','PAN0030',1,'Produto PAN0030','Produto PAN0030 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0030',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(31,'PAN0031','PAN0031',1,'Produto PAN0031','Produto PAN0031 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0031',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(32,'PAN0032','PAN0032',1,'Produto PAN0032','Produto PAN0032 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0032',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(33,'PAN0033','PAN0033',1,'Produto PAN0033','Produto PAN0033 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0033',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(34,'PAN0034','PAN0034',1,'Produto PAN0034','Produto PAN0034 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0034',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(35,'PAN0035','PAN0035',1,'Produto PAN0035','Produto PAN0035 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0035',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(36,'PAN0036','PAN0036',1,'Produto PAN0036','Produto PAN0036 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0036',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(37,'PAN0037','PAN0037',1,'Produto PAN0037','Produto PAN0037 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0037',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(38,'PAN0038','PAN0038',1,'Produto PAN0038','Produto PAN0038 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0038',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(39,'PAN0039','PAN0039',1,'Produto PAN0039','Produto PAN0039 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0039',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(40,'PAN0040','PAN0040',1,'Produto PAN0040','Produto PAN0040 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0040',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(41,'PAN0041','PAN0041',1,'Produto PAN0041','Produto PAN0041 - PAN',0.00,15.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0041',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(42,'PAN0042','PAN0042',1,'Produto PAN0042','Produto PAN0042 - PAN',0.00,20.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0042',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(43,'PAN0043','PAN0043',1,'Produto PAN0043','Produto PAN0043 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0043',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(44,'PAN0044','PAN0044',1,'Produto PAN0044','Produto PAN0044 - PAN',0.00,25.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0044',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(45,'PAN0045','PAN0045',1,'Produto PAN0045','Produto PAN0045 - PAN',0.00,25.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0045',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(46,'PAN0046','PAN0046',1,'Produto PAN0046','Produto PAN0046 - PAN',0.00,25.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0046',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(47,'PAN0047','PAN0047',1,'Produto PAN0047','Produto PAN0047 - PAN',0.00,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0047',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(48,'PAN0048','PAN0048',1,'Produto PAN0048','Produto PAN0048 - PAN',0.00,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0048',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(49,'PAN0049','PAN0049',1,'Produto PAN0049','Produto PAN0049 - PAN',0.00,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0049',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(50,'PAN0050','PAN0050',1,'Produto PAN0050','Produto PAN0050 - PAN',0.00,25.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0050',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(51,'PAN0051','PAN0051',1,'Produto PAN0051','Produto PAN0051 - PAN',0.00,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0051',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(52,'PAN0052','PAN0052',1,'Produto PAN0052','Produto PAN0052 - PAN',0.00,35.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0052',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(53,'PAN0053','PAN0053',1,'Produto PAN0053','Produto PAN0053 - PAN',0.00,35.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0053',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(54,'PAN0054','PAN0054',1,'Produto PAN0054','Produto PAN0054 - PAN',0.00,35.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0054',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(55,'PAN0055','PAN0055',1,'Produto PAN0055','Produto PAN0055 - PAN',0.00,35.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0055',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(56,'PAN0056','PAN0056',1,'Produto PAN0056','Produto PAN0056 - PAN',0.00,35.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0056',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(57,'PAN0057','PAN0057',1,'Produto PAN0057','Produto PAN0057 - PAN',0.00,35.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0057',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(58,'PAN0058','PAN0058',1,'Produto PAN0058','Produto PAN0058 - PAN',0.00,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0058',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(59,'PAN0059','PAN0059',1,'Produto PAN0059','Produto PAN0059 - PAN',0.00,30.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0059',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(60,'PAN0060','PAN0060',1,'Produto PAN0060','Produto PAN0060 - PAN',0.00,35.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0060',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(61,'PAN0061','PAN0061',1,'Produto PAN0061','Produto PAN0061 - PAN',0.00,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0061',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(62,'PAN0062','PAN0062',1,'Produto PAN0062','Produto PAN0062 - PAN',0.00,35.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0062',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(63,'PAN0063','PAN0063',1,'Produto PAN0063','Produto PAN0063 - PAN',0.00,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0063',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(64,'PAN0064','PAN0064',1,'Produto PAN0064','Produto PAN0064 - PAN',0.00,30.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0064',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(65,'PAN0065','PAN0065',1,'Produto PAN0065','Produto PAN0065 - PAN',0.00,30.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0065',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(66,'PAN0066','PAN0066',1,'Produto PAN0066','Produto PAN0066 - PAN',0.00,50.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0066',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(67,'PAN0067','PAN0067',1,'Produto PAN0067','Produto PAN0067 - PAN',0.00,50.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0067',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(68,'PAN0068','PAN0068',1,'Produto PAN0068','Produto PAN0068 - PAN',0.00,50.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0068',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(69,'PAN0069','PAN0069',1,'Produto PAN0069','Produto PAN0069 - PAN',0.00,0.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0069',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(70,'PAN0070','PAN0070',1,'Produto PAN0070','Produto PAN0070 - PAN',0.00,30.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0070',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(71,'PAN0071','PAN0071',1,'Produto PAN0071','Produto PAN0071 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0071',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(72,'PAN0072','PAN0072',1,'Produto PAN0072','Produto PAN0072 - PAN',0.00,25.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0072',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(73,'PAN0073','PAN0073',1,'Produto PAN0073','Produto PAN0073 - PAN',0.00,15.00,1,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0073',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(74,'PAN0074','PAN0074',1,'Produto PAN0074','Produto PAN0074 - PAN',0.00,0.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0074',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(75,'PAN0075','PAN0075',1,'Produto PAN0075','Produto PAN0075 - PAN',0.00,0.00,0,0,0.000,1,'g','','PAN','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pan0075',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(76,'PPB0001','PPB0001',2,'Produto PPB0001','Produto PPB0001 - PPB',5.18,10.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0001',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(77,'PPB0002','PPB0002',2,'Produto PPB0002','Produto PPB0002 - PPB',5.18,10.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0002',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(78,'PPB0003','PPB0003',2,'Produto PPB0003','Produto PPB0003 - PPB',5.18,10.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0003',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(79,'PPB0004','PPB0004',2,'Produto PPB0004','Produto PPB0004 - PPB',5.18,10.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0004',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(80,'PPB0005','PPB0005',2,'Produto PPB0005','Produto PPB0005 - PPB',5.18,10.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0005',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(81,'PPB0006','PPB0006',2,'Produto PPB0006','Produto PPB0006 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0006',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(82,'PPB0007','PPB0007',2,'Produto PPB0007','Produto PPB0007 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0007',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(83,'PPB0008','PPB0008',2,'Produto PPB0008','Produto PPB0008 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0008',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(84,'PPB0009','PPB0009',2,'Produto PPB0009','Produto PPB0009 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0009',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(85,'PPB0010','PPB0010',2,'Produto PPB0010','Produto PPB0010 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0010',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(86,'PPB0011','PPB0011',2,'Produto PPB0011','Produto PPB0011 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0011',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(87,'PPB0012','PPB0012',2,'Produto PPB0012','Produto PPB0012 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0012',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(88,'PPB0013','PPB0013',2,'Produto PPB0013','Produto PPB0013 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0013',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(89,'PPB0014','PPB0014',2,'Produto PPB0014','Produto PPB0014 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0014',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(90,'PPB0015','PPB0015',2,'Produto PPB0015','Produto PPB0015 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0015',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(91,'PPB0016','PPB0016',2,'Produto PPB0016','Produto PPB0016 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0016',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(92,'PPB0017','PPB0017',2,'Produto PPB0017','Produto PPB0017 - PPB',7.77,15.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0017',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(93,'PPB0018','PPB0018',2,'Produto PPB0018','Produto PPB0018 - PPB',10.35,20.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0018',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(94,'PPB0019','PPB0019',2,'Produto PPB0019','Produto PPB0019 - PPB',10.35,20.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0019',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(95,'PPB0020','PPB0020',2,'Produto PPB0020','Produto PPB0020 - PPB',10.35,20.00,0,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0020',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(96,'PPB0021','PPB0021',2,'Produto PPB0021','Produto PPB0021 - PPB',10.35,20.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0021',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(97,'PPB0022','PPB0022',2,'Produto PPB0022','Produto PPB0022 - PPB',10.35,20.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0022',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(98,'PPB0023','PPB0023',2,'Produto PPB0023','Produto PPB0023 - PPB',18.12,35.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0023',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(99,'PPB0024','PPB0024',2,'Produto PPB0024','Produto PPB0024 - PPB',18.12,35.00,0,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0024',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(100,'PPB0025','PPB0025',2,'Produto PPB0025','Produto PPB0025 - PPB',20.71,40.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0025',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(101,'PPB0026','PPB0026',2,'Produto PPB0026','Produto PPB0026 - PPB',0.00,20.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0026',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(102,'PPB0027','PPB0027',2,'Produto PPB0027','Produto PPB0027 - PPB',0.00,25.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0027',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(103,'PPB0028','PPB0028',2,'Produto PPB0028','Produto PPB0028 - PPB',0.00,25.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0028',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(104,'PPB0029','PPB0029',2,'Produto PPB0029','Produto PPB0029 - PPB',0.00,25.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0029',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(105,'PPB0030','PPB0030',2,'Produto PPB0030','Produto PPB0030 - PPB',0.00,25.00,0,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0030',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(106,'PPB0031','PPB0031',2,'Produto PPB0031','Produto PPB0031 - PPB',0.00,30.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0031',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(107,'PPB0032','PPB0032',2,'Produto PPB0032','Produto PPB0032 - PPB',0.00,35.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0032',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(108,'PPB0033','PPB0033',2,'Produto PPB0033','Produto PPB0033 - PPB',0.00,40.00,1,0,0.000,1,'g','','PPB','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppb0033',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(109,'PPU0001','PPU0001',4,'Produto PPU0001','Produto PPU0001 - PPU',93.18,180.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0001',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(110,'PPU0002','PPU0002',4,'Produto PPU0002','Produto PPU0002 - PPU',93.18,180.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0002',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(111,'PPU0003','PPU0003',4,'Produto PPU0003','Produto PPU0003 - PPU',28.47,55.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0003',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(112,'PPU0004','PPU0004',4,'Produto PPU0004','Produto PPU0004 - PPU',98.36,190.00,0,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0004',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(113,'PPU0005','PPU0005',4,'Produto PPU0005','Produto PPU0005 - PPU',20.71,40.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0005',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(114,'PPU0006','PPU0006',4,'Produto PPU0006','Produto PPU0006 - PPU',62.12,140.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0006',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(115,'PPU0007','PPU0007',4,'Produto PPU0007','Produto PPU0007 - PPU',67.30,130.00,0,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,4,NULL,1,1,'produto-ppu0007',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(116,'PPU0008','PPU0008',4,'Produto PPU0008','Produto PPU0008 - PPU',23.30,35.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0008',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(117,'PPU0009','PPU0009',4,'Produto PPU0009','Produto PPU0009 - PPU',10.35,20.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 11:02:12',1,4,NULL,1,1,'produto-ppu0009',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,1),(118,'PPU0010','PPU0010',4,'Produto PPU0010','Produto PPU0010 - PPU',15.53,30.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0010',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(119,'PPU0011','PPU0011',4,'Produto PPU0011','Produto PPU0011 - PPU',20.71,30.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0011',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(120,'PPU0012','PPU0012',4,'Produto PPU0012','Produto PPU0012 - PPU',20.71,35.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0012',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(121,'PPU0013','PPU0013',4,'Produto PPU0013','Produto PPU0013 - PPU',18.12,35.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0013',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(122,'PPU0014','PPU0014',4,'Produto PPU0014','Produto PPU0014 - PPU',28.47,55.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0014',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(123,'PPU0015','PPU0015',4,'Produto PPU0015','Produto PPU0015 - PPU',20.71,40.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0015',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(124,'PPU0016','PPU0016',4,'Produto PPU0016','Produto PPU0016 - PPU',38.83,60.00,0,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0016',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(125,'PPU0017','PPU0017',4,'Produto PPU0017','Produto PPU0017 - PPU',31.06,60.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0017',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(126,'PPU0018','PPU0018',4,'Produto PPU0018','Produto PPU0018 - PPU',62.12,130.00,0,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0018',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(127,'PPU0019','PPU0019',4,'Produto PPU0019','Produto PPU0019 - PPU',31.06,60.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0019',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(128,'PPU0020','PPU0020',4,'Produto PPU0020','Produto PPU0020 - PPU',31.06,60.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0020',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(129,'PPU0021','PPU0021',4,'Produto PPU0021','Produto PPU0021 - PPU',20.71,40.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0021',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(130,'PPU0022','PPU0022',4,'Produto PPU0022','Produto PPU0022 - PPU',10.35,20.00,0,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0022',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(131,'PPU0023','PPU0023',4,'Produto PPU0023','Produto PPU0023 - PPU',18.12,35.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0023',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(132,'PPU0024','PPU0024',4,'Produto PPU0024','Produto PPU0024 - PPU',15.53,30.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0024',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(133,'PPU0025','PPU0025',4,'Produto PPU0025','Produto PPU0025 - PPU',19.41,37.50,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0025',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(134,'PPU0026','PPU0026',4,'Produto PPU0026','Produto PPU0026 - PPU',36.24,70.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0026',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(135,'PPU0027','PPU0027',4,'Produto PPU0027','Produto PPU0027 - PPU',33.65,65.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0027',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(136,'PVO0001','PVO0001',3,'Produto PVO0001','Produto PVO0001 - PVO',0.00,160.00,1,0,0.000,1,'g','','PVO','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pvo0001',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(137,'PPU0000','PPU0000',4,'Produto PPU0000','Produto PPU0000 - PPU',38.83,75.00,0,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0000',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(138,'PPU0028','PPU0028',4,'Produto PPU0028','Produto PPU0028 - PPU',0.00,110.00,1,0,36.000,1,'g','21','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0028',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(139,'PPU0029','PPU0029',4,'Produto PPU0029','Produto PPU0029 - PPU',0.00,110.00,1,0,34.000,1,'g','20.5','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0029',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(140,'PPU0030','PPU0030',4,'Produto PPU0030','Produto PPU0030 - PPU',0.00,125.00,1,0,41.000,1,'g','19','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0030',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(141,'PPU0031','PPU0031',4,'Produto PPU0031','Produto PPU0031 - PPU',0.00,135.00,2,0,43.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0031',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(142,'PPU0032','PPU0032',4,'Produto PPU0032','Produto PPU0032 - PPU',0.00,135.00,0,0,45.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0032',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(143,'PPU0033','PPU0033',4,'Produto PPU0033','Produto PPU0033 - PPU',0.00,135.00,1,0,45.000,1,'g','21','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0033',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(144,'PPU0034','PPU0034',4,'Produto PPU0034','Produto PPU0034 - PPU',0.00,135.00,1,0,46.000,1,'g','21.5','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0034',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(145,'PPU0035','PPU0035',4,'Produto PPU0035','Produto PPU0035 - PPU',0.00,140.00,1,0,46.000,1,'g','20.5','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0035',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(146,'PPU0036','PPU0036',4,'Produto PPU0036','Produto PPU0036 - PPU',0.00,15.00,2,0,45752.000,1,'g','19','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0036',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(147,'PPU0037','PPU0037',4,'Produto PPU0037','Produto PPU0037 - PPU',0.00,180.00,0,0,60.000,1,'g','21','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0037',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(148,'PPU0038','PPU0038',4,'Produto PPU0038','Produto PPU0038 - PPU',0.00,185.00,1,0,62.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0038',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(149,'PPU0039','PPU0039',4,'Produto PPU0039','Produto PPU0039 - PPU',0.00,20.00,0,0,6.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0039',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(150,'PPU0040','PPU0040',4,'Produto PPU0040','Produto PPU0040 - PPU',0.00,20.00,1,0,7.000,1,'g','18','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0040',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(151,'PPU0041','PPU0041',4,'Produto PPU0041','Produto PPU0041 - PPU',0.00,25.00,2,0,8.000,1,'g','18','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0041',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(152,'PPU0042','PPU0042',4,'Produto PPU0042','Produto PPU0042 - PPU',0.00,25.00,1,0,8.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0042',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(153,'PPU0043','PPU0043',4,'Produto PPU0043','Produto PPU0043 - PPU',0.00,30.00,1,0,10.000,1,'g','19','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0043',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(154,'PPU0044','PPU0044',4,'Produto PPU0044','Produto PPU0044 - PPU',0.00,30.00,1,0,10.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0044',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(155,'PPU0045','PPU0045',4,'Produto PPU0045','Produto PPU0045 - PPU',0.00,30.00,1,0,10.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0045',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(156,'PPU0046','PPU0046',4,'Produto PPU0046','Produto PPU0046 - PPU',0.00,30.00,0,0,10.000,1,'g','22','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0046',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(157,'PPU0047','PPU0047',4,'Produto PPU0047','Produto PPU0047 - PPU',0.00,30.00,1,0,9.000,1,'g','17','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0047',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(158,'PPU0048','PPU0048',4,'Produto PPU0048','Produto PPU0048 - PPU',0.00,30.00,1,0,9.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0048',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(159,'PPU0049','PPU0049',4,'Produto PPU0049','Produto PPU0049 - PPU',0.00,30.00,1,0,9.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0049',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(160,'PPU0050','PPU0050',4,'Produto PPU0050','Produto PPU0050 - PPU',0.00,30.00,1,0,9.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0050',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(161,'PPU0051','PPU0051',4,'Produto PPU0051','Produto PPU0051 - PPU',0.00,30.00,0,0,12.000,1,'g','18.5','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0051',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(162,'PPU0052','PPU0052',4,'Produto PPU0052','Produto PPU0052 - PPU',0.00,35.00,1,0,12.000,1,'g','19','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0052',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(163,'PPU0053','PPU0053',4,'Produto PPU0053','Produto PPU0053 - PPU',0.00,40.00,1,0,12.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0053',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(164,'PPU0054','PPU0054',4,'Produto PPU0054','Produto PPU0054 - PPU',0.00,30.00,1,0,13.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0054',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(165,'PPU0055','PPU0055',4,'Produto PPU0055','Produto PPU0055 - PPU',0.00,40.00,1,0,13.000,1,'g','19','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0055',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(166,'PPU0056','PPU0056',4,'Produto PPU0056','Produto PPU0056 - PPU',0.00,40.00,1,0,13.000,1,'g','20','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0056',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(167,'PPU0057','PPU0057',4,'Produto PPU0057','Produto PPU0057 - PPU',0.00,40.00,1,0,13.000,1,'g','22','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0057',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(168,'PPU0058','PPU0058',4,'Produto PPU0058','Produto PPU0058 - PPU',0.00,90.00,1,0,29.000,1,'g','20.5','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0058',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(169,'PPU0059','PPU0059',4,'Produto PPU0059','Produto PPU0059 - PPU',0.00,40.00,1,0,0.000,1,'g','19','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0059',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(170,'PPU0060','PPU0060',4,'Produto PPU0060','Produto PPU0060 - PPU',0.00,75.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0060',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(171,'PPU0061','PPU0061',4,'Produto PPU0061','Produto PPU0061 - PPU',0.00,60.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0061',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(172,'PPU0062','PPU0062',4,'Produto PPU0062','Produto PPU0062 - PPU',0.00,40.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0062',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(173,'PPU0063','PPU0063',4,'Produto PPU0063','Produto PPU0063 - PPU',0.00,60.00,0,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0063',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(174,'PPU0064','PPU0064',4,'Produto PPU0064','Produto PPU0064 - PPU',0.00,60.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0064',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(175,'PPU0065','PPU0065',4,'Produto PPU0065','Produto PPU0065 - PPU',0.00,25.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0065',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(176,'PPU0066','PPU0066',4,'Produto PPU0066','Produto PPU0066 - PPU',0.00,60.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,1,1,'produto-ppu0066',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(177,'PPU0067','PPU0067',4,'Produto PPU0067','Produto PPU0067 - PPU',0.00,15.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0067',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(178,'PPU0068','PPU0068',4,'Produto PPU0068','Produto PPU0068 - PPU',0.00,15.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,1,1,'produto-ppu0068',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(179,'PPU0069','PPU0069',4,'Produto PPU0069','Produto PPU0069 - PPU',0.00,10.00,2,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0069',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(180,'PPU0070','PPU0070',4,'Produto PPU0070','Produto PPU0070 - PPU',0.00,10.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,1,1,'produto-ppu0070',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(181,'PPU0071','PPU0071',4,'Produto PPU0071','Produto PPU0071 - PPU',0.00,10.00,1,0,0.000,1,'g','','PPU','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-ppu0071',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(182,'PVO0002','PVO0002',3,'Produto PVO0002','Produto PVO0002 - PVO',0.00,150.00,0,0,0.000,1,'g','','PVO','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,1,1,'produto-pvo0002',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(183,'PVO0003','PVO0003',3,'Produto PVO0003','Produto PVO0003 - PVO',0.00,30.00,1,0,0.000,1,'g','','PVO','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pvo0003',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(184,'PVO0004','PVO0004',3,'Produto PVO0004','Produto PVO0004 - PVO',0.00,30.00,2,0,0.000,1,'g','','PVO','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,1,1,'produto-pvo0004',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(185,'PVO0005','PVO0005',3,'Produto PVO0005','Produto PVO0005 - PVO',0.00,50.00,1,0,0.000,1,'g','','PVO','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,4,NULL,1,1,'produto-pvo0005',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(186,'PVO0006','PVO0006',3,'Produto PVO0006','Produto PVO0006 - PVO',0.00,10.00,1,0,0.000,1,'g','','PVO','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pvo0006',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(187,'PVO0007','PVO0007',3,'Produto PVO0007','Produto PVO0007 - PVO',0.00,15.00,2,0,0.000,1,'g','','PVO','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pvo0007',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(188,'PVO0008','PVO0008',3,'Produto PVO0008','Produto PVO0008 - PVO',0.00,30.00,1,0,0.000,1,'g','','PVO','Prata 925',NULL,1,0,0,'','2025-05-22 14:56:57','2025-10-09 09:29:48',1,1,NULL,0,1,'produto-pvo0008',NULL,NULL,NULL,NULL,'Prata 925','prata_925','925',NULL,NULL,NULL,NULL,NULL,NULL,0),(190,'ONIX-001',NULL,1,'Anel Ónix Proteção','Anel artesanal em ónix brasileiro e prata 925. Peça única que combina a força ancestral do ónix negro com acabamento em prata polida. Ideal para proteção energética e estilo atemporal.',29.90,59.90,5,5,8.500,1,'g','18mm x 12mm x 8mm',NULL,NULL,NULL,1,0,0,NULL,'2025-10-09 09:30:45','2025-10-09 12:03:04',NULL,NULL,NULL,1,1,'anel-onix-protecao','onix','Ónix Negro','Brasil - Minas Gerais','Proteção contra energia negativa, força interior, estabilidade emocional','Prata 925','prata_925','925','Maria Santos','Atelier Terra Sagrada','Especialista em pedras de proteção há 15 anos','Cravação tradicional com garra dupla em prata oxidada','Anel Ónix Proteção - Prata 925 Artesanal | Gonzaga Art & Shine','Anel artesanal em ónix brasileiro e prata 925. Proteção ancestral em design contemporâneo.',21),(191,'TIGER-001',NULL,1,'Colar Olho-de-tigre Coragem','Colar pendente em olho-de-tigre natural com veios dourados únicos, montado em prata 925. Cada pedra é selecionada pela intensidade dos reflexos dourados. Desperta coragem e clareza mental.',44.90,89.90,3,5,12.300,1,'g','Pendente: 25mm x 18mm, Corrente: 50cm',NULL,NULL,NULL,1,0,0,NULL,'2025-10-09 09:30:45','2025-10-09 10:59:20',NULL,NULL,NULL,1,1,'colar-olho-tigre-coragem','olho-de-tigre','Olho-de-tigre Natural','África do Sul - Northern Cape','Coragem, clareza mental, proteção energética, força de vontade','Prata 925','prata_925','925','João Silva','Oficina Dourada','Mestre em lapidação de pedras chatoyant há 20 anos','Lapidação cabochão com polimento espelhado, montagem bezel','Colar Olho-de-tigre Coragem - Prata 925 | Gonzaga Art & Shine','Colar artesanal com olho-de-tigre da África do Sul e prata 925. Energia autêntica.',3),(192,'AMETHYST-001',NULL,NULL,'Anel Ametista Serenidade','Anel artesanal em prata 925 com ametista natural do Brasil. Tom violeta profundo que acalma a mente e desperta a sabedoria interior. Cada cristal é único, carregando a energia da transformação espiritual.',35.00,79.90,5,5,0.000,1,'g',NULL,'anel',NULL,NULL,1,0,0,NULL,'2025-10-09 12:01:44','2025-10-09 12:01:44',NULL,NULL,NULL,0,1,'anel-ametista-serenidade-191','ametista','Ametista','Brasil','Cristal de quartzo com ferro oxidado, promove clareza mental e calma interior','Prata 925','prata_925','925','Maria Silva','Oficina do Cristal','Especialista em engastes de cristais',NULL,NULL,NULL,0),(193,'TURQUOISE-001',NULL,NULL,'Colar Turquesa Proteção','Colar artesanal em prata 925 com turquesa autêntica da Turquia. Azul celestial que protege viajantes e conecta céu e terra. Amuleto sagrado usado há milênios por civilizações ancestrais.',42.00,99.90,3,5,0.000,1,'g',NULL,'colar',NULL,NULL,1,0,0,NULL,'2025-10-09 12:01:44','2025-10-09 12:01:44',NULL,NULL,NULL,0,1,'colar-turquesa-protecao-192','turquesa','Turquesa','Turquia','Fosfato de cobre e alumínio, pedra de proteção milenar e cura emocional','Prata 925','prata_925','925','João Costa','Atelier da Terra','Mestre em joalharia ancestral',NULL,NULL,NULL,0),(194,'AMETHYST-NECKLACE-001',NULL,NULL,'Colar Ametista Intuição','Colar artesanal em prata 925 com ametista brasileira facetada. Cristal violeta que desperta a intuição e promove conexão espiritual profunda.',38.00,89.90,8,5,0.000,1,'g',NULL,'colar',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'colar-ametista-intuicao','ametista','Ametista','Brasil - Minas Gerais','Quartzo violeta com ferro, facilita meditação e intuição','Prata 925','prata_925','925','Helena Costa','Atelier Cristal Violeta','Especialista em cristais e joalharia espiritual',NULL,NULL,NULL,0),(195,'AMETHYST-BRACELET-001',NULL,NULL,'Pulseira Ametista Transmutação','Pulseira delicada com ametistas facetadas brasileiras. Transmuta energias densas em clareza e serenidade cristalina espiritual.',35.00,79.90,12,5,0.000,1,'g',NULL,'pulseira',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'pulseira-ametista-transmutacao','ametista','Ametista','Brasil - Minas Gerais','Cristais facetados 6mm, energia de transmutação','Prata 925','prata_925','925','Helena Costa','Atelier Cristal Violeta','Montagem elástica especializada',NULL,NULL,NULL,0),(196,'AMETHYST-EARRINGS-001',NULL,NULL,'Brincos Ametista Clareza','Brincos elegantes em prata 925 com ametistas brasileiras naturais. Clareza mental e serenidade em design minimalista sofisticado.',30.00,69.90,15,5,0.000,1,'g',NULL,'brincos',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'brincos-ametista-clareza','ametista','Ametista','Brasil - Minas Gerais','Cristais gota naturais, promovem clareza e calma','Prata 925','prata_925','925','Helena Costa','Atelier Cristal Violeta','Design minimalista premium',NULL,NULL,NULL,0),(197,'TURQUOISE-RING-001',NULL,NULL,'Anel Turquesa Proteção','Anel artesanal em turquesa tibetana autêntica. Proteção ancestral dos oceanos em design contemporâneo minimalista elegante.',40.00,89.90,7,5,0.000,1,'g',NULL,'anel',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'anel-turquesa-protecao','turquesa','Turquesa','Tibete - Planalto Changtang','Gema porosa, proteção de viajantes','Prata 925','prata_925','925','Carlos Mendes','Oficina Oceano Antigo','Cravação tradicional tibetana',NULL,NULL,NULL,0),(198,'TURQUOISE-PENDANT-001',NULL,NULL,'Pingente Turquesa Ancestral','Pingente artesanal com turquesa bruta do Arizona. Sabedoria ancestral e autenticidade em forma pura natural preservada.',32.00,69.90,9,5,0.000,1,'g',NULL,'pingente',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'pingente-turquesa-ancestral','turquesa','Turquesa','Arizona - Sleeping Beauty Mine','Turquesa bruta com matrix, sabedoria antiga','Prata 925','prata_925','925','Carlos Mendes','Oficina Oceano Antigo','Lapidação irregular preservando matrix',NULL,NULL,NULL,0),(199,'TURQUOISE-EARRINGS-001',NULL,NULL,'Brincos Turquesa Comunicação','Brincos discretos em turquesa iraniana. Promovem comunicação autêntica e expressão verdadeira do ser interior mais profundo.',28.00,59.90,15,5,0.000,1,'g',NULL,'brincos',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'brincos-turquesa-comunicacao','turquesa','Turquesa','Irão - Minas de Nishapur','Turquesas calibradas, chakra garganta','Prata 925','prata_925','925','Carlos Mendes','Oficina Oceano Antigo','Montagem minimalista delicada',NULL,NULL,NULL,0),(200,'ONIX-NECKLACE-001',NULL,NULL,'Colar Ónix Presença','Colar statement em ónix mexicano. Presença magnética e força ancestral em design bold contemporâneo sofisticado.',65.00,159.90,4,5,0.000,1,'g',NULL,'colar',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'colar-onix-presenca','onix','Ónix','México - Baja California','Ónix negro puro, presença e autoridade','Prata 925','prata_925','925','Maria Santos','Atelier Terra Sagrada','Lapidação statement com corrente artesanal',NULL,NULL,NULL,0),(201,'ONIX-EARRINGS-001',NULL,NULL,'Brincos Ónix Elegância','Brincos minimalistas em ónix indiano. Elegância urbana e sofisticação discreta para o quotidiano alternativo contemporâneo.',32.00,69.90,18,5,0.000,1,'g',NULL,'brincos',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'brincos-onix-elegancia','onix','Ónix','Índia - Rajasthan','Ónix facetado quadrado, elegância discreta','Prata 925','prata_925','925','Maria Santos','Atelier Terra Sagrada','Cravação quadrada minimalista fosca',NULL,NULL,NULL,0),(202,'ONIX-BRACELET-001',NULL,NULL,'Pulseira Ónix Força','Pulseira unissex em ónix brasileiro. Força interior e proteção discreta em design robusto contemporâneo minimalista.',38.00,89.90,10,5,0.000,1,'g',NULL,'pulseira',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'pulseira-onix-forca','onix','Ónix','Brasil - Minas Gerais','Esferas ónix polidas 8mm, força masculina','Prata 925','prata_925','925','Maria Santos','Atelier Terra Sagrada','Montagem masculina robusta',NULL,NULL,NULL,0),(203,'TIGER-RING-001',NULL,NULL,'Anel Olho-de-tigre Poder','Anel masculino em olho-de-tigre sul-africano. Poder terrestre e liderança natural em design robusto elegante contemporâneo.',42.00,99.90,6,5,0.000,1,'g',NULL,'anel',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'anel-olho-de-tigre-poder','olho-de-tigre','Olho-de-tigre','África do Sul - Northern Cape','Cabochão oval chatoyant, liderança','Prata 925','prata_925','925','João Silva','Oficina Dourada','Lapidação cabochão com setting duplo',NULL,NULL,NULL,0),(204,'TIGER-BRACELET-001',NULL,NULL,'Pulseira Olho-de-tigre Coragem','Pulseira unissex em olho-de-tigre australiano. Coragem quotidiana e energia solar em design versátil contemporâneo.',35.00,79.90,14,5,0.000,1,'g',NULL,'pulseira',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'pulseira-olho-de-tigre-coragem','olho-de-tigre','Olho-de-tigre','Austrália - Pilbara Region','Esferas chatoyantes 7mm, coragem diária','Prata 925','prata_925','925','João Silva','Oficina Dourada','Montagem elástica com esferas chatoyantes',NULL,NULL,NULL,0),(205,'TIGER-EARRINGS-001',NULL,NULL,'Brincos Olho-de-tigre Charme','Brincos femininos em olho-de-tigre brasileiro. Feminilidade poderosa e charme solar em design elegante delicado.',34.00,79.90,11,5,0.000,1,'g',NULL,'brincos',NULL,NULL,1,0,0,NULL,'2025-10-09 12:26:12','2025-10-09 12:26:12',NULL,NULL,NULL,0,1,'brincos-olho-de-tigre-charme','olho-de-tigre','Olho-de-tigre','Brasil - Minas Gerais','Lapidação gota chatoyante, feminilidade solar','Prata 925','prata_925','925','João Silva','Oficina Dourada','Lapidação gota com chatoyância realçada',NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `featured_carousel_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `catalog_page_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `hide_catalog_prices` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Hide prices in catalog, show price on request instead',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,1,1,0,'2025-06-01 14:08:28','2025-09-16 10:28:20');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrador','admin@gonzagas.com','$2b$10$OpQSfinNzajl/Ze7RMsaV.jOD38f5YwpUI.aeFy6Wt7obObCxjA8a','admin','2025-05-22 16:42:08','2025-05-22 17:36:43'),(3,'Gonzaga','g.art.shine@gmail.com','b02IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin','2025-05-22 21:00:07','2025-07-17 16:32:14'),(4,'mike','miguelmelo70@gmail.com','$2b$10$ZXMBcvchUbbmYgwnaySSOe1pVtY5Wt4iwpK2CEDi5ytQTGWwOuC9u','admin','2025-05-22 21:04:15','2025-05-22 21:14:55'),(5,'Gonzaga','gonzaga@artnshine.pt','$2a$10$goRYOLkXUINjrAHNIYFoZuVp06S.k.sQpsEOgC3dN9XRuzOezja46','admin','2025-07-17 16:32:05','2025-07-17 16:32:05'),(6,'gonzaga_dev','dev@gonzagas.pt','$2a$10$WErksdNsu1.4mZEd0gCLquHghDr54XXJgHpXak4nOWsi63GdibhT2','admin','2025-10-07 21:51:31','2025-10-07 21:51:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `catalog_products_optimized`
--

/*!50001 DROP VIEW IF EXISTS `catalog_products_optimized`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`gonzagas_dev`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `catalog_products_optimized` AS select `p`.`id` AS `id`,`p`.`reference` AS `reference`,`p`.`name` AS `name`,`p`.`description` AS `description`,`p`.`sale_price` AS `sale_price`,`p`.`style` AS `style`,`p`.`material` AS `material`,`p`.`featured` AS `featured`,`p`.`current_stock` AS `current_stock`,`p`.`created_at` AS `created_at`,`pf`.`name` AS `family_name`,`pf`.`id` AS `family_id`,(select `pi`.`image_filename` from `product_images` `pi` where ((`pi`.`product_id` = `p`.`id`) and (`pi`.`is_primary` = 1)) limit 1) AS `main_image`,(select count(0) from `product_images` `pi2` where (`pi2`.`product_id` = `p`.`id`)) AS `image_count` from (`products` `p` left join `product_families` `pf` on((`p`.`family_id` = `pf`.`id`))) where (`p`.`is_active` = 1) order by `p`.`featured` desc,`p`.`created_at` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `media_files_complete`
--

/*!50001 DROP VIEW IF EXISTS `media_files_complete`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `media_files_complete` AS select `mf`.`id` AS `id`,`mf`.`filename` AS `filename`,`mf`.`original_filename` AS `original_filename`,`mf`.`file_size` AS `file_size`,`mf`.`mime_type` AS `mime_type`,`mf`.`width` AS `width`,`mf`.`height` AS `height`,`mf`.`has_thumbnail` AS `has_thumbnail`,`mf`.`has_medium` AS `has_medium`,`mf`.`has_large` AS `has_large`,`mf`.`has_webp` AS `has_webp`,`mf`.`uploaded_by` AS `uploaded_by`,`mf`.`created_at` AS `created_at`,`mf`.`updated_at` AS `updated_at`,`mf`.`folder_path` AS `folder_path`,`mf`.`tags` AS `tags`,`mf`.`alt_text` AS `alt_text`,`mf`.`title` AS `title`,`mf`.`description` AS `description`,`mf`.`dominant_color` AS `dominant_color`,`mf`.`dimensions` AS `dimensions`,`mf`.`file_hash` AS `file_hash`,`mf`.`edit_history` AS `edit_history`,`mf`.`upload_source` AS `upload_source`,`mf`.`processed_variants` AS `processed_variants`,`mf`.`seo_optimized` AS `seo_optimized`,`mf`.`last_accessed_at` AS `last_accessed_at`,group_concat(distinct `mt`.`name` separator ', ') AS `tag_names`,`mfd`.`name` AS `folder_name`,`mfd`.`color` AS `folder_color` from (((`media_files` `mf` left join `media_file_tags` `mft` on((`mf`.`id` = `mft`.`file_id`))) left join `media_tags` `mt` on((`mft`.`tag_id` = `mt`.`id`))) left join `media_folders` `mfd` on((`mf`.`folder_path` = `mfd`.`path`))) group by `mf`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-26 14:50:14

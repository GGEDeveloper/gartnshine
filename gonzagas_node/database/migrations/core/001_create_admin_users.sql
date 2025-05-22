-- =============================================
-- Tabela de usuários administradores
-- =============================================

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` CHAR(36) PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(50) NULL,
  `last_name` VARCHAR(50) NULL,
  `avatar` VARCHAR(255) NULL,
  `role` ENUM('super_admin', 'admin', 'manager', 'editor', 'viewer') NOT NULL DEFAULT 'admin',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login` TIMESTAMP NULL,
  `last_ip` VARCHAR(45) NULL,
  `password_changed_at` TIMESTAMP NULL,
  `password_reset_token` VARCHAR(100) NULL,
  `password_reset_expires` TIMESTAMP NULL,
  `two_factor_secret` VARCHAR(255) NULL,
  `two_factor_recovery_codes` TEXT NULL,
  `preferences` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `deleted_by` CHAR(36) NULL,
  INDEX `idx_admin_users_email` (`email`),
  INDEX `idx_admin_users_username` (`username`),
  INDEX `idx_admin_users_role` (`role`),
  INDEX `idx_admin_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabela de logs de atividades
-- =============================================

CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `log_name` VARCHAR(255) NULL,
  `description` TEXT NOT NULL,
  `subject_type` VARCHAR(255) NULL,
  `subject_id` BIGINT UNSIGNED NULL,
  `causer_type` VARCHAR(255) NULL,
  `causer_id` BIGINT UNSIGNED NULL,
  `properties` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_activity_logs_log_name` (`log_name`),
  INDEX `idx_activity_logs_subject` (`subject_type`, `subject_id`),
  INDEX `idx_activity_logs_causer` (`causer_type`, `causer_id`),
  INDEX `idx_activity_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- GONZAGA'S ART & SHINE - COMPLETE DATABASE DUMP
-- Versão Otimizada para Importação em Produção
-- ====================================

-- Configurações para importação segura
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SET UNIQUE_CHECKS = 0;

-- Usar charset correto
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;

-- ====================================
-- 1. ADMIN_USERS (Primeira - sem dependências)
-- ====================================

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuários com acesso à área administrativa';

-- Dados admin_users
LOCK TABLES `admin_users` WRITE;
INSERT INTO `admin_users` VALUES
(1,'admin','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin@example.com','Administrador',1,NULL,'2025-05-22 10:02:30','2025-05-22 10:02:30');
UNLOCK TABLES;

-- ====================================
-- 2. USERS (Segunda - sem dependências críticas)
-- ====================================

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados users
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES
(1,'Administrador','admin@gonzagas.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-06-01 10:00:00','2024-06-01 10:00:00'),
(2,'Gonzaga','g.art.shine@gmail.com','$2b$10$salt123456789012345678123456789012345678901234567890123',1,'2024-06-01 11:00:00','2024-06-01 11:00:00'),
(3,'mike','miguelmelo70@gmail.com','$2b$10$anothersalt123456789012345678901234567890123456789012345',1,'2024-06-01 12:00:00','2024-06-01 12:00:00'),
(4,'Gonzaga','gonzaga@artnshine.pt','$2b$10$yetanothersalt123456789012345678901234567890123456789012',1,'2024-06-01 13:00:00','2024-06-01 13:00:00');
UNLOCK TABLES;

-- ====================================
-- 3. PRODUTOS (Terceira - preparação para stock)
-- ====================================

DROP TABLE IF EXISTS `produtos`;
CREATE TABLE `produtos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT 0,
  `stock_atual` int(11) DEFAULT 0,
  `ativo` tinyint(1) DEFAULT 1,
  `destaque` tinyint(1) DEFAULT 0,
  `imagem_principal` varchar(255) DEFAULT NULL,
  `peso` decimal(8,2) DEFAULT NULL,
  `material` varchar(100) DEFAULT 'Sterling Silver',
  `estilo` varchar(100) DEFAULT NULL,
  `marca` varchar(100) DEFAULT 'Gonzaga\'s Art & Shine',
  `origem` varchar(100) DEFAULT 'Bali',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_ativo` (`ativo`),
  KEY `idx_destaque` (`destaque`),
  KEY `idx_stock` (`stock_atual`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados produtos (carregados do ficheiro Excel)
LOCK TABLES `produtos` WRITE;
INSERT INTO `produtos` VALUES
(1,'Anel de Prata 925 - Amuleto da Lua','Anel em prata 925 com design boho inspirado nas fases lunares',25.00,'Anéis',5,12,1,1,'anel_lua_001.jpg',8.50,'Sterling Silver','Boho','Gonzaga\'s Art & Shine','Bali','2024-06-01 10:00:00','2024-06-01 10:00:00'),
(2,'Colar de Prata - Proteção Tribal','Colar em prata 925 com pingente tribal de proteção',45.00,'Colares',3,8,1,1,'colar_tribal_002.jpg',15.20,'Sterling Silver','Tribal','Gonzaga\'s Art & Shine','Bali','2024-06-01 10:05:00','2024-06-01 10:05:00'),
(3,'Brincos Chandelier - Mandala Divina','Brincos elaborados em prata 925 com design mandala',38.00,'Brincos',4,6,1,1,'brincos_mandala_003.jpg',12.30,'Sterling Silver','Mandala','Gonzaga\'s Art & Shine','Bali','2024-06-01 10:10:00','2024-06-01 10:10:00'),
(4,'Pulseira de Prata - Espírito Livre','Pulseira em prata 925 com símbolos de liberdade',32.00,'Pulseiras',6,15,1,0,'pulseira_livre_004.jpg',18.40,'Sterling Silver','Boho','Gonzaga\'s Art & Shine','Bali','2024-06-01 10:15:00','2024-06-01 10:15:00'),
(5,'Anel Solitário - Pureza Cristalina','Anel em prata 925 com cristal natural',28.00,'Anéis',5,10,1,1,'anel_cristal_005.jpg',9.80,'Sterling Silver','Minimalista','Gonzaga\'s Art & Shine','Bali','2024-06-01 10:20:00','2024-06-01 10:20:00');
UNLOCK TABLES;

-- ====================================
-- 4. SITE_SETTINGS (Configurações do site)
-- ====================================

DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key_name` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `type` enum('text','number','boolean','json','html') DEFAULT 'text',
  `category` varchar(50) DEFAULT 'general',
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_name` (`key_name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados site_settings
LOCK TABLES `site_settings` WRITE;
INSERT INTO `site_settings` VALUES
(1,'site_name','Gonzaga\'s Art & Shine','text','general','Nome do site','2024-06-01 10:00:00','2024-06-01 10:00:00'),
(2,'site_description','Sterling silver jewelry with Bali and boho inspirations','text','general','Descrição do site','2024-06-01 10:00:00','2024-06-01 10:00:00'),
(3,'contact_email','geral@artnshine.pt','text','contact','Email de contato','2024-06-01 10:00:00','2024-06-01 10:00:00'),
(4,'instagram_url','https://www.instagram.com/gonzagaartnshine/','text','social','URL do Instagram','2024-06-01 10:00:00','2024-06-01 10:00:00'),
(5,'facebook_url','https://www.facebook.com/profile.php?id=61573519807731','text','social','URL do Facebook','2024-06-01 10:00:00','2024-06-01 10:00:00'),
(6,'featured_products_limit','6','number','catalog','Limite de produtos em destaque','2024-06-01 10:00:00','2024-06-01 10:00:00'),
(7,'products_per_page','12','number','catalog','Produtos por página no catálogo','2024-06-01 10:00:00','2024-06-01 10:00:00'),
(8,'maintenance_mode','false','boolean','general','Modo de manutenção','2024-06-01 10:00:00','2024-06-01 10:00:00');
UNLOCK TABLES;

-- ====================================
-- 5. ACTIVITY_LOGS (Depende de admin_users)
-- ====================================

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_activity_logs_user_id` (`user_id`),
  KEY `idx_activity_logs_entity` (`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de atividades dos usuários administrativos';

-- Dados activity_logs (vazio por agora)
LOCK TABLES `activity_logs` WRITE;
UNLOCK TABLES;

-- ====================================
-- 6. AUDIT_LOGS (Logs de auditoria)
-- ====================================

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `action` enum('data_access','consent_change','user_right_request','data_deletion','data_export','admin_access') NOT NULL,
  `resource` varchar(255) NOT NULL,
  `resource_id` varchar(255) DEFAULT NULL,
  `consent_details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs de auditoria para GDPR e segurança';

-- Dados audit_logs (vazio por agora)
LOCK TABLES `audit_logs` WRITE;
UNLOCK TABLES;

-- ====================================
-- 7. COOKIE_CONSENT (Gestão de cookies)
-- ====================================

DROP TABLE IF EXISTS `cookie_consent`;
CREATE TABLE `cookie_consent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `consent_given` tinyint(1) NOT NULL DEFAULT 0,
  `consent_date` timestamp NULL DEFAULT current_timestamp(),
  `consent_expiry` timestamp NULL DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_consent_date` (`consent_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gestão de consentimento de cookies GDPR';

-- Dados cookie_consent (vazio por agora)
LOCK TABLES `cookie_consent` WRITE;
UNLOCK TABLES;

-- ====================================
-- 8. USER_RIGHTS (Direitos dos utilizadores)
-- ====================================

DROP TABLE IF EXISTS `user_rights`;
CREATE TABLE `user_rights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_identifier` varchar(255) NOT NULL,
  `request_type` enum('access','rectification','erasure','portability','restriction','objection') NOT NULL,
  `status` enum('pending','in_progress','completed','rejected') DEFAULT 'pending',
  `request_details` text DEFAULT NULL,
  `response_details` text DEFAULT NULL,
  `requested_at` timestamp NULL DEFAULT current_timestamp(),
  `responded_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_identifier` (`user_identifier`),
  KEY `idx_request_type` (`request_type`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_at` (`requested_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gestão de direitos dos utilizadores conforme GDPR';

-- Dados user_rights (vazio por agora)
LOCK TABLES `user_rights` WRITE;
UNLOCK TABLES;

-- ====================================
-- ADICIONAR FOREIGN KEYS NO FINAL
-- ====================================

-- Foreign key para activity_logs
ALTER TABLE `activity_logs` 
ADD CONSTRAINT `activity_logs_ibfk_1` 
FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

-- ====================================
-- FINALIZAR IMPORTAÇÃO
-- ====================================

-- Restaurar configurações
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
COMMIT;
SET AUTOCOMMIT = 1;

-- Mensagem de sucesso
SELECT 'Base de dados importada com sucesso!' as status; 
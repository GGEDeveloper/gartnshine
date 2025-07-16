-- Tabela para armazenar consentimentos de cookies (RGPD)
CREATE TABLE IF NOT EXISTS cookie_consents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  necessary BOOLEAN DEFAULT TRUE,
  analytics BOOLEAN DEFAULT FALSE,
  marketing BOOLEAN DEFAULT FALSE,
  preferences BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_session (session_id),
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at)
); 
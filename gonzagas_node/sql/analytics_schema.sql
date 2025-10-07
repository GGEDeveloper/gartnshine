-- Analytics & Business Intelligence Schema

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NULL,
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_action VARCHAR(100) NOT NULL,
    event_label VARCHAR(255) NULL,
    event_value DECIMAL(10,2) NULL,
    
    -- Context data
    page_url TEXT NOT NULL,
    referrer TEXT NULL,
    user_agent TEXT NULL,
    ip_address VARCHAR(45) NULL,
    
    -- Device/Browser info
    device_type ENUM('desktop', 'mobile', 'tablet') NULL,
    browser VARCHAR(100) NULL,
    os VARCHAR(100) NULL,
    screen_resolution VARCHAR(20) NULL,
    
    -- Geographic data
    country VARCHAR(2) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    
    -- Product context (if applicable)
    product_id INT NULL,
    product_category VARCHAR(100) NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_events_session (session_id),
    INDEX idx_events_type (event_type),
    INDEX idx_events_category (event_category),
    INDEX idx_events_product (product_id),
    INDEX idx_events_created (created_at),
    INDEX idx_events_device (device_type),
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Create analytics_sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    
    -- Session timing
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    duration_seconds INT NULL,
    page_views INT DEFAULT 1,
    
    -- Traffic source
    source VARCHAR(100) NULL,
    medium VARCHAR(100) NULL,
    campaign VARCHAR(100) NULL,
    keyword VARCHAR(255) NULL,
    referrer TEXT NULL,
    
    -- Device info
    device_type ENUM('desktop', 'mobile', 'tablet') NULL,
    browser VARCHAR(100) NULL,
    os VARCHAR(100) NULL,
    screen_resolution VARCHAR(20) NULL,
    
    -- Geographic info
    country VARCHAR(2) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    
    -- Conversion data
    converted BOOLEAN DEFAULT FALSE,
    conversion_type VARCHAR(50) NULL,
    conversion_value DECIMAL(10,2) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sessions_start (start_time),
    INDEX idx_sessions_device (device_type),
    INDEX idx_sessions_source (source),
    INDEX idx_sessions_converted (converted)
);

-- Create analytics_conversions table
CREATE TABLE IF NOT EXISTS analytics_conversions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    event_id BIGINT NULL,
    
    conversion_type ENUM('whatsapp_click', 'phone_call', 'email_click', 'form_submit', 'catalog_view', 'product_view') NOT NULL,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    
    -- Product context
    product_id INT NULL,
    product_category VARCHAR(100) NULL,
    
    -- Conversion funnel stage
    funnel_stage ENUM('awareness', 'interest', 'consideration', 'intent', 'purchase') DEFAULT 'interest',
    
    -- Attribution data
    first_touch_source VARCHAR(100) NULL,
    last_touch_source VARCHAR(100) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES analytics_events(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    
    INDEX idx_conversions_type (conversion_type),
    INDEX idx_conversions_product (product_id),
    INDEX idx_conversions_created (created_at)
);

-- Create analytics_page_views table
CREATE TABLE IF NOT EXISTS analytics_page_views (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    
    page_url TEXT NOT NULL,
    page_title VARCHAR(255) NULL,
    page_type VARCHAR(50) NULL, -- 'homepage', 'product', 'catalog', 'search', etc.
    
    -- Product context (for product pages)
    product_id INT NULL,
    category_id INT NULL,
    
    -- Timing data
    time_on_page INT NULL, -- seconds
    bounce BOOLEAN DEFAULT FALSE,
    exit_page BOOLEAN DEFAULT FALSE,
    
    -- Scroll tracking
    max_scroll_percentage TINYINT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES product_families(id) ON DELETE SET NULL,
    
    INDEX idx_page_views_session (session_id),
    INDEX idx_page_views_product (product_id),
    INDEX idx_page_views_type (page_type),
    INDEX idx_page_views_created (created_at)
);

-- Create analytics_search_queries table
CREATE TABLE IF NOT EXISTS analytics_search_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    
    query_text VARCHAR(500) NOT NULL,
    results_count INT DEFAULT 0,
    clicked_result_position INT NULL,
    clicked_product_id INT NULL,
    
    -- Search context
    search_type ENUM('catalog', 'global', 'navigation') DEFAULT 'catalog',
    filters_applied JSON NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (clicked_product_id) REFERENCES products(id) ON DELETE SET NULL,
    
    INDEX idx_search_queries_text (query_text),
    INDEX idx_search_queries_session (session_id),
    INDEX idx_search_queries_created (created_at)
);

-- Create analytics_daily_stats table (aggregated data)
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- Traffic metrics
    total_sessions INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    page_views INT DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INT DEFAULT 0,
    
    -- Device breakdown
    desktop_sessions INT DEFAULT 0,
    mobile_sessions INT DEFAULT 0,
    tablet_sessions INT DEFAULT 0,
    
    -- Conversion metrics
    total_conversions INT DEFAULT 0,
    whatsapp_clicks INT DEFAULT 0,
    phone_calls INT DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Content metrics
    top_pages JSON NULL,
    top_products JSON NULL,
    search_queries JSON NULL,
    
    -- Traffic sources
    traffic_sources JSON NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_daily_stats_date (date)
);

-- Create analytics_product_performance table
CREATE TABLE IF NOT EXISTS analytics_product_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    date DATE NOT NULL,
    
    -- View metrics
    page_views INT DEFAULT 0,
    unique_views INT DEFAULT 0,
    avg_time_on_page INT DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Engagement metrics
    whatsapp_clicks INT DEFAULT 0,
    image_views INT DEFAULT 0,
    share_clicks INT DEFAULT 0,
    
    -- Search metrics
    search_appearances INT DEFAULT 0,
    search_clicks INT DEFAULT 0,
    avg_search_position DECIMAL(4,2) DEFAULT 0,
    
    -- Conversion metrics
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_date (product_id, date),
    INDEX idx_product_perf_date (date),
    INDEX idx_product_perf_views (page_views)
);

-- Insert sample data for testing
INSERT IGNORE INTO analytics_daily_stats (date, total_sessions, unique_visitors, page_views, whatsapp_clicks) VALUES
(CURDATE() - INTERVAL 7 DAY, 45, 38, 124, 12),
(CURDATE() - INTERVAL 6 DAY, 52, 44, 145, 15),
(CURDATE() - INTERVAL 5 DAY, 38, 35, 98, 8),
(CURDATE() - INTERVAL 4 DAY, 61, 55, 178, 18),
(CURDATE() - INTERVAL 3 DAY, 48, 41, 132, 14),
(CURDATE() - INTERVAL 2 DAY, 67, 58, 195, 22),
(CURDATE() - INTERVAL 1 DAY, 55, 47, 156, 17);


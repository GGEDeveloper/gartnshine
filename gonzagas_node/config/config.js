require('dotenv').config();
const path = require('path');
const crypto = require('crypto');

// Gera um segredo JWT aleatório se não estiver definido no .env
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

const config = {
  // Configurações do ambiente
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    publicUrl: process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  },
  
  // Configurações do site
  site: {
    title: 'Gonzaga\'s Art & Shine',
    description: 'Sterling silver jewelry with Bali and Boho tendencies',
    url: process.env.SITE_URL || (process.env.NODE_ENV === 'production' 
      ? 'https://example.com' // Mude para o domínio real em produção
      : 'http://localhost:3000'),
    contactEmail: process.env.CONTACT_EMAIL || 'contato@gonzagas.com',
    supportEmail: process.env.SUPPORT_EMAIL || 'suporte@gonzagas.com',
    mediaPath: path.join(__dirname, '../../media'),
    uploadsPath: path.join(__dirname, '../../uploads'),
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  
  // Configurações de autenticação JWT
  jwt: {
    secret: process.env.JWT_SECRET || generateJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256', // Algoritmo de criptografia
    issuer: process.env.JWT_ISSUER || 'gonzagas-api', // Emissor do token
    audience: process.env.JWT_AUDIENCE || 'gonzagas-client', // Público-alvo do token
  },
  
  // Configurações de senha
  password: {
    saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 10,
    minLength: 8, // Comprimento mínimo da senha
    requireSpecialChar: true, // Requer caractere especial
    requireNumber: true, // Requer número
    requireUppercase: true, // Requer letra maiúscula
    requireLowercase: true, // Requer letra minúscula
  },
  
  // Configurações de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
    maxAge: 600, // Tempo de cache do preflight request em segundos
  },
  
  // Configurações de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de requisições por janela de tempo
    message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
  },
  
  // Configurações de upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    maxFiles: 5, // Número máximo de arquivos por upload
  },
  
  // Configurações de cache
  cache: {
    ttl: 300, // 5 minutos
    maxItems: 100, // Número máximo de itens em cache
  },
  
  // Configurações de log
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/application.log',
    maxSize: '20m', // Tamanho máximo do arquivo de log
    maxFiles: '14d', // Manter logs por 14 dias
    colorize: true,
  },
  
  // Configurações de sessão
  session: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'lax',
    },
  },
  
  // Configurações de banco de dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gonzagas',
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: true,
      paranoid: true, // Habilita o soft delete
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  
  // Configurações de autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET || generateJwtSecret(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d', // 7 dias
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d', // 30 dias
    passwordResetExpires: 3600000, // 1 hora em milissegundos
    maxLoginAttempts: 5,
    lockoutTime: 1800000, // 30 minutos em milissegundos
    saltRounds: 10, // Para bcrypt
  },
  
  // Configurações de e-mail
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'Gonzaga\'s Art & Shine <noreply@gonzagas.com>',
    replyTo: process.env.EMAIL_REPLY_TO || 'contato@gonzagas.com',
    templatesPath: path.join(__dirname, '../emails/templates'),
  },
  
  // Configurações do banco de dados
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gonzagas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'local',
    dateStrings: true,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci',
  },
  
  // Configurações de sessão
  session: {
    secret: process.env.SESSION_SECRET || 'gonzaga-art-and-shine-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      domain: process.env.COOKIE_DOMAIN || 'localhost',
    },
  },
  
  // Configurações de cache
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: 3600, // 1 hora em segundos
    prefix: 'gonzagas_',
  },
  
  // Configurações de upload
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    maxFiles: 5,
  },
  
  // Configurações de paginação
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  
  // Configurações de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
    maxAge: 86400, // 24 horas
  },
  
  // Configurações de taxa de limite (rate limiting)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.RATE_LIMIT_MAX || 100, // limite por janela de tempo
  },
  
  // Configurações de log
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: path.join(__dirname, '../logs'),
    filename: 'app.log',
    errorFilename: 'error.log',
    maxSize: '20m',
    maxFiles: '30d',
    colorize: true,
    json: process.env.NODE_ENV === 'production',
  },
  
  // Configurações de tema
  theme: {
    colorPrimary: '#1e1e1e',     // Fundo escuro
    colorSecondary: '#4a3c2d',   // Marrom florestal
    colorAccent: '#6a8c69',      // Verde florestal
    colorText: '#f0f0f0',        // Texto claro
    colorHighlight: '#b19cd9',    // Roxo psicodélico
  },
  
  // Configurações do sistema de checkpoint para backup de dados
  checkpoint: {
    dir: path.join(__dirname, '../checkpoints'),
    maxCheckpoints: process.env.MAX_CHECKPOINTS || 10, // Número máximo de checkpoints a manter
    backupSchedule: '0 3 * * *', // Agendamento de backup diário às 3h (formato cron)
    retentionDays: 30, // Manter backups por 30 dias
  },
  
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    trustProxy: process.env.TRUST_PROXY || 'loopback',
    enableCompression: true,
    enableHelmet: true,
    enableCsurf: process.env.NODE_ENV === 'production',
    enableHttps: process.env.ENABLE_HTTPS === 'true',
    httpsOptions: {
      key: process.env.HTTPS_KEY_PATH ? fs.readFileSync(process.env.HTTPS_KEY_PATH) : null,
      cert: process.env.HTTPS_CERT_PATH ? fs.readFileSync(process.env.HTTPS_CERT_PATH) : null,
    },
  },
  
  // Configurações de integração com serviços externos
  services: {
    // Configurações do serviço de armazenamento (S3, Google Cloud Storage, etc.)
    storage: {
      provider: process.env.STORAGE_PROVIDER || 'local', // 'local', 's3', 'gcs', 'azure'
      local: {
        path: path.join(__dirname, '../../storage'),
        baseUrl: '/storage',
      },
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET,
        acl: 'public-read',
      },
      gcs: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        bucket: process.env.GCS_BUCKET_NAME,
      },
    },
    
    // Configurações do serviço de cache (Redis, Memcached, etc.)
    cache: {
      provider: process.env.CACHE_PROVIDER || 'memory', // 'memory', 'redis', 'memcached'
      ttl: 3600, // 1 hora em segundos
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
      },
    },
    
    // Configurações do serviço de fila (Bull, RabbitMQ, etc.)
    queue: {
      provider: process.env.QUEUE_PROVIDER || 'bull', // 'bull', 'rabbitmq', 'sqs'
      concurrency: 5,
      bull: {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_QUEUE_DB || 1,
        },
      },
    },
  },
};

// Exporta a configuração
module.exports = config; 
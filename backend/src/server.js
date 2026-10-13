const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connectDB, isMongoConfigured, checkDatabaseHealth } = require('./config/db');

const app = express();

// Configure CORS for Cookie & Authorization header transmission across any deployed origin
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cookie',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Accept-Language',
    'Range'
  ],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Auth, Clinical, Pharmacy, Ambulance & AI API Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/user', authRoutes);
app.use('/api/health-id', require('./routes/healthIdRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));
app.use('/api/ambulance', require('./routes/ambulanceRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// System Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const isMongo = isMongoConfigured();
  let dbStatus = { configured: isMongo, connected: false };
  try {
    dbStatus = await checkDatabaseHealth();
  } catch (e) {
    dbStatus = { configured: isMongo, connected: false, error: e.message };
  }

  res.json({
    status: dbStatus.connected ? 'OK' : 'DEGRADED',
    service: 'JIVEXA Health OS Backend Service',
    database: 'MongoDB Atlas',
    activeDatabase: dbStatus.connected
      ? 'MongoDB Atlas'
      : (isMongo ? 'MongoDB Atlas (Unreachable)' : 'DISCONNECTED'),
    authProvider: 'Native JWT / MongoDB Auth',
    // TEMPORARILY DISABLED FOR LAUNCH
    // Re-enable OTP after launch by setting OTP_ENABLED=true in backend/.env.
    otp: {
      enabled: process.env.OTP_ENABLED === 'true',
      status: process.env.OTP_ENABLED === 'true' ? 'ACTIVE' : 'TEMPORARILY_DISABLED_FOR_LAUNCH'
    },
    // PATIENT-FIRST MVP LAUNCH MODE
    mvpMode: {
      patientMvpOnly: process.env.PATIENT_MVP_ONLY === 'true',
      mode: process.env.PATIENT_MVP_ONLY === 'true' ? 'PATIENT_FIRST_MVP' : 'FULL_ECOSYSTEM',
      activeModules: [
        'PATIENT_SIGNUP',
        'PATIENT_LOGIN',
        'EMAIL_VERIFICATION',
        'PATIENT_DASHBOARD',
        'PATIENT_PROFILE',
        'AI_HEALTH_REPORT_ANALYZER',
        'AI_HEALTH_CHATBOT',
        'HEALTH_RECORDS',
        'HEALTH_ID'
      ],
      upcomingModules: [
        { name: 'Doctor Consultations & Appointments', version: 'V2', status: 'COMING_SOON' },
        { name: 'Pharmacy & Medicine Delivery', version: 'V3', status: 'COMING_SOON' },
        { name: 'Ambulance Partner Emergency Fleet', version: 'V4', status: 'COMING_SOON' },
        { name: 'Hospital & Healthcare Ecosystem Admin', version: 'V5', status: 'COMING_SOON' }
      ]
    },
    mongodb: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'JIVEXA Health OS Backend Service',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString()
  });
});

// Process safety guards to prevent unhandled EventEmitter or rejection crashes
process.on('unhandledRejection', (reason) => {
  console.warn('[Process] Handled unhandled rejection:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Handled uncaught exception safely:', err.message);
});

const PORT = parseInt(process.env.PORT, 10) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas
    if (isMongoConfigured()) {
      console.log('[MongoDB] URI detected in backend environment. Connecting to MongoDB Atlas...');
      try {
        await connectDB();
      } catch (err) {
        console.warn('[MongoDB] Initial connection error on startup:', err.message);
      }
    } else {
      console.warn('[MongoDB] MONGO_URI is not set in backend/.env. Server will run in degraded mode until configured.');
    }

    // 2. Start Express server and attach error listeners explicitly on 0.0.0.0
    const server = app.listen(PORT, HOST, () => {
      console.log(
        `[JIVEXA Backend] Production-Grade Auth Server running in ${
          process.env.NODE_ENV || 'development'
        } mode on http://localhost:${PORT} (bound to ${HOST}:${PORT})`
      );
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `[JIVEXA Backend] Port ${PORT} is already in use by another process. Please terminate the existing process listening on port ${PORT}.`
        );
      } else {
        console.error('[JIVEXA Backend] Server listen error:', err.message);
      }
    });
  } catch (error) {
    console.error('[JIVEXA Backend] Unexpected startup error:', error);
  }
};

startServer();
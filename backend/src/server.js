const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { checkSupabaseHealth, isSupabaseConfigured } = require('./config/supabase');

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
  const isSupa = isSupabaseConfigured();
  let supabaseStatus = { configured: false, connected: false };
  if (isSupa) {
    try {
      supabaseStatus = { configured: true, ...(await checkSupabaseHealth()) };
    } catch (e) {
      supabaseStatus = { configured: true, connected: false, error: e.message };
    }
  }

  res.json({
    status: isSupa && supabaseStatus.connected ? 'OK' : 'DEGRADED',
    service: 'JIVEXA Health OS Backend Service',
    database: 'Supabase PostgreSQL',
    activeDatabase: isSupa && supabaseStatus.connected ? 'Supabase' : (isSupa ? 'Supabase (Unreachable)' : 'DISCONNECTED'),
    authProvider: 'Supabase Auth',
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
        'SUPABASE_EMAIL_VERIFICATION',
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
    supabase: supabaseStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'JIVEXA Health OS Backend Service',
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
    // 1. Supabase Initialization check on startup (SOLE DATABASE)
    if (isSupabaseConfigured()) {
      console.log('[Supabase] Credentials detected in backend environment.');
      checkSupabaseHealth()
        .then((health) => {
          if (health.connected && health.tablePermission === 'GRANTED') {
            console.log('[Supabase] PostgreSQL database connected successfully.');
          } else if (health.connected) {
            console.log(
              `[Supabase] PostgreSQL connection reached (${health.tablePermission || 'Active'}). Notice: ${
                health.error || health.message
              }`
            );
          } else {
            console.warn('[Supabase] Health probe notice:', health.error || health.message);
          }
        })
        .catch((e) => {
          console.warn('[Supabase] Initialization probe notice:', e.message);
        });
    } else {
      console.error(
        '[Supabase] FATAL ERROR: Supabase is NOT configured. Jivexa Health OS requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      );
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
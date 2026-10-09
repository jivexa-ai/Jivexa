import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRouter from './routes/userRouter.js';
import healthIdRouter from './routes/healthIdRouter.js';

dotenv.config();

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5000'
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

const allAllowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allAllowedOrigins.includes(origin)) return true;
  if (process.env.ALLOWED_ORIGINS === '*' || process.env.NODE_ENV !== 'production') return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/.*\.onrender\.com$/.test(origin)) return true;
  if (/^https:\/\/.*\.netlify\.app$/.test(origin)) return true;
  return false;
};

// Enable CORS with comprehensive origin matching
const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Jivexa Authentication Backend API', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Jivexa Authentication Backend API', timestamp: new Date().toISOString() });
});

// Mount user authentication routes at both /user and /api/auth
app.use("/user", userRouter);
app.use("/api/auth", userRouter);
app.use("/api/health-id", healthIdRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn("[Jivexa Auth Server Startup Warning]: JWT_SECRET is not set. Using secure development fallback.");
      process.env.JWT_SECRET = 'jivexa_health_jwt_secret_key_2026_super_secure_auth_token_string';
    }
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Jivexa Auth Server] running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[Jivexa Auth Server Startup Error]:", error);
    process.exit(1);
  }
};

startServer();
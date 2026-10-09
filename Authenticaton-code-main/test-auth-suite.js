import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import User from './model/userSchema.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jivexa_jwt_secret_key_12345678901234567890';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🚀 JIVEXA HEALTH - END-TO-END AUTH TEST SUITE');
  console.log('======================================================\n');

  let mongod;
  let server;
  const PORT = 5599;
  const BASE_URL = `http://localhost:${PORT}`;

  try {
    // 1. Start MongoDB In-Memory Server
    console.log('⏳ Starting isolated MongoDB instance...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully at:', uri);

    // 2. Setup Express App
    const app = express();

    const defaultAllowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      'http://localhost:5000',
      'http://127.0.0.1:5173'
    ];

    const isAllowedOrigin = (origin) => {
      if (!origin) return true;
      if (defaultAllowedOrigins.includes(origin)) return true;
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
      if (/^https:\/\/.*\.onrender\.com$/.test(origin)) return true;
      return false;
    };

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

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', service: 'Jivexa Authentication Backend API' });
    });

    app.use('/user', userRouter);
    app.use('/api/auth', userRouter);

    // Start Test Server
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`✅ Test server running on ${BASE_URL}\n`);
        resolve();
      });
    });

    const testResults = [];

    // TEST 1: Health Check Endpoint
    {
      const res = await fetch(`${BASE_URL}/api/health`);
      const body = await res.json();
      const pass = res.status === 200 && body.status === 'ok';
      console.log(`[TEST 1] /api/health -> Status: ${res.status} | OK: ${pass}`);
      testResults.push({ name: 'Health Check Endpoint', pass, status: res.status, body });
    }

    // TEST 2: CORS Preflight OPTIONS Request with Origin
    {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      const allowOrigin = res.headers.get('access-control-allow-origin');
      const allowCreds = res.headers.get('access-control-allow-credentials');
      const pass = (res.status === 200 || res.status === 204) && allowOrigin === 'http://localhost:5173' && allowCreds === 'true';
      console.log(`[TEST 2] CORS Preflight OPTIONS -> Status: ${res.status}, Allow-Origin: ${allowOrigin}, Allow-Credentials: ${allowCreds} | Pass: ${pass}`);
      testResults.push({ name: 'CORS Preflight Headers', pass, status: res.status });
    }

    // TEST 3: User Registration (Patient)
    const testUser = {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@test.jivexa.com',
      password: 'Password@123',
      role: 'PATIENT'
    };

    let userToken = '';
    let userId = '';

    {
      const res = await fetch(`${BASE_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
        body: JSON.stringify(testUser)
      });
      const body = await res.json();
      userToken = body.token;
      userId = body.user?.id;
      const pass = res.status === 201 && body.success === true && Boolean(body.token) && body.user?.email === testUser.email;
      console.log(`[TEST 3] User Registration (POST /user/signup) -> Status: ${res.status} | Token: ${body.token ? 'Issued' : 'Missing'} | Pass: ${pass}`);
      testResults.push({ name: 'User Registration', pass, status: res.status, body });
    }

    // TEST 4: Verify User actually exists in MongoDB
    {
      const dbUser = await User.findOne({ email: testUser.email });
      const pass = Boolean(dbUser && dbUser.email === testUser.email && dbUser.name === testUser.name);
      console.log(`[TEST 4] MongoDB Direct Query -> Found: ${Boolean(dbUser)} | ID: ${dbUser?._id} | Pass: ${pass}`);
      testResults.push({ name: 'MongoDB Document Creation', pass, userFound: Boolean(dbUser) });
    }

    // TEST 5: Duplicate Email Registration (Should Fail with 409 Conflict)
    {
      const res = await fetch(`${BASE_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      const body = await res.json();
      const pass = res.status === 409 && body.success === false;
      console.log(`[TEST 5] Duplicate Registration (409 Conflict) -> Status: ${res.status} | Message: "${body.message}" | Pass: ${pass}`);
      testResults.push({ name: 'Duplicate Email Prevention', pass, status: res.status, body });
    }

    // TEST 6: Login with Correct Password
    {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          role: 'PATIENT'
        })
      });
      const body = await res.json();
      const pass = res.status === 200 && body.success === true && Boolean(body.token) && body.user?.email === testUser.email;
      console.log(`[TEST 6] User Login (POST /user/login) -> Status: ${res.status} | Token: ${body.token ? 'Issued' : 'Missing'} | Pass: ${pass}`);
      testResults.push({ name: 'Valid User Login', pass, status: res.status, body });
    }

    // TEST 7: Login with Wrong Password (Should Fail with 401 Unauthorized)
    {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword@999',
          role: 'PATIENT'
        })
      });
      const body = await res.json();
      const pass = res.status === 401 && body.success === false;
      console.log(`[TEST 7] Wrong Password Login (401 Unauthorized) -> Status: ${res.status} | Message: "${body.message}" | Pass: ${pass}`);
      testResults.push({ name: 'Invalid Password Prevention', pass, status: res.status, body });
    }

    // TEST 8: Login with Non-Existent Email (Should Fail with 401 Unauthorized)
    {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'doesnotexist@jivexa.com',
          password: 'Password@123'
        })
      });
      const body = await res.json();
      const pass = res.status === 401 && body.success === false;
      console.log(`[TEST 8] Non-existent User Login (401 Unauthorized) -> Status: ${res.status} | Message: "${body.message}" | Pass: ${pass}`);
      testResults.push({ name: 'Non-existent User Prevention', pass, status: res.status, body });
    }

    // TEST 9: Protected Route with Bearer Token (GET /user/me)
    {
      const res = await fetch(`${BASE_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Origin': 'http://localhost:5173'
        }
      });
      const body = await res.json();
      const pass = res.status === 200 && body.success === true && body.user?.email === testUser.email;
      console.log(`[TEST 9] Protected Route (GET /user/me) with Token -> Status: ${res.status} | User: ${body.user?.name} | Pass: ${pass}`);
      testResults.push({ name: 'Protected Route Access with JWT', pass, status: res.status, body });
    }

    // TEST 10: Protected Route without Token (Should Fail with 401 Unauthorized)
    {
      const res = await fetch(`${BASE_URL}/user/me`, {
        method: 'GET'
      });
      const body = await res.json();
      const pass = res.status === 401 && body.success === false;
      console.log(`[TEST 10] Protected Route without Token (401 Unauthorized) -> Status: ${res.status} | Message: "${body.message}" | Pass: ${pass}`);
      testResults.push({ name: 'Unauthorized Protected Route Prevention', pass, status: res.status, body });
    }

    // TEST 11: Doctor Registration + Role Verification
    const testDoctor = {
      name: 'Dr. Priya Nair',
      email: 'dr.priya@test.jivexa.com',
      password: 'DoctorPass@2026',
      role: 'DOCTOR'
    };

    let doctorToken = '';
    {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testDoctor)
      });
      const body = await res.json();
      doctorToken = body.token;
      const pass = res.status === 201 && body.success === true && body.user?.role === 'DOCTOR';
      console.log(`[TEST 11] Doctor Registration (POST /api/auth/signup) -> Status: ${res.status} | Role: ${body.user?.role} | Pass: ${pass}`);
      testResults.push({ name: 'Doctor Registration', pass, status: res.status });
    }

    // TEST 12: Doctor Professional Verification Details (POST /user/submit-verification)
    {
      const res = await fetch(`${BASE_URL}/user/submit-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${doctorToken}`
        },
        body: JSON.stringify({
          nmcRegistrationNumber: 'NMC-2026-987654',
          stateMedicalCouncil: 'Karnataka Medical Council'
        })
      });
      const body = await res.json();
      const pass = res.status === 200 && body.success === true && body.accountStatus === 'PENDING_REVIEW';
      console.log(`[TEST 12] Submit Role Verification (POST /user/submit-verification) -> Status: ${res.status} | AccountStatus: ${body.accountStatus} | Pass: ${pass}`);
      testResults.push({ name: 'Submit Role Verification', pass, status: res.status, body });
    }

    // SUMMARY
    console.log('\n======================================================');
    const allPassed = testResults.every(r => r.pass);
    console.log(`🏁 ALL TESTS SUMMARY: ${allPassed ? '✅ ALL TESTS PASSED (12/12)' : '❌ SOME TESTS FAILED'}`);
    console.log('======================================================\n');

    if (!allPassed) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test suite fatal error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
};

runTests();

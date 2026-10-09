const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_backend_jwt_secret_key_12345678901234567890';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🚀 JIVEXA HEALTH - BACKEND/SRC TEST SUITE');
  console.log('======================================================\n');

  let server;
  const PORT = 5598;
  const BASE_URL = `http://localhost:${PORT}`;

  try {
    const app = express();

    app.use(
      cors({
        origin: (origin, callback) => {
          callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
      })
    );

    app.use(express.json());
    app.use(cookieParser());

    app.use('/api/auth', authRoutes);
    app.use('/user', authRoutes);

    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        service: 'JIVEXA Health OS Backend Service',
        database: 'In-Memory / MongoDB'
      });
    });

    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`✅ Backend test server running on ${BASE_URL}\n`);
        resolve();
      });
    });

    const testResults = [];

    // TEST 1: Health Check
    {
      const res = await fetch(`${BASE_URL}/api/health`);
      const body = await res.json();
      const pass = res.status === 200 && body.status === 'OK';
      console.log(`[TEST 1] /api/health -> Status: ${res.status} | Pass: ${pass}`);
      testResults.push({ name: 'Health Check', pass, status: res.status });
    }

    // TEST 2: Registration
    const testUser = {
      name: 'Ananya Verma',
      email: 'ananya.verma@test.jivexa.com',
      password: 'Password@123',
      role: 'PATIENT'
    };

    let userToken = '';
    {
      const res = await fetch(`${BASE_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
        body: JSON.stringify(testUser)
      });
      const body = await res.json();
      userToken = body.token;
      const pass = res.status === 201 && body.success === true && Boolean(body.token) && body.user?.email === testUser.email;
      console.log(`[TEST 2] Registration -> Status: ${res.status} | Token: ${body.token ? 'Issued' : 'Missing'} | Pass: ${pass}`);
      testResults.push({ name: 'Registration', pass, status: res.status });
    }

    // TEST 3: Duplicate Email (409)
    {
      const res = await fetch(`${BASE_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      const body = await res.json();
      const pass = res.status === 409 && body.success === false;
      console.log(`[TEST 3] Duplicate Registration -> Status: ${res.status} | Pass: ${pass}`);
      testResults.push({ name: 'Duplicate Registration', pass, status: res.status });
    }

    // TEST 4: Login with Valid Password (200)
    {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      const body = await res.json();
      const pass = res.status === 200 && body.success === true && Boolean(body.token) && body.user?.email === testUser.email;
      console.log(`[TEST 4] Login -> Status: ${res.status} | Token: ${body.token ? 'Issued' : 'Missing'} | Pass: ${pass}`);
      testResults.push({ name: 'Valid Login', pass, status: res.status });
    }

    // TEST 5: Login with Wrong Password (401)
    {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword@999'
        })
      });
      const body = await res.json();
      const pass = res.status === 401 && body.success === false;
      console.log(`[TEST 5] Wrong Password -> Status: ${res.status} | Pass: ${pass}`);
      testResults.push({ name: 'Wrong Password', pass, status: res.status });
    }

    // TEST 6: Protected Route (GET /user/me)
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
      console.log(`[TEST 6] Protected Route -> Status: ${res.status} | User: ${body.user?.name} | Pass: ${pass}`);
      testResults.push({ name: 'Protected Route', pass, status: res.status });
    }

    console.log('\n======================================================');
    const allPassed = testResults.every(r => r.pass);
    console.log(`🏁 BACKEND TESTS SUMMARY: ${allPassed ? '✅ ALL TESTS PASSED (6/6)' : '❌ SOME TESTS FAILED'}`);
    console.log('======================================================\n');

    if (!allPassed) process.exit(1);
  } catch (e) {
    console.error('❌ Backend test error:', e);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
};

runTests();

const path = require('path');
const dns = require('dns');

// Ensure reliable SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Load backend environment variables securely
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (uri) {
  process.env.MDB_MCP_CONNECTION_STRING = uri;
}

const { spawn } = require('child_process');
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const child = spawn(npxCmd, ['-y', 'mongodb-mcp-server@latest'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('[MongoDB MCP] Failed to start server:', err.message);
  process.exit(1);
});

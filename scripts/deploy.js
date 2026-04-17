import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const PM2_PATH = 'pm2';
const FRONTEND_DIR = path.join(process.cwd(), 'frontend');
const PORT = 3005;

function run(command, cwd = process.cwd()) {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

console.log('🚀 Starting Deployment of Pumpprice.live...');

// 1. Install dependencies
console.log('\n--- Step 1: Installing Dependencies ---');
run('npm install', FRONTEND_DIR);

// 2. Build for production
console.log('\n--- Step 2: Building Frontend ---');
run('npm run build', FRONTEND_DIR);

// 3. Force kill port 3005
console.log(`\n--- Step 3: Clearing Port ${PORT} ---`);
try {
  // Use lsof -t to get the PID and kill it
  execSync(`kill -9 $(lsof -t -i:${PORT}) 2>/dev/null || true`);
  console.log(`Port ${PORT} cleared.`);
} catch (e) {
  // Ignore errors if no process found
}

// 4. Restart via PM2
console.log('\n--- Step 4: Restarting PM2 Processes ---');
// Use ecosystem file to ensure consistent config
run(`${PM2_PATH} start ecosystem.config.cjs --only pumpprice-ui`);

// 5. Health Check
console.log('\n--- Step 5: Health Check ---');
try {
  // Give it a moment to start
  console.log('Waiting for service to stabilize...');
  execSync('sleep 3');
  const response = execSync(`curl -s -I http://localhost:${PORT} | head -n 1`).toString();
  console.log(`Health Check Response: ${response.trim()}`);
  if (response.includes('200')) {
    console.log('\n✅ Deployment Successful and Healthy!');
  } else {
    console.log('\n⚠️  Deployment completed but health check returned non-200 status.');
    console.log('Please check logs: npm run logs');
  }
} catch (error) {
  console.log('\n❌ Health check failed. Port 3005 may not be responding.');
  console.log('Please check logs: npm run logs');
}

console.log('\n--- Status ---');
run(`${PM2_PATH} status`);

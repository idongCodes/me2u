import { sendMfaCode } from './src/app/actions/admin-auth';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

async function run() {
  const formData = new FormData();
  formData.append('phone', '+17743126471');
  
  console.log('Calling sendMfaCode...');
  const result = await sendMfaCode(null, formData);
  console.log('Result:', result);
  process.exit(0);
}

run().catch(console.error);

import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Current working directory:', process.cwd());
console.log('Env file path:', envPath);
console.log('Env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('Env file contents:');
  console.log(fs.readFileSync(envPath, 'utf8'));
}

const result = dotenv.config({ path: envPath });
console.log('Dotenv result:', result);

console.log('\nEnvironment variables:');
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);
console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
console.log('GOOGLE_PRIVATE_KEY length:', process.env.GOOGLE_PRIVATE_KEY?.length); 
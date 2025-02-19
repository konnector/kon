import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Constants
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
let SPREADSHEET_ID: string;

// Function declarations
async function getAuthToken() {
  console.log('Checking environment variables...');
  
  if (!process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error('Missing GOOGLE_CLIENT_EMAIL in .env.local');
  }
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing GOOGLE_PRIVATE_KEY in .env.local');
  }
  if (!SPREADSHEET_ID) {
    throw new Error('Missing GOOGLE_SHEET_ID in .env.local');
  }

  console.log('Environment variables found:');
  console.log('- GOOGLE_SHEET_ID:', SPREADSHEET_ID);
  console.log('- GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
  console.log('- GOOGLE_PRIVATE_KEY length:', process.env.GOOGLE_PRIVATE_KEY.length);

  console.log('Creating Google Auth client...');
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Private key is undefined');
  }

  // Remove any extra quotes that might be present
  const cleanedPrivateKey = privateKey.replace(/^["']|["']$/g, '');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: cleanedPrivateKey,
    },
    scopes: SCOPES,
  });
  
  console.log('Auth client created successfully');
  return auth;
}

async function getOrCreateUsersSheet(sheets: any) {
  console.log('Getting sheet information...');
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID
  });
  
  // Try to find existing Users sheet
  let sheet = response.data.sheets?.find((s: { properties?: { title?: string } }) => s.properties?.title === 'Users');
  
  if (!sheet) {
    console.log('Users sheet not found, creating it...');
    const addSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Users',
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            }
          }
        ]
      }
    });
    
    sheet = addSheetResponse.data.replies?.[0].addSheet;
    console.log('Users sheet created successfully');
  }
  
  if (!sheet?.properties?.sheetId) {
    throw new Error('Could not get sheet ID');
  }
  
  return sheet.properties.sheetId;
}

async function setupSpreadsheet() {
  try {
    console.log('Starting spreadsheet setup...');
    const auth = await getAuthToken();
    
    console.log('Creating Google Sheets client...');
    const sheets = google.sheets({ version: 'v4', auth });

    // Get or create the Users sheet
    const sheetId = await getOrCreateUsersSheet(sheets);
    console.log('Using sheet ID:', sheetId);

    // Headers for the spreadsheet
    const headers = [
      'Timestamp',
      'User ID',
      'Email',
      'Type',
      'Name/Business Name',
      'Description',
      'Categories',
      'Location',
      'Website',
      'Follower Counts',
      'Platforms',
      'Social Links',
      'Status',
      'Verified'
    ];

    console.log('Setting up headers:', headers);

    // Update the headers in row 1
    console.log('Updating headers in row 1...');
    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Users!A1:N1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });
    console.log('Headers update response:', updateResponse.data);

    // Format headers to be bold and centered
    console.log('Formatting headers with sheet ID:', sheetId);
    const formatResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9
                  },
                  horizontalAlignment: 'CENTER',
                  textFormat: {
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          }
        ]
      }
    });
    console.log('Format response:', formatResponse.data);

    console.log('✅ Spreadsheet setup completed successfully!');
    console.log('You can now view your spreadsheet at:');
    console.log(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
  } catch (error: any) {
    console.error('❌ Error setting up spreadsheet:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Current working directory:', process.cwd());
console.log('Checking if .env.local exists:', fs.existsSync(envPath));

try {
  console.log('Attempting to load environment variables from:', envPath);
  const envConfig = dotenv.config({ path: envPath });
  
  if (envConfig.error) {
    throw new Error(`Failed to load .env.local: ${envConfig.error.message}`);
  }

  // Debug environment variables
  console.log('\nEnvironment Variables Check:');
  console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);
  console.log('GOOGLE_CLIENT_EMAIL exists:', !!process.env.GOOGLE_CLIENT_EMAIL);
  console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
  
  if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing required environment variables');
  }

  // Set the spreadsheet ID
  SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

  // Run the setup
  setupSpreadsheet();
} catch (error) {
  console.error('Error during setup:', error);
  process.exit(1);
} 
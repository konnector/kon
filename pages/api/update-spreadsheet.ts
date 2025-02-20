import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Google Sheets configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Debug environment variables
console.log('Environment check:', {
  hasSpreadsheetId: !!process.env.GOOGLE_SHEET_ID,
  hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
  hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
  spreadsheetId: process.env.GOOGLE_SHEET_ID
});

async function getAuthToken() {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Missing Google credentials');
    }

    console.log('Creating Google Auth with:', {
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY
    });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });
    return auth;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

async function addRowToSheet(auth: any, values: any[]) {
  if (!SPREADSHEET_ID) {
    throw new Error('Missing GOOGLE_SHEET_ID environment variable');
  }

  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    console.log('Attempting to append to sheet:', {
      spreadsheetId: SPREADSHEET_ID,
      range: 'Users!A:Z',
      values: [values]
    });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Users!A:Z', // Assumes sheet name is "Users"
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error adding row to sheet:', {
      error: error.message,
      code: error.code,
      status: error.status,
      details: error.response?.data
    });
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received request to update spreadsheet');
    
    // Skip authentication for test data creation
    const isTestData = req.headers['x-is-test-data'] === 'true';
    let userId = null;

    if (!isTestData) {
      // Get the authenticated Supabase client
      const supabase = createServerSupabaseClient({ req, res });
      
      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log('No session found');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      userId = session.user.id;
    }

    const { type, profile } = req.body;
    
    if (!type || !profile) {
      return res.status(400).json({ error: 'Missing required fields: type and profile' });
    }

    console.log('Processing data:', { type, profile });

    // Safely extract profile data with fallbacks
    const commonData = {
      timestamp: new Date().toISOString(),
      userId: userId || profile.id,
      email: profile.email || 'test@example.com',
      type: type,
      name: type === 'influencer' ? profile.name : profile.business_name,
      description: profile.description || profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      status: profile.status || 'active',
      verified: profile.verified ? 'Yes' : 'No'
    };

    // Format data for spreadsheet based on type
    const rowData = type === 'influencer' 
      ? [
          commonData.timestamp,                // Timestamp
          commonData.userId,                   // User ID
          commonData.email,                    // Email
          commonData.type,                     // Type
          commonData.name,                     // Name/Business Name
          commonData.description,              // Description
          Array.isArray(profile.content_categories) ? profile.content_categories.join(', ') : '',  // Categories
          commonData.location,                 // Location
          commonData.website,                  // Website
          typeof profile.follower_counts === 'object' ? JSON.stringify(profile.follower_counts) : '',  // Follower Counts
          Array.isArray(profile.platforms) ? profile.platforms.join(', ') : '',  // Platforms
          typeof profile.social_links === 'object' ? JSON.stringify(profile.social_links) : '',  // Social Links
          commonData.status,                   // Status
          commonData.verified                  // Verified
        ]
      : [
          commonData.timestamp,                // Timestamp
          commonData.userId,                   // User ID
          commonData.email,                    // Email
          commonData.type,                     // Type
          commonData.name,                     // Name/Business Name
          commonData.description,              // Description
          Array.isArray(profile.product_categories) ? profile.product_categories.join(', ') : '',  // Categories
          commonData.location,                 // Location
          commonData.website,                  // Website
          '',                                 // Follower Counts (empty for business)
          Array.isArray(profile.platforms) ? profile.platforms.join(', ') : '',  // Platforms
          typeof profile.social_links === 'object' ? JSON.stringify(profile.social_links) : '',  // Social Links
          profile.revenue || '',               // Monthly Revenue
          commonData.status,                   // Status
          commonData.verified                  // Verified
        ];

    console.log('Formatted row data:', rowData);

    // Get Google Auth token
    console.log('Getting Google Auth token');
    const auth = await getAuthToken();
    
    // Add row to spreadsheet
    console.log('Adding row to spreadsheet');
    const response = await addRowToSheet(auth, rowData);
    console.log('Spreadsheet response:', response);

    if (!response || !response.updates) {
      throw new Error('Failed to update spreadsheet - no response from Google Sheets API');
    }

    return res.status(200).json({ 
      message: 'Successfully updated spreadsheet',
      updatedRange: response.updates?.updatedRange
    });
  } catch (error: any) {
    console.error('Error in spreadsheet handler:', {
      message: error.message,
      stack: error.stack,
      details: error.response?.data
    });

    // Return appropriate status code based on error type
    const statusCode = error.code === 403 ? 403 
      : error.code === 429 ? 429 
      : error.code === 401 ? 401 
      : 500;

    return res.status(statusCode).json({ 
      error: error.message,
      details: error.response?.data,
      code: error.code
    });
  }
} 
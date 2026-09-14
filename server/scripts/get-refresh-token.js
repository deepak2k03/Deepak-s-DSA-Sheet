const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
require('dotenv').config({ path: '../.env' }); // Load .env from parent directory

// Define the scope we need (ability to send emails)
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force consent screen to guarantee a refresh token
    scope: SCOPES,
  });

  console.log('----------------------------------------------------');
  console.log('1. Open this exact URL in your browser:');
  console.log(authUrl);
  console.log('2. Log in with the exact Gmail account you want to send emails FROM.');
  console.log('3. Click "Continue" or "Allow".');
  console.log('4. It will eventually redirect you to a page that fails to load (e.g., localhost:3000) OR it will give you a code.');
  console.log('5. Look at the URL in your browser. Copy the huge code between "code=" and "&scope="');
  console.log('----------------------------------------------------');

  rl.question('Paste the code here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(decodeURIComponent(code), (err, token) => {
      if (err) {
        console.error('Error retrieving access token:', err.response ? err.response.data : err);
        return;
      }
      if (!token.refresh_token) {
        console.error('\nERROR: Google did not return a refresh_token. This usually happens if you already granted permission before. Go to https://myaccount.google.com/permissions, remove this app, and run this script again!');
        return;
      }
      console.log('\n====================================================');
      console.log('SUCCESS! Add this exact string to your .env and Render as OAUTH_REFRESH_TOKEN:');
      console.log('\n' + token.refresh_token + '\n');
      console.log('====================================================');
    });
  });
}

function main() {
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
  
  if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID.includes('your_client')) {
    console.error('ERROR: You must set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET in your server/.env file before running this script!');
    process.exit(1);
  }

  // Use a localhost redirect URI since this is a local script
  const REDIRECT_URI = 'http://localhost';
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
  getNewToken(oAuth2Client);
}

main();

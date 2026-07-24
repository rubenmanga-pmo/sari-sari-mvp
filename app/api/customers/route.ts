import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

    // Get list of all sheet names
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const sheetNames = meta.data.sheets?.map(s => s.properties?.title) || [];

    // Try to read Customers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Customers!A1:E10',
    });

    return NextResponse.json({
      sheetNames,
      rawData: response.data.values || [],
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}

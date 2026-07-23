import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function getProducts() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Products!A2:F',
  });

  const rows = response.data.values || [];
  return rows.map((row) => ({
    id: Number(row[0]),
    name: row[1],
    price: Number(row[2]),
    category: row[3],
    stock: Number(row[4]),
    lowStock: Number(row[5]),
  }));
}

export async function getCustomers() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Customers!A2:E',
  });

  const rows = response.data.values || [];
  return rows.map((row) => ({
    id: Number(row[0]),
    name: row[1],
    phone: row[2] || '',
    balance: Number(row[3]),
    lastPayment: row[4] || '',
  }));
}

export async function appendSale(sale: {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  type: string;
  customerName?: string;
}) {
  const now = new Date().toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sales!A:J',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        Date.now(),
        now,
        sale.productId,
        sale.productName,
        sale.quantity,
        sale.price,
        sale.total,
        sale.type,
        sale.customerName || '',
        'Owner'
      ]],
    },
  });
}

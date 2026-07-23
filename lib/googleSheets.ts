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
    lowStock: Number(row[5] || 10),
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
    balance: Number(row[3] || 0),
    lastPayment: row[4] || '',
  }));
}

export async function recordSale(sale: {
  items: { id: number; name: string; price: number; quantity: number }[];
  type: 'cash' | 'credit';
  customerName?: string;
}) {
  const now = new Date().toISOString();

  // 1. Write each item to Sales sheet
  const salesRows = sale.items.map((item) => [
    Date.now() + Math.random(),
    now,
    item.id,
    item.name,
    item.quantity,
    item.price,
    item.price * item.quantity,
    sale.type,
    sale.customerName || '',
    'Owner',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sales!A:J',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: salesRows,
    },
  });

  // 2. Update stock in Products sheet
  const products = await getProducts();

  for (const item of sale.items) {
    const product = products.find((p) => p.id === item.id);
    if (product) {
      const newStock = Math.max(0, product.stock - item.quantity);
      // Find the row number (row index + 2 because of header)
      const rowIndex = products.findIndex((p) => p.id === item.id) + 2;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Products!E${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[newStock]],
        },
      });
    }
  }

  // 3. If credit sale, update customer balance
  if (sale.type === 'credit' && sale.customerName) {
    const customers = await getCustomers();
    const customer = customers.find(
      (c) => c.name.toLowerCase() === sale.customerName!.toLowerCase()
    );

    const total = sale.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (customer) {
      const newBalance = customer.balance + total;
      const rowIndex = customers.findIndex((c) => c.id === customer.id) + 2;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Customers!D${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[newBalance]],
        },
      });
    }
  }

  return { success: true };
}

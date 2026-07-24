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

// ===================== PRODUCTS =====================
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

export async function addProduct(product: {
  name: string;
  price: number;
  category: string;
  stock: number;
  lowStock?: number;
}) {
  const products = await getProducts();
  const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Products!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[nextId, product.name, product.price, product.category, product.stock, product.lowStock || 10]],
    },
  });

  return { success: true, id: nextId };
}

export async function updateProduct(product: {
  id: number;
  name: string;
  price: number;
  category: string;
  lowStock?: number;
}) {
  const products = await getProducts();
  const productIndex = products.findIndex((p) => p.id === product.id);
  if (productIndex === -1) throw new Error('Product not found');

  const rowIndex = productIndex + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Products!B${rowIndex}:D${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[product.name, product.price, product.category]],
    },
  });

  if (product.lowStock !== undefined) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Products!F${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[product.lowStock]] },
    });
  }

  return { success: true };
}

export async function updateStock(productId: number, newStock: number) {
  const products = await getProducts();
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) throw new Error('Product not found');

  const rowIndex = productIndex + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Products!E${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[Math.max(0, newStock)]] },
  });

  return { success: true };
}

// ===================== CUSTOMERS =====================
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

export async function addCustomer(customer: { name: string; phone?: string }) {
  const customers = await getCustomers();
  const nextId = customers.length > 0 ? Math.max(...customers.map((c) => c.id)) + 1 : 1;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Customers!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[nextId, customer.name, customer.phone || '', 0, '']],
    },
  });

  return { success: true, id: nextId };
}

// ===================== SALES =====================
export async function recordSale(sale: {
  items: { id: number; name: string; price: number; quantity: number }[];
  type: 'cash' | 'gcash' | 'credit';
  customerName?: string;
}) {
  const now = new Date().toISOString();
  const totalAmount = sale.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 1. Write to Sales sheet
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
    requestBody: { values: salesRows },
  });

  // 2. Update stock
  const products = await getProducts();
  for (const item of sale.items) {
    const product = products.find((p) => p.id === item.id);
    if (product) {
      const newStock = Math.max(0, product.stock - item.quantity);
      const rowIndex = products.findIndex((p) => p.id === item.id) + 2;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Products!E${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[newStock]] },
      });
    }
  }

  // 3. Update customer balance if credit
  if (sale.type === 'credit' && sale.customerName) {
    const customers = await getCustomers();
    const customer = customers.find(
      (c) => c.name.toLowerCase() === sale.customerName!.toLowerCase()
    );

    if (customer) {
      const newBalance = customer.balance + totalAmount;
      const rowIndex = customers.findIndex((c) => c.id === customer.id) + 2;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Customers!D${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[newBalance]] },
      });
    }
  }

  // 4. Auto-record Cash In for Cash and GCash sales
  if (sale.type === 'cash' || sale.type === 'gcash') {
    await recordCashFlow({
      type: 'in',
      category: sale.type === 'cash' ? 'Cash Sale' : 'GCash Sale',
      amount: totalAmount,
      notes: `Auto from sale`,
      reference: '',
    });
  }

  return { success: true };
}

// ===================== PAYMENTS =====================
export async function recordPayment(payment: {
  customerId: number;
  customerName: string;
  amount: number;
  notes?: string;
}) {
  const now = new Date().toISOString().split('T')[0];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Payments!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[Date.now(), now, payment.customerId, payment.customerName, payment.amount, payment.notes || '']],
    },
  });

  const customers = await getCustomers();
  const customer = customers.find((c) => c.id === payment.customerId);

  if (customer) {
    const newBalance = Math.max(0, customer.balance - payment.amount);
    const rowIndex = customers.findIndex((c) => c.id === customer.id) + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Customers!D${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[newBalance]] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Customers!E${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[now]] },
    });
  }

  return { success: true };
}

// ===================== CASH FLOW =====================
export async function recordCashFlow(entry: {
  type: 'in' | 'out';
  category: string;
  amount: number;
  notes?: string;
  reference?: string;
}) {
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'CashFlow!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        Date.now(),
        now,
        entry.type,
        entry.category,
        entry.amount,
        entry.notes || '',
        entry.reference || '',
      ]],
    },
  });

  return { success: true };
}

export async function getCashFlow() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'CashFlow!A2:G',
  });

  const rows = response.data.values || [];
  return rows
    .map((row) => ({
      id: row[0],
      date: row[1] ? row[1].substring(0, 16).replace('T', ' ') : '',
      type: row[2],
      category: row[3],
      amount: Number(row[4]),
      notes: row[5] || '',
      reference: row[6] || '',
    }))
    .reverse();
}

// ===================== SALES HISTORY =====================
export async function getSalesHistory() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sales!A2:J',
  });

  const rows = response.data.values || [];

  return rows
    .map((row) => ({
      id: row[0],
      date: row[1] ? row[1].substring(0, 16).replace('T', ' ') : '',
      productId: Number(row[2]),
      productName: row[3],
      quantity: Number(row[4]),
      price: Number(row[5]),
      total: Number(row[6]),
      type: row[7],
      customerName: row[8] || '',
      staff: row[9] || '',
    }))
    .reverse();
}

// ===================== DASHBOARD STATS =====================
export async function getDashboardStats() {
  const customers = await getCustomers();
  const totalCredit = customers.reduce((sum, c) => sum + c.balance, 0);

  const salesResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sales!A2:J',
  });

  const salesRows = salesResponse.data.values || [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  // Start of week (Monday)
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const weekStart = monday.toISOString().split('T')[0];

  let todaySales = 0;
  let todayTransactions = 0;
  let weekSales = 0;
  let weekTransactions = 0;
  let monthSales = 0;
  let monthTransactions = 0;
  let ytdSales = 0;
  let ytdTransactions = 0;
  let totalSales = 0;
  let totalTransactions = 0;

  const paymentBreakdown = { cash: 0, gcash: 0, credit: 0 };

  salesRows.forEach((row) => {
    const saleDateStr = row[1] ? row[1].substring(0, 10) : '';
    const total = Number(row[6]) || 0;
    const type = (row[7] || 'cash').toLowerCase();

    if (!saleDateStr) return;

    const saleDate = new Date(saleDateStr);
    const saleYear = saleDate.getFullYear();
    const saleMonth = saleDate.getMonth();

    // Total since start
    totalSales += total;
    totalTransactions += 1;

    // Today
    if (saleDateStr === today) {
      todaySales += total;
      todayTransactions += 1;
    }

    // This week
    if (saleDateStr >= weekStart) {
      weekSales += total;
      weekTransactions += 1;

      if (type === 'gcash') paymentBreakdown.gcash += total;
      else if (type === 'credit') paymentBreakdown.credit += total;
      else paymentBreakdown.cash += total;
    }

    // This month
    if (saleYear === currentYear && saleMonth === currentMonth) {
      monthSales += total;
      monthTransactions += 1;
    }

    // Year-to-date
    if (saleYear === currentYear) {
      ytdSales += total;
      ytdTransactions += 1;
    }
  });

  const products = await getProducts();
  const lowStockCount = products.filter((p) => p.stock <= p.lowStock).length;

  // CashFlow summary
  const cashFlow = await getCashFlow();
  let totalCashIn = 0;
  let totalCashOut = 0;

  cashFlow.forEach((entry) => {
    if (entry.type === 'in') totalCashIn += entry.amount;
    else totalCashOut += entry.amount;
  });

  return {
    todaySales,
    todayTransactions,
    weekSales,
    weekTransactions,
    monthSales,
    monthTransactions,
    ytdSales,
    ytdTransactions,
    totalSales,
    totalTransactions,
    totalCredit,
    lowStockCount,
    totalProducts: products.length,
    paymentBreakdown,
    totalCashIn,
    totalCashOut,
    netCash: totalCashIn - totalCashOut,
  };
}

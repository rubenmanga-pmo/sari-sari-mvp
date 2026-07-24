import { NextResponse } from 'next/server';
import { getSalesHistory } from '@/lib/googleSheets';

export async function GET() {
  try {
    const history = await getSalesHistory();
    return NextResponse.json(history);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch sales history' }, { status: 500 });
  }
}

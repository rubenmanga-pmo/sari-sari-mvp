import { NextResponse } from 'next/server';
import { recordPayment } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await recordPayment(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}

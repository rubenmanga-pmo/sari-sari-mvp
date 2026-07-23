import { NextResponse } from 'next/server';
import { recordSale } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await recordSale(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}

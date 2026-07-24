import { NextResponse } from 'next/server';
import { recordCashFlow, getCashFlow } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await getCashFlow();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch cashflow' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.type || !body.category || !body.amount) {
      return NextResponse.json({ error: 'type, category, and amount are required' }, { status: 400 });
    }

    await recordCashFlow({
      type: body.type,
      category: body.category,
      amount: Number(body.amount),
      notes: body.notes || '',
      reference: body.reference || '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to record cashflow' }, { status: 500 });
  }
}

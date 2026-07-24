import { NextResponse } from 'next/server';
import { updateStock } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.productId || body.newStock === undefined) {
      return NextResponse.json({ error: 'productId and newStock are required' }, { status: 400 });
    }

    await updateStock(Number(body.productId), Number(body.newStock));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct } from '@/lib/googleSheets';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    if (!body.price || isNaN(Number(body.price))) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    const result = await addProduct({
      name: body.name.trim(),
      price: Number(body.price),
      category: body.category?.trim() || 'Others',
      stock: Number(body.stock) || 0,
      lowStock: Number(body.lowStock) || 10,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    if (!body.price || isNaN(Number(body.price))) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    await updateProduct({
      id: Number(body.id),
      name: body.name.trim(),
      price: Number(body.price),
      category: body.category?.trim() || 'Others',
      lowStock: body.lowStock ? Number(body.lowStock) : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

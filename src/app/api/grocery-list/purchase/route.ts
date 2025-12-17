import { NextRequest, NextResponse } from 'next/server';
import { markAsPurchased } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = markAsPurchased(id);
    if (item) {
      return NextResponse.json({ item });
    } else {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}


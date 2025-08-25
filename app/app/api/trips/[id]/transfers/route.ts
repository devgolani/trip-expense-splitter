
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// POST create transfer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { fromId, toId, amount, description, date } = body;

    if (!fromId || !toId) {
      return NextResponse.json(
        { error: 'Both from and to members are required' },
        { status: 400 }
      );
    }

    if (fromId === toId) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same person' },
        { status: 400 }
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const transfer = await prisma.transfer.create({
      data: {
        tripId: params.id,
        fromId,
        toId,
        amount: parseFloat(amount),
        description: description?.trim() || null,
        date: date ? new Date(date) : new Date()
      },
      include: {
        from: true,
        to: true
      }
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { error: 'Failed to create transfer' },
      { status: 500 }
    );
  }
}

// GET transfers for trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transfers = await prisma.transfer.findMany({
      where: { tripId: params.id },
      include: {
        from: true,
        to: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfers' },
      { status: 500 }
    );
  }
}

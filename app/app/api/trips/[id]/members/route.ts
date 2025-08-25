
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// POST add member to trip
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Member name is required' },
        { status: 400 }
      );
    }

    // Check if member already exists in trip
    const existingMember = await prisma.member.findFirst({
      where: {
        tripId: params.id,
        name: name.trim()
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Member already exists in trip' },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        name: name.trim(),
        tripId: params.id
      }
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

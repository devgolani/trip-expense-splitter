
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if member has any expenses or transfers
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        paidExpenses: true,
        expenseSplits: true,
        transfersFrom: true,
        transfersTo: true
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const hasActivity = 
      member.paidExpenses.length > 0 ||
      member.expenseSplits.length > 0 ||
      member.transfersFrom.length > 0 ||
      member.transfersTo.length > 0;

    if (hasActivity) {
      return NextResponse.json(
        { error: 'Cannot delete member with expenses or transfers' },
        { status: 400 }
      );
    }

    await prisma.member.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}

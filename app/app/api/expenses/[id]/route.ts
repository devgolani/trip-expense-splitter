
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// PUT update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { description, amount, payerId, date, splits } = body;

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Validate splits if provided
    if (splits) {
      const totalSplits = splits.reduce((sum: number, split: any) => 
        sum + parseFloat(split.amount), 0
      );

      if (Math.abs(totalSplits - parseFloat(amount)) > 0.01) {
        return NextResponse.json(
          { error: 'Split amounts must equal total expense amount' },
          { status: 400 }
        );
      }
    }

    const expense = await prisma.$transaction(async (tx) => {
      // Update expense
      const updatedExpense = await tx.expense.update({
        where: { id: params.id },
        data: {
          description: description.trim(),
          amount: parseFloat(amount),
          payerId,
          date: date ? new Date(date) : undefined
        }
      });

      // Update splits if provided
      if (splits) {
        // Delete existing splits
        await tx.expenseSplit.deleteMany({
          where: { expenseId: params.id }
        });

        // Create new splits
        await tx.expenseSplit.createMany({
          data: splits.map((split: any) => ({
            expenseId: params.id,
            memberId: split.memberId,
            amount: parseFloat(split.amount)
          }))
        });
      }

      return await tx.expense.findUnique({
        where: { id: params.id },
        include: {
          payer: true,
          expenseSplits: {
            include: {
              member: true
            }
          }
        }
      });
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.expense.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}

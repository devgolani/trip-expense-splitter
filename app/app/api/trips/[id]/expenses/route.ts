
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// POST create expense
export async function POST(
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

    if (!payerId) {
      return NextResponse.json(
        { error: 'Payer is required' },
        { status: 400 }
      );
    }

    if (!splits || splits.length === 0) {
      return NextResponse.json(
        { error: 'At least one split is required' },
        { status: 400 }
      );
    }

    // Validate splits total equals expense amount
    const totalSplits = splits.reduce((sum: number, split: any) => 
      sum + parseFloat(split.amount), 0
    );

    if (Math.abs(totalSplits - parseFloat(amount)) > 0.01) {
      return NextResponse.json(
        { error: 'Split amounts must equal total expense amount' },
        { status: 400 }
      );
    }

    // Create expense with splits in a transaction
    const expense = await prisma.$transaction(async (tx) => {
      const createdExpense = await tx.expense.create({
        data: {
          description: description.trim(),
          amount: parseFloat(amount),
          payerId,
          tripId: params.id,
          date: date ? new Date(date) : new Date()
        }
      });

      // Create expense splits
      await tx.expenseSplit.createMany({
        data: splits.map((split: any) => ({
          expenseId: createdExpense.id,
          memberId: split.memberId,
          amount: parseFloat(split.amount)
        }))
      });

      return await tx.expense.findUnique({
        where: { id: createdExpense.id },
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

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

// GET expenses for trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenses = await prisma.expense.findMany({
      where: { tripId: params.id },
      include: {
        payer: true,
        expenseSplits: {
          include: {
            member: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

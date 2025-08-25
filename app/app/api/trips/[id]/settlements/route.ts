
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

interface DebtBalance {
  memberId: string;
  memberName: string;
  balance: number; // positive = owed money, negative = owes money
}

interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

// GET settlement suggestions for trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get trip with all related data
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        members: true,
        expenses: {
          include: {
            payer: true,
            expenseSplits: {
              include: {
                member: true
              }
            }
          }
        },
        transfers: {
          include: {
            from: true,
            to: true
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Calculate member balances
    const balances: Map<string, DebtBalance> = new Map();
    
    // Initialize balances for all members
    trip.members.forEach(member => {
      balances.set(member.id, {
        memberId: member.id,
        memberName: member.name,
        balance: 0
      });
    });

    // Add amounts paid by each member
    trip.expenses.forEach(expense => {
      const payer = balances.get(expense.payerId);
      if (payer) {
        payer.balance += parseFloat(expense.amount.toString());
      }
    });

    // Subtract amounts owed by each member
    trip.expenses.forEach(expense => {
      expense.expenseSplits.forEach(split => {
        const member = balances.get(split.memberId);
        if (member) {
          member.balance -= parseFloat(split.amount.toString());
        }
      });
    });

    // Apply transfers
    trip.transfers.forEach(transfer => {
      const from = balances.get(transfer.fromId);
      const to = balances.get(transfer.toId);
      const amount = parseFloat(transfer.amount.toString());
      
      if (from) from.balance += amount; // Person who sent money (reduces their debt)
      if (to) to.balance -= amount; // Person who received money (reduces what they're owed)
    });

    const memberBalances = Array.from(balances.values());

    // Calculate optimal settlements using simplified debt resolution
    const settlements = calculateOptimalSettlements(memberBalances);

    // Create settlement matrix
    const matrix: { [from: string]: { [to: string]: number } } = {};
    memberBalances.forEach(member => {
      matrix[member.memberId] = {};
      memberBalances.forEach(otherMember => {
        matrix[member.memberId][otherMember.memberId] = 0;
      });
    });

    // Fill matrix with current debts (before settlements)
    memberBalances.forEach(debtor => {
      if (debtor.balance < -0.01) { // owes money
        memberBalances.forEach(creditor => {
          if (creditor.balance > 0.01) { // is owed money
            const debt = Math.min(Math.abs(debtor.balance), creditor.balance);
            if (debt > 0.01) {
              matrix[debtor.memberId][creditor.memberId] = debt;
            }
          }
        });
      }
    });

    return NextResponse.json({
      balances: memberBalances,
      settlements,
      matrix,
      totalExpenses: trip.expenses.reduce((sum, exp) => 
        sum + parseFloat(exp.amount.toString()), 0
      ),
      totalTransfers: trip.transfers.reduce((sum, transfer) => 
        sum + parseFloat(transfer.amount.toString()), 0
      )
    });
  } catch (error) {
    console.error('Error calculating settlements:', error);
    return NextResponse.json(
      { error: 'Failed to calculate settlements' },
      { status: 500 }
    );
  }
}

function calculateOptimalSettlements(balances: DebtBalance[]): Settlement[] {
  const settlements: Settlement[] = [];
  const workingBalances = balances.map(b => ({ ...b }));
  
  // Sort debtors (negative balance) and creditors (positive balance)
  const debtors = workingBalances.filter(b => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);
  const creditors = workingBalances.filter(b => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const debtAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;
    const settlementAmount = Math.min(debtAmount, creditAmount);

    if (settlementAmount > 0.01) {
      settlements.push({
        from: debtor.memberId,
        fromName: debtor.memberName,
        to: creditor.memberId,
        toName: creditor.memberName,
        amount: Math.round(settlementAmount * 100) / 100
      });

      debtor.balance += settlementAmount;
      creditor.balance -= settlementAmount;
    }

    if (Math.abs(debtor.balance) < 0.01) {
      debtorIndex++;
    }
    if (Math.abs(creditor.balance) < 0.01) {
      creditorIndex++;
    }
  }

  return settlements;
}

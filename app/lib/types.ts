
export interface Trip {
  id: string;
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  members: Member[];
  expenses: Expense[];
  transfers: Transfer[];
}

export interface Member {
  id: string;
  name: string;
  tripId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: string | number;
  date: string;
  tripId: string;
  payerId: string;
  payer: Member;
  expenseSplits: ExpenseSplit[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  memberId: string;
  amount: string | number;
  member: Member;
  createdAt: string;
}

export interface Transfer {
  id: string;
  tripId: string;
  fromId: string;
  toId: string;
  amount: string | number;
  description?: string;
  date: string;
  from: Member;
  to: Member;
  createdAt: string;
}

export interface DebtBalance {
  memberId: string;
  memberName: string;
  balance: number;
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface SettlementData {
  balances: DebtBalance[];
  settlements: Settlement[];
  matrix: { [from: string]: { [to: string]: number } };
  totalExpenses: number;
  totalTransfers: number;
}

export interface CreateTripData {
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  payerId: string;
  date?: string;
  splits: {
    memberId: string;
    amount: number;
  }[];
}

export interface CreateTransferData {
  fromId: string;
  toId: string;
  amount: number;
  description?: string;
  date?: string;
}

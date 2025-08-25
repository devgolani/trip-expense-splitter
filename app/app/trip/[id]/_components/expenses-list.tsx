
'use client';

import React, { useState } from 'react';
import { Plus, Receipt, Trash2, Edit3, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trip, Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ExpensesListProps {
  trip: Trip;
  onRefresh: () => void;
  onAddExpense: () => void;
}

export function ExpensesList({ trip, onRefresh, onAddExpense }: ExpensesListProps) {
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    setLoadingDelete(expenseId);
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Expense deleted successfully'
        });
        onRefresh();
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive'
      });
    } finally {
      setLoadingDelete(null);
    }
  };

  const recentExpenses = trip.expenses
    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    ?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-600" />
          Recent Expenses
          <Badge variant="secondary">{trip.expenses?.length || 0}</Badge>
        </CardTitle>
        <Button onClick={onAddExpense} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        {recentExpenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Expenses Yet</h3>
            <p className="text-gray-500 mb-4">Add your first expense to get started</p>
            <Button onClick={onAddExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{expense.description}</h4>
                      <Badge className="text-xs bg-blue-100 text-blue-700">
                        {formatCurrency(parseFloat(expense.amount.toString()))}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Paid by {expense.payer?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(expense.date)}
                      </div>
                    </div>

                    {/* Split Details */}
                    {expense.expenseSplits && expense.expenseSplits.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Split among: {expense.expenseSplits.map(split => split.member?.name).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id)}
                      disabled={loadingDelete === expense.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {trip.expenses && trip.expenses.length > 5 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Showing 5 of {trip.expenses.length} expenses
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

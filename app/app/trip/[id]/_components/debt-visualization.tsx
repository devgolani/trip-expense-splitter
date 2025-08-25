
'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SettlementData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface DebtVisualizationProps {
  settlements: SettlementData;
  onTransfer: (prefilledData?: { fromId: string; toId: string; amount: string }) => void;
}

export function DebtVisualization({ settlements, onTransfer }: DebtVisualizationProps) {
  const { balances, settlements: suggestions, totalExpenses } = settlements;

  // Separate debtors and creditors
  const creditors = balances.filter(b => b.balance > 0.01);
  const debtors = balances.filter(b => b.balance < -0.01);
  const balanced = balances.filter(b => Math.abs(b.balance) <= 0.01);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{creditors.length}</div>
            <div className="text-sm text-green-600">To Receive</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">{debtors.length}</div>
            <div className="text-sm text-red-600">To Pay</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{balanced.length}</div>
            <div className="text-sm text-blue-600">Settled</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{suggestions.length}</div>
            <div className="text-sm text-purple-600">Transfers Needed</div>
          </CardContent>
        </Card>
      </div>

      {/* Member Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Current Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {balances
              .sort((a, b) => b.balance - a.balance)
              .map((member) => (
                <div key={member.memberId} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      member.balance > 0.01 
                        ? 'bg-green-500' 
                        : member.balance < -0.01 
                          ? 'bg-red-500' 
                          : 'bg-gray-400'
                    }`} />
                    <span className="font-medium">{member.memberName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={member.balance > 0.01 ? "default" : member.balance < -0.01 ? "destructive" : "secondary"}
                      className="text-sm"
                    >
                      {member.balance > 0.01 
                        ? `+${formatCurrency(member.balance)}` 
                        : member.balance < -0.01 
                          ? formatCurrency(member.balance)
                          : formatCurrency(0)
                      }
                    </Badge>
                    {member.balance > 0.01 && (
                      <span className="text-xs text-green-600">will receive</span>
                    )}
                    {member.balance < -0.01 && (
                      <span className="text-xs text-red-600">owes money</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Settlement Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-700">💡 Optimal Settlement Plan</CardTitle>
            <Button onClick={() => onTransfer()} size="sm">
              Record Transfer
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((settlement, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 cursor-pointer hover:from-green-100 hover:to-blue-100 hover:border-green-300 transition-all duration-200"
                  onClick={() => onTransfer({
                    fromId: settlement.from,
                    toId: settlement.to,
                    amount: settlement.amount.toString()
                  })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-lg">
                        <span className="font-semibold text-red-700">{settlement.fromName}</span>
                        <span className="mx-2 text-gray-500">→</span>
                        <span className="font-semibold text-green-700">{settlement.toName}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Click to record transfer of {formatCurrency(settlement.amount)}
                      </div>
                    </div>
                    <Badge className="text-lg font-bold bg-blue-100 text-blue-700">
                      {formatCurrency(settlement.amount)}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="text-sm text-gray-600 mt-4 p-3 bg-blue-50 rounded border">
                💡 <strong>Tip:</strong> Click on any transfer above to pre-fill the Record Transfer form. Complete these {suggestions.length} transfer{suggestions.length !== 1 ? 's' : ''} to settle all debts with the minimum number of transactions.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Settled Message */}
      {suggestions.length === 0 && totalExpenses > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">All Settled!</h3>
            <p className="text-green-700">
              Everyone's expenses are balanced. No transfers needed!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

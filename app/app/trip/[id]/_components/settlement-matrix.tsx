
'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettlementData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface SettlementMatrixProps {
  settlements: SettlementData;
  onTransfer: () => void;
}

export function SettlementMatrix({ settlements, onTransfer }: SettlementMatrixProps) {
  const { balances, matrix } = settlements;

  if (balances.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settlement Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500">Add at least 2 members to see the settlement matrix</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Settlement Matrix</CardTitle>
        <Button onClick={onTransfer} size="sm" variant="outline">
          Record Transfer
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <div className="grid gap-2 min-w-max" style={{ gridTemplateColumns: `100px repeat(${balances.length}, 1fr)` }}>
              {/* Header Row */}
              <div></div>
              {balances.map((member) => (
                <div key={member.memberId} className="text-xs font-medium text-center p-2 bg-gray-50 rounded">
                  {member.memberName.length > 8 ? `${member.memberName.substring(0, 8)}...` : member.memberName}
                </div>
              ))}

              {/* Data Rows */}
              {balances.map((fromMember) => (
                <React.Fragment key={fromMember.memberId}>
                  <div className="text-xs font-medium flex items-center p-2 bg-gray-50 rounded">
                    {fromMember.memberName.length > 12 ? `${fromMember.memberName.substring(0, 12)}...` : fromMember.memberName}
                  </div>
                  {balances.map((toMember) => {
                    const amount = matrix[fromMember.memberId]?.[toMember.memberId] || 0;
                    const isFromSelf = fromMember.memberId === toMember.memberId;
                    
                    return (
                      <div 
                        key={toMember.memberId}
                        className={`
                          text-xs text-center p-2 rounded border min-h-[2.5rem] flex items-center justify-center
                          ${isFromSelf 
                            ? 'bg-gray-100 text-gray-400' 
                            : amount > 0.01 
                              ? 'bg-red-50 border-red-200 text-red-700 cursor-pointer hover:bg-red-100' 
                              : 'bg-white text-gray-300'
                          }
                        `}
                        onClick={() => !isFromSelf && amount > 0.01 && onTransfer()}
                      >
                        {isFromSelf 
                          ? '—' 
                          : amount > 0.01 
                            ? `₹${amount.toFixed(0)}` 
                            : '—'
                        }
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="text-xs text-gray-600 space-y-1 mt-4 p-3 bg-gray-50 rounded">
            <div className="font-medium mb-2">How to read:</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>Amount person in row owes to person in column</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border rounded"></div>
              <span>No debt between these members</span>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              💡 Click on any red cell to record a transfer
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-gray-600">Members</div>
              <div className="text-xl font-bold text-blue-700">{balances.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Outstanding Debts</div>
              <div className="text-xl font-bold text-red-700">
                {Object.values(matrix).reduce((total, row) => 
                  total + Object.values(row).filter(amount => amount > 0.01).length, 0
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

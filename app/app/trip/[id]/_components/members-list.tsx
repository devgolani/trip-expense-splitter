
'use client';

import React, { useState } from 'react';
import { Users, Plus, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trip, Member } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface MembersListProps {
  trip: Trip;
  onRefresh: () => void;
  onAddMember: () => void;
}

export function MembersList({ trip, onRefresh, onAddMember }: MembersListProps) {
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member? This action cannot be undone if they have expenses or transfers.')) {
      return;
    }

    setLoadingDelete(memberId);
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Member removed successfully'
        });
        onRefresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive'
      });
    } finally {
      setLoadingDelete(null);
    }
  };

  const getMemberStats = (member: Member) => {
    const paidExpenses = trip.expenses?.filter(exp => exp.payerId === member.id) || [];
    const involvedExpenses = trip.expenses?.filter(exp => 
      exp.expenseSplits?.some(split => split.memberId === member.id)
    ) || [];
    
    const totalPaid = paidExpenses.reduce((sum, exp) => 
      sum + parseFloat(exp.amount.toString()), 0
    );
    
    return {
      paidCount: paidExpenses.length,
      totalPaid,
      involvedCount: involvedExpenses.length
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Trip Members
          <Badge variant="secondary">{trip.members?.length || 0}</Badge>
        </CardTitle>
        <Button onClick={onAddMember} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {!trip.members || trip.members.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Members Yet</h3>
            <p className="text-gray-500 mb-4">Add members to start splitting expenses</p>
            <Button onClick={onAddMember}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Member
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {trip.members.map((member) => {
              const stats = getMemberStats(member);
              
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow bg-gradient-to-r from-white to-green-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {stats.paidCount > 0 && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            Paid {stats.paidCount} expense{stats.paidCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {stats.involvedCount > 0 && (
                          <span>
                            • In {stats.involvedCount} expense{stats.involvedCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {stats.totalPaid > 0 && (
                      <Badge variant="outline" className="text-xs">
                        ₹{stats.totalPaid.toFixed(0)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={loadingDelete === member.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

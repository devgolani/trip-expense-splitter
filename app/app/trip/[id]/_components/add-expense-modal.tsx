
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Receipt, Users, DollarSign, Calendar } from 'lucide-react';
import { Trip, CreateExpenseData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { parseAmount } from '@/lib/utils';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  onSuccess: () => void;
}

interface SplitMember {
  id: string;
  name: string;
  selected: boolean;
  amount: string;
}

export function AddExpenseModal({ open, onClose, trip, onSuccess }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    payerId: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [splitMembers, setSplitMembers] = useState<SplitMember[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && trip.members) {
      // Initialize split members
      setSplitMembers(
        trip.members.map(member => ({
          id: member.id,
          name: member.name,
          selected: true,
          amount: '0'
        }))
      );
    }
  }, [open, trip.members]);

  useEffect(() => {
    // Update split amounts when total amount or split type changes
    if (splitType === 'equal' && formData.amount) {
      const totalAmount = parseAmount(formData.amount);
      const selectedMembers = splitMembers.filter(m => m.selected);
      const perPersonAmount = selectedMembers.length > 0 ? totalAmount / selectedMembers.length : 0;
      
      setSplitMembers(prev => prev.map(member => ({
        ...member,
        amount: member.selected ? perPersonAmount.toFixed(2) : '0'
      })));
    }
  }, [formData.amount, splitType, splitMembers.map(m => `${m.id}:${m.selected}`).join(',')]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || !formData.payerId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const selectedMembers = splitMembers.filter(m => m.selected);
    if (selectedMembers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one member to split the expense',
        variant: 'destructive'
      });
      return;
    }

    const totalSplitAmount = selectedMembers.reduce((sum, member) => 
      sum + parseAmount(member.amount), 0
    );
    
    const expenseAmount = parseAmount(formData.amount);
    if (Math.abs(totalSplitAmount - expenseAmount) > 0.01) {
      toast({
        title: 'Error',
        description: `Split amounts (₹${totalSplitAmount.toFixed(2)}) must equal expense amount (₹${expenseAmount.toFixed(2)})`,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const expenseData: CreateExpenseData = {
        description: formData.description.trim(),
        amount: expenseAmount,
        payerId: formData.payerId,
        date: formData.date,
        splits: selectedMembers.map(member => ({
          memberId: member.id,
          amount: parseAmount(member.amount)
        }))
      };

      const response = await fetch(`/api/trips/${trip.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Expense added successfully!'
        });
        onSuccess();
        handleClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add expense',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form
      setTimeout(() => {
        setFormData({
          description: '',
          amount: '',
          payerId: '',
          date: new Date().toISOString().split('T')[0]
        });
        setSplitType('equal');
      }, 200);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSplitMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, selected: !member.selected } : member
    ));
  };

  const handleCustomAmountChange = (memberId: string, amount: string) => {
    setSplitMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, amount } : member
    ));
  };

  const totalSplitAmount = splitMembers
    .filter(m => m.selected)
    .reduce((sum, member) => sum + parseAmount(member.amount), 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="description"
                placeholder="e.g., Dinner at restaurant"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payer">
                Paid by <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.payerId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, payerId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {trip.members?.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Split Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Split Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={splitType === 'equal' ? 'default' : 'outline'}
                  onClick={() => setSplitType('equal')}
                >
                  Equal Split
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={splitType === 'custom' ? 'default' : 'outline'}
                  onClick={() => setSplitType('custom')}
                >
                  Custom Split
                </Button>
              </div>
            </div>

            {/* Members Split */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              <Label>Split among members:</Label>
              {splitMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={member.selected}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <span className="font-medium">{member.name}</span>
                  </div>
                  {splitType === 'custom' && member.selected && (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={member.amount}
                      onChange={(e) => handleCustomAmountChange(member.id, e.target.value)}
                      className="w-24 text-right"
                    />
                  )}
                  {splitType === 'equal' && member.selected && (
                    <span className="text-sm text-gray-600">₹{member.amount}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Split Summary */}
            <div className="p-3 bg-gray-50 rounded text-sm">
              <div className="flex justify-between">
                <span>Total Expense:</span>
                <span className="font-medium">₹{parseAmount(formData.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Split:</span>
                <span className={`font-medium ${
                  Math.abs(totalSplitAmount - parseAmount(formData.amount)) > 0.01 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  ₹{totalSplitAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Selected Members:</span>
                <span className="font-medium">{splitMembers.filter(m => m.selected).length}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

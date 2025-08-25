
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Calendar, MessageCircle } from 'lucide-react';
import { Trip, CreateTransferData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { parseAmount, formatCurrency } from '@/lib/utils';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  onSuccess: () => void;
  prefilledData?: {
    fromId?: string;
    toId?: string;
    amount?: string;
  };
}

export function TransferModal({ open, onClose, trip, onSuccess, prefilledData }: TransferModalProps) {
  const [formData, setFormData] = useState({
    fromId: prefilledData?.fromId || '',
    toId: prefilledData?.toId || '',
    amount: prefilledData?.amount || '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Update form data when prefilled data changes or modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        fromId: prefilledData?.fromId || '',
        toId: prefilledData?.toId || '',
        amount: prefilledData?.amount || '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [open, prefilledData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromId || !formData.toId || !formData.amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (formData.fromId === formData.toId) {
      toast({
        title: 'Error',
        description: 'Sender and receiver cannot be the same person',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseAmount(formData.amount);
    if (amount <= 0) {
      toast({
        title: 'Error',
        description: 'Amount must be greater than zero',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const transferData: CreateTransferData = {
        fromId: formData.fromId,
        toId: formData.toId,
        amount,
        description: formData.description.trim() || undefined,
        date: formData.date
      };

      const response = await fetch(`/api/trips/${trip.id}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Transfer recorded successfully!'
        });
        onSuccess();
        handleClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to record transfer');
      }
    } catch (error) {
      console.error('Error recording transfer:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to record transfer',
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
          fromId: '',
          toId: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
      }, 200);
    }
  };

  const fromMember = trip.members?.find(m => m.id === formData.fromId);
  const toMember = trip.members?.find(m => m.id === formData.toId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Record Transfer
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transfer Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromMember">
                  From <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.fromId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, fromId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Sender" />
                  </SelectTrigger>
                  <SelectContent>
                    {trip.members?.map((member) => (
                      <SelectItem 
                        key={member.id} 
                        value={member.id}
                        disabled={member.id === formData.toId}
                      >
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toMember">
                  To <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.toId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, toId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Receiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {trip.members?.map((member) => (
                      <SelectItem 
                        key={member.id} 
                        value={member.id}
                        disabled={member.id === formData.fromId}
                      >
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transfer Preview */}
            {fromMember && toMember && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center text-blue-700">
                  <span className="font-semibold">{fromMember.name}</span>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <span className="font-semibold">{toMember.name}</span>
                </div>
              </div>
            )}

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
                <Label htmlFor="date" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
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
              <Label htmlFor="description" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Description (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="e.g., Settlement for dinner expenses"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>

          {/* Amount Preview */}
          {formData.amount && parseAmount(formData.amount) > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(parseAmount(formData.amount))}
              </div>
              <div className="text-sm text-green-600">Transfer Amount</div>
            </div>
          )}

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
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSubmitting ? 'Recording...' : 'Record Transfer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  onSuccess: () => void;
}

export function AddMemberModal({ open, onClose, tripId, onSuccess }: AddMemberModalProps) {
  const [memberName, setMemberName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a member name',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: memberName.trim() })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Member added successfully!'
        });
        onSuccess();
        handleClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add member',
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
        setMemberName('');
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Add Trip Member
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberName">
              Member Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="memberName"
              placeholder="e.g., John Doe"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              disabled={isSubmitting}
              required
              autoFocus
            />
            <p className="text-sm text-gray-600">
              Add a friend or family member to this trip to start splitting expenses together.
            </p>
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
              disabled={!memberName.trim() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

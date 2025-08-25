
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Plus, Archive, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trip, SettlementData } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ExpensesList } from './expenses-list';
import { MembersList } from './members-list';
import { SettlementMatrix } from './settlement-matrix';
import { DebtVisualization } from './debt-visualization';
import { AddExpenseModal } from './add-expense-modal';
import { AddMemberModal } from './add-member-modal';
import { TransferModal } from './transfer-modal';

interface TripClientProps {
  tripId: string;
}

export function TripClient({ tripId }: TripClientProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [settlements, setSettlements] = useState<SettlementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferPrefilledData, setTransferPrefilledData] = useState<{
    fromId?: string;
    toId?: string;
    amount?: string;
  } | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const [tripResponse, settlementsResponse] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/settlements`)
      ]);

      if (tripResponse.ok) {
        const tripData = await tripResponse.json();
        setTrip(tripData);
      } else if (tripResponse.status === 404) {
        toast({
          title: 'Trip Not Found',
          description: 'The trip you are looking for does not exist.',
          variant: 'destructive'
        });
        return;
      }

      if (settlementsResponse.ok) {
        const settlementsData = await settlementsResponse.json();
        setSettlements(settlementsData);
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trip data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveTrip = async () => {
    if (!trip) return;

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trip, archived: !trip.archived })
      });

      if (response.ok) {
        const updatedTrip = await response.json();
        setTrip(updatedTrip);
        toast({
          title: 'Success',
          description: `Trip ${updatedTrip.archived ? 'archived' : 'unarchived'} successfully`
        });
      }
    } catch (error) {
      console.error('Error archiving trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive trip',
        variant: 'destructive'
      });
    }
  };

  const handleShareTrip = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: `${trip?.name} - Trip Expenses`,
          text: `Check out our trip expenses for ${trip?.name}`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link Copied',
          description: 'Trip link copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
    }
  };

  const handleOpenTransfer = (prefilledData?: { fromId: string; toId: string; amount: string }) => {
    setTransferPrefilledData(prefilledData);
    setIsTransferOpen(true);
  };

  const handleCloseTransfer = () => {
    setIsTransferOpen(false);
    setTransferPrefilledData(undefined);
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-8">Loading...</div>;
  }

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
            <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalExpenses = trip.expenses?.reduce((sum, exp) => 
    sum + parseFloat(exp.amount.toString()), 0) || 0;
  const memberCount = trip.members?.length || 0;
  const expenseCount = trip.expenses?.length || 0;
  const transferCount = trip.transfers?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Trip Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <CardContent className="relative p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </Link>
                {trip.archived && (
                  <Badge variant="secondary">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-800">{trip.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {trip.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {trip.location}
                  </div>
                )}
                {(trip.startDate || trip.endDate) && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {trip.startDate && formatDate(trip.startDate)}
                    {trip.startDate && trip.endDate && ' - '}
                    {trip.endDate && formatDate(trip.endDate)}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {memberCount} member{memberCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleShareTrip}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleArchiveTrip}
              >
                <Archive className="h-4 w-4 mr-1" />
                {trip.archived ? 'Unarchive' : 'Archive'}
              </Button>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 count-animation">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-sm text-blue-600">Total Expenses</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700 count-animation">
                {expenseCount}
              </div>
              <div className="text-sm text-green-600">Expenses</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700 count-animation">
                {transferCount}
              </div>
              <div className="text-sm text-purple-600">Transfers</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700 count-animation">
                {formatCurrency(memberCount > 0 ? totalExpenses / memberCount : 0)}
              </div>
              <div className="text-sm text-orange-600">Per Person</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Debt Visualization */}
          {settlements && (
            <DebtVisualization 
              settlements={settlements} 
              onTransfer={handleOpenTransfer}
            />
          )}

          {/* Recent Expenses */}
          <ExpensesList 
            trip={trip} 
            onRefresh={fetchTripData}
            onAddExpense={() => setIsAddExpenseOpen(true)}
          />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Members List */}
          <MembersList 
            trip={trip} 
            onRefresh={fetchTripData}
            onAddMember={() => setIsAddMemberOpen(true)}
          />

          {/* Settlement Matrix */}
          {settlements && (
            <SettlementMatrix 
              settlements={settlements}
              onTransfer={() => handleOpenTransfer()}
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsAddExpenseOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button onClick={() => setIsAddMemberOpen(true)} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button onClick={() => handleOpenTransfer()} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Record Transfer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddExpenseModal
        open={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        trip={trip}
        onSuccess={fetchTripData}
      />

      <AddMemberModal
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        tripId={tripId}
        onSuccess={fetchTripData}
      />

      <TransferModal
        open={isTransferOpen}
        onClose={handleCloseTransfer}
        trip={trip}
        onSuccess={fetchTripData}
        prefilledData={transferPrefilledData}
      />
    </div>
  );
}

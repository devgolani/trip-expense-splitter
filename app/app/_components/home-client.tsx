
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Calendar, Users, Archive, ExternalLink, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trip } from '@/lib/types';
import { CreateTripModal } from './create-trip-modal';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HomeClient() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [archivedTrips, setArchivedTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const [activeResponse, archivedResponse] = await Promise.all([
        fetch('/api/trips?archived=false'),
        fetch('/api/trips?archived=true')
      ]);

      if (activeResponse.ok) {
        const activeTrips = await activeResponse.json();
        setTrips(activeTrips);
      }

      if (archivedResponse.ok) {
        const archived = await archivedResponse.json();
        setArchivedTrips(archived);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trips',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const searchTrips = async () => {
    if (!searchTerm?.trim()) {
      fetchTrips();
      return;
    }

    try {
      const response = await fetch(`/api/trips?search=${encodeURIComponent(searchTerm)}&archived=${showArchived}`);
      if (response.ok) {
        const searchResults = await response.json();
        if (showArchived) {
          setArchivedTrips(searchResults);
        } else {
          setTrips(searchResults);
        }
      }
    } catch (error) {
      console.error('Error searching trips:', error);
      toast({
        title: 'Error',
        description: 'Failed to search trips',
        variant: 'destructive'
      });
    }
  };

  const handleCreateTrip = async (tripData: any) => {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      });

      if (response.ok) {
        const newTrip = await response.json();
        setTrips(prev => [newTrip, ...prev]);
        setIsCreateModalOpen(false);
        toast({
          title: 'Success',
          description: 'Trip created successfully!'
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create trip');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create trip',
        variant: 'destructive'
      });
    }
  };

  const calculateTripStats = (trip: Trip) => {
    const totalExpenses = trip.expenses?.reduce((sum, expense) => 
      sum + parseFloat(expense.amount.toString()), 0
    ) || 0;
    
    const memberCount = trip.members?.length || 0;
    const expenseCount = trip.expenses?.length || 0;
    
    return { totalExpenses, memberCount, expenseCount };
  };

  const displayedTrips = showArchived ? archivedTrips : trips;

  if (loading) {
    return <div className="text-center py-8">Loading trips...</div>;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = '/login';
  };

  return (
    <div className="space-y-8">
      {/* User Profile Section */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white/70 hover:bg-white/90">
              <User className="h-4 w-4 mr-2" />
              {session?.user?.name || session?.user?.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>{session?.user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search and Create Section */}
      <Card className="glass-effect border-white/20">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Search Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Search className="h-6 w-6 text-blue-600" />
                Find Your Trip
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Search trips by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchTrips()}
                  className="bg-white/70"
                />
                <Button onClick={searchTrips} variant="outline" className="bg-white/70">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={!showArchived ? "default" : "outline"}
                  onClick={() => setShowArchived(false)}
                  size="sm"
                >
                  Active Trips
                </Button>
                <Button
                  variant={showArchived ? "default" : "outline"}
                  onClick={() => setShowArchived(true)}
                  size="sm"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archived ({archivedTrips.length})
                </Button>
              </div>
            </div>

            {/* Create Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Plus className="h-6 w-6 text-green-600" />
                Start New Adventure
              </h2>
              <p className="text-gray-600">
                Create a new trip to start splitting expenses with your travel companions.
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Trip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trips Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">
            {showArchived ? 'Archived Trips' : 'Your Recent Trips'}
          </h2>
          {displayedTrips.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {displayedTrips.length} trip{displayedTrips.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {displayedTrips.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">
                  {showArchived ? 'No Archived Trips' : 'No Trips Yet'}
                </h3>
                <p className="text-gray-500">
                  {showArchived 
                    ? 'Your archived trips will appear here.' 
                    : 'Start your first adventure by creating a new trip!'
                  }
                </p>
                {!showArchived && (
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Trip
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTrips.map((trip) => {
              const stats = calculateTripStats(trip);
              return (
                <Card key={trip.id} className="trip-card hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate text-lg">{trip.name}</span>
                      {trip.archived && (
                        <Archive className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </CardTitle>
                    {trip.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{trip.location}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-700">
                            {formatCurrency(stats.totalExpenses)}
                          </div>
                          <div className="text-xs text-blue-600">Total</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-700 flex items-center justify-center">
                            <Users className="h-3 w-3 mr-1" />
                            {stats.memberCount}
                          </div>
                          <div className="text-xs text-green-600">Members</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-semibold text-purple-700">{stats.expenseCount}</div>
                          <div className="text-xs text-purple-600">Expenses</div>
                        </div>
                      </div>

                      {(trip.startDate || trip.endDate) && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {trip.startDate && new Date(trip.startDate).toLocaleDateString()}
                          {trip.startDate && trip.endDate && ' - '}
                          {trip.endDate && new Date(trip.endDate).toLocaleDateString()}
                        </div>
                      )}

                      <Link href={`/trip/${trip.id}`}>
                        <Button className="w-full" variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Trip
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreateTripModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
    </div>
  );
}

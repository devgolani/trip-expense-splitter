
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

// GET specific trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const trip = await prisma.trip.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id
      },
      include: {
        members: true,
        expenses: {
          include: {
            payer: true,
            expenseSplits: {
              include: {
                member: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        },
        transfers: {
          include: {
            from: true,
            to: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT update trip
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, location, startDate, endDate, archived } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Trip name is required' },
        { status: 400 }
      );
    }

    // First check if the user owns this trip
    const existingTrip = await prisma.trip.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        archived: archived ?? undefined
      },
      include: {
        members: true,
        expenses: {
          include: {
            payer: true,
            expenseSplits: {
              include: {
                member: true
              }
            }
          }
        },
        transfers: {
          include: {
            from: true,
            to: true
          }
        }
      }
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First check if the user owns this trip
    const existingTrip = await prisma.trip.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    await prisma.trip.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}

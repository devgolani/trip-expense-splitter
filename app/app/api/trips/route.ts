
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

// GET all trips
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const archived = searchParams.get('archived') === 'true';

    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id,
        archived,
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        })
      },
      include: {
        members: true,
        expenses: {
          include: {
            expenseSplits: true
          }
        },
        transfers: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST create new trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, location, startDate, endDate } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Trip name is required' },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: session.user.id
      },
      include: {
        members: true,
        expenses: {
          include: {
            expenseSplits: true
          }
        },
        transfers: true
      }
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}

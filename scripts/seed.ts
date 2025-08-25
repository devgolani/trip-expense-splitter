
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  const testUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
    },
  });

  console.log('👤 Created test user');

  // Create sample trips
  const goa = await prisma.trip.create({
    data: {
      name: 'Goa Beach Vacation',
      location: 'Goa, India',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-05'),
      archived: false,
      userId: testUser.id,
    },
  });

  const manali = await prisma.trip.create({
    data: {
      name: 'Manali Adventure',
      location: 'Manali, Himachal Pradesh',
      startDate: new Date('2024-11-15'),
      endDate: new Date('2024-11-20'),
      archived: false,
      userId: testUser.id,
    },
  });

  const kerala = await prisma.trip.create({
    data: {
      name: 'Kerala Backwaters',
      location: 'Alleppey, Kerala',
      startDate: new Date('2024-10-10'),
      endDate: new Date('2024-10-14'),
      archived: true,
      userId: testUser.id,
    },
  });

  // Create members for Goa trip
  const goaMembers = await Promise.all([
    prisma.member.create({
      data: { name: 'Arjun', tripId: goa.id },
    }),
    prisma.member.create({
      data: { name: 'Priya', tripId: goa.id },
    }),
    prisma.member.create({
      data: { name: 'Rahul', tripId: goa.id },
    }),
    prisma.member.create({
      data: { name: 'Neha', tripId: goa.id },
    }),
  ]);

  // Create members for Manali trip
  const manaliMembers = await Promise.all([
    prisma.member.create({
      data: { name: 'Vikram', tripId: manali.id },
    }),
    prisma.member.create({
      data: { name: 'Anita', tripId: manali.id },
    }),
    prisma.member.create({
      data: { name: 'Kiran', tripId: manali.id },
    }),
  ]);

  // Create members for Kerala trip
  const keralaMembers = await Promise.all([
    prisma.member.create({
      data: { name: 'Suresh', tripId: kerala.id },
    }),
    prisma.member.create({
      data: { name: 'Meera', tripId: kerala.id },
    }),
  ]);

  console.log('👥 Created members');

  // Create expenses for Goa trip
  const goaExpenses = [
    {
      description: 'Beach Resort Accommodation',
      amount: new Decimal(24000),
      payerId: goaMembers[0].id, // Arjun
      date: new Date('2024-12-01'),
      splits: goaMembers.map(member => ({ memberId: member.id, amount: new Decimal(6000) }))
    },
    {
      description: 'Dinner at Beach Shack',
      amount: new Decimal(3200),
      payerId: goaMembers[1].id, // Priya
      date: new Date('2024-12-02'),
      splits: goaMembers.map(member => ({ memberId: member.id, amount: new Decimal(800) }))
    },
    {
      description: 'Water Sports Activities',
      amount: new Decimal(4800),
      payerId: goaMembers[2].id, // Rahul
      date: new Date('2024-12-02'),
      splits: [
        { memberId: goaMembers[0].id, amount: new Decimal(1200) },
        { memberId: goaMembers[1].id, amount: new Decimal(1200) },
        { memberId: goaMembers[2].id, amount: new Decimal(1200) },
        { memberId: goaMembers[3].id, amount: new Decimal(1200) },
      ]
    },
    {
      description: 'Taxi to Airport',
      amount: new Decimal(1600),
      payerId: goaMembers[3].id, // Neha
      date: new Date('2024-12-05'),
      splits: goaMembers.map(member => ({ memberId: member.id, amount: new Decimal(400) }))
    },
    {
      description: 'Breakfast at Hotel',
      amount: new Decimal(1200),
      payerId: goaMembers[0].id, // Arjun
      date: new Date('2024-12-03'),
      splits: goaMembers.map(member => ({ memberId: member.id, amount: new Decimal(300) }))
    },
  ];

  for (const expenseData of goaExpenses) {
    const expense = await prisma.expense.create({
      data: {
        description: expenseData.description,
        amount: expenseData.amount,
        payerId: expenseData.payerId,
        tripId: goa.id,
        date: expenseData.date,
      },
    });

    await prisma.expenseSplit.createMany({
      data: expenseData.splits.map(split => ({
        expenseId: expense.id,
        memberId: split.memberId,
        amount: split.amount,
      })),
    });
  }

  // Create expenses for Manali trip
  const manaliExpenses = [
    {
      description: 'Mountain Resort Stay',
      amount: new Decimal(15000),
      payerId: manaliMembers[0].id, // Vikram
      date: new Date('2024-11-15'),
      splits: manaliMembers.map(member => ({ memberId: member.id, amount: new Decimal(5000) }))
    },
    {
      description: 'Adventure Activities',
      amount: new Decimal(9000),
      payerId: manaliMembers[1].id, // Anita
      date: new Date('2024-11-17'),
      splits: manaliMembers.map(member => ({ memberId: member.id, amount: new Decimal(3000) }))
    },
    {
      description: 'Local Sightseeing',
      amount: new Decimal(4500),
      payerId: manaliMembers[2].id, // Kiran
      date: new Date('2024-11-18'),
      splits: manaliMembers.map(member => ({ memberId: member.id, amount: new Decimal(1500) }))
    },
  ];

  for (const expenseData of manaliExpenses) {
    const expense = await prisma.expense.create({
      data: {
        description: expenseData.description,
        amount: expenseData.amount,
        payerId: expenseData.payerId,
        tripId: manali.id,
        date: expenseData.date,
      },
    });

    await prisma.expenseSplit.createMany({
      data: expenseData.splits.map(split => ({
        expenseId: expense.id,
        memberId: split.memberId,
        amount: split.amount,
      })),
    });
  }

  // Create expenses for Kerala trip
  const keralaExpenses = [
    {
      description: 'Houseboat Rental',
      amount: new Decimal(8000),
      payerId: keralaMembers[0].id, // Suresh
      date: new Date('2024-10-11'),
      splits: keralaMembers.map(member => ({ memberId: member.id, amount: new Decimal(4000) }))
    },
    {
      description: 'Traditional Kerala Meals',
      amount: new Decimal(1200),
      payerId: keralaMembers[1].id, // Meera
      date: new Date('2024-10-12'),
      splits: keralaMembers.map(member => ({ memberId: member.id, amount: new Decimal(600) }))
    },
  ];

  for (const expenseData of keralaExpenses) {
    const expense = await prisma.expense.create({
      data: {
        description: expenseData.description,
        amount: expenseData.amount,
        payerId: expenseData.payerId,
        tripId: kerala.id,
        date: expenseData.date,
      },
    });

    await prisma.expenseSplit.createMany({
      data: expenseData.splits.map(split => ({
        expenseId: expense.id,
        memberId: split.memberId,
        amount: split.amount,
      })),
    });
  }

  console.log('💰 Created expenses');

  // Create some transfers for Goa trip to demonstrate settlement
  await prisma.transfer.create({
    data: {
      tripId: goa.id,
      fromId: goaMembers[1].id, // Priya
      toId: goaMembers[0].id,   // to Arjun
      amount: new Decimal(1500),
      description: 'Partial settlement for accommodation',
      date: new Date('2024-12-03'),
    },
  });

  await prisma.transfer.create({
    data: {
      tripId: manali.id,
      fromId: manaliMembers[1].id, // Anita
      toId: manaliMembers[0].id,   // to Vikram
      amount: new Decimal(2000),
      description: 'Settlement for resort payment',
      date: new Date('2024-11-19'),
    },
  });

  console.log('🔄 Created transfers');

  console.log('✅ Seeding completed successfully!');
  console.log(`
📊 Summary:
- Created 3 trips (2 active, 1 archived)
- Created 9 members across all trips
- Created 10 expenses with splits
- Created 2 transfers
- Goa trip: 4 members, 5 expenses
- Manali trip: 3 members, 3 expenses  
- Kerala trip: 2 members, 2 expenses (archived)
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

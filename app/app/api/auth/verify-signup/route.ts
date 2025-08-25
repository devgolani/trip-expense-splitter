
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { verifyOtpCode } from '../../../../lib/otp';
import { prisma } from '../../../../lib/db';
import { OtpType } from '@prisma/client';

const verifySignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  otpCode: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, otpCode } = verifySignupSchema.parse(body);

    // Verify OTP code
    const isValidOtp = await verifyOtpCode(email, otpCode, OtpType.EMAIL_VERIFICATION);
    if (!isValidOtp) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: 'User already exists and is verified' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        emailVerified: new Date(),
      },
      create: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        emailVerified: new Date(),
      },
    });

    // Return success without password
    return NextResponse.json({
      message: 'Account created and verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Verify signup error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify account' },
      { status: 500 }
    );
  }
}

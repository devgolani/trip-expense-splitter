
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createOtpCode } from '../../../../lib/otp';
import { sendEmail, generateOtpEmailTemplate } from '../../../../lib/email';
import { prisma } from '../../../../lib/db';
import { OtpType } from '@prisma/client';

const sendOtpSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = sendOtpSchema.parse(body);

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: 'User already exists and is verified' },
        { status: 400 }
      );
    }

    // Generate and send OTP
    const otpCode = await createOtpCode(email, OtpType.EMAIL_VERIFICATION);
    const emailTemplate = generateOtpEmailTemplate(otpCode, 'verification');
    
    await sendEmail({
      to: email,
      subject: 'TripSplit - Email Verification Code',
      html: emailTemplate,
    });

    return NextResponse.json({
      message: 'Verification code sent successfully',
      email: email,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createOtpCode } from '../../../../lib/otp';
import { sendEmail, generateOtpEmailTemplate } from '../../../../lib/email';
import { prisma } from '../../../../lib/db';
import { OtpType } from '@prisma/client';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, we don't reveal if the user exists or not
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset code has been sent',
      });
    }

    // Generate and send OTP
    const otpCode = await createOtpCode(email, OtpType.PASSWORD_RESET, user.id);
    const emailTemplate = generateOtpEmailTemplate(otpCode, 'reset');
    
    await sendEmail({
      to: email,
      subject: 'TripSplit - Password Reset Code',
      html: emailTemplate,
    });

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset code has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

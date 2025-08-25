
import { prisma } from './db';
import { OtpType } from '@prisma/client';
import CryptoJS from 'crypto-js';

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtpCode(email: string, type: OtpType, userId?: string): Promise<string> {
  // Delete any existing unused OTP codes for this email and type
  await prisma.otpCode.deleteMany({
    where: {
      email,
      type,
      used: false,
    },
  });

  const code = generateOtp();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expires in 10 minutes

  await prisma.otpCode.create({
    data: {
      email,
      code,
      type,
      userId,
      expires: expiresAt,
    },
  });

  return code;
}

export async function verifyOtpCode(email: string, code: string, type: OtpType): Promise<boolean> {
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      type,
      used: false,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Mark OTP as used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return true;
}

export function generatePasswordResetToken(): string {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

export async function createPasswordResetToken(email: string, userId: string): Promise<string> {
  // Delete any existing unused tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
      used: false,
    },
  });

  const token = generatePasswordResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Expires in 1 hour

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      userId,
      expires: expiresAt,
    },
  });

  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<{ email: string; userId: string } | null> {
  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      used: false,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!tokenRecord) {
    return null;
  }

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: tokenRecord.id },
    data: { used: true },
  });

  return {
    email: tokenRecord.email,
    userId: tokenRecord.userId,
  };
}

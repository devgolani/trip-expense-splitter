
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Plane, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

type ResetStep = 'email' | 'otp-verification';

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const router = useRouter();

  const sendResetOtp = async () => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to send reset code');
        return false;
      }

      return true;
    } catch (error) {
      toast.error('Failed to send reset code');
      return false;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await sendResetOtp();
      if (success) {
        toast.success('Reset code sent to your email!');
        setCurrentStep('otp-verification');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otpCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to reset password');
        return;
      }

      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      const success = await sendResetOtp();
      if (success) {
        toast.success('New reset code sent!');
      }
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="p-2 bg-blue-600 rounded-full">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TripSplit</h1>
        </div>
        <CardTitle className="text-xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a reset code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Sending code...' : 'Send Reset Code'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-800 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to login</span>
          </Link>
        </div>
      </CardContent>
    </>
  );

  const renderOtpStep = () => (
    <>
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="p-2 bg-blue-600 rounded-full">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl">Reset Your Password</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to <br />
          <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otpCode">Reset Code</Label>
            <Input
              id="otpCode"
              name="otpCode"
              type="text"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              disabled={isLoading}
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading || otpCode.length !== 6 || newPassword.length < 6}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        
        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button 
              onClick={handleResendOtp}
              disabled={isResendingOtp}
              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
            >
              {isResendingOtp ? 'Resending...' : 'Resend'}
            </button>
          </p>
          
          <button
            onClick={() => setCurrentStep('email')}
            className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-800 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Change email</span>
          </button>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {currentStep === 'email' ? renderEmailStep() : renderOtpStep()}
      </Card>
    </div>
  );
}

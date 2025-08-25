
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Plane, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type SignupStep = 'form' | 'otp-verification';

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState<SignupStep>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const sendVerificationOtp = async () => {
    try {
      const response = await fetch('/api/auth/send-verification-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to send verification code');
        return false;
      }

      return true;
    } catch (error) {
      toast.error('Failed to send verification code');
      return false;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await sendVerificationOtp();
      if (success) {
        toast.success('Verification code sent to your email!');
        setCurrentStep('otp-verification');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Invalid verification code');
        return;
      }

      toast.success('Account verified successfully!');
      
      // Automatically sign in after successful verification
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error('Account created but login failed. Please try signing in manually.');
        router.push('/login');
      } else {
        router.push('/');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      const success = await sendVerificationOtp();
      if (success) {
        toast.success('New verification code sent!');
      }
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const renderFormStep = () => (
    <>
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="p-2 bg-blue-600 rounded-full">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TripSplit</h1>
        </div>
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to start managing your trip expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
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
            disabled={isLoading}
          >
            {isLoading ? 'Sending verification code...' : 'Continue'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
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
        <CardTitle className="text-xl">Check Your Email</CardTitle>
        <CardDescription>
          We sent a 6-digit verification code to <br />
          <strong>{formData.email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otpCode">Verification Code</Label>
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
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading || otpCode.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Create Account'}
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
            onClick={() => setCurrentStep('form')}
            className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-800 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to form</span>
          </button>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {currentStep === 'form' ? renderFormStep() : renderOtpStep()}
      </Card>
    </div>
  );
}

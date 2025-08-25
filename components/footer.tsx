
'use client';

import React from 'react';
import { Heart, Coffee, Plane, Users, CreditCard, Infinity, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function Footer() {
  const handleCoffeeClick = () => {
    window.open(
      'https://paypal.me/deveshgolani',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handlePayPalEmailClick = () => {
    window.open(
      'https://paypal.me/deveshgolani',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <footer className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Brand and Free Features */}
          <div className="space-y-8">
            {/* Logo and Tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                  <Plane className="h-8 w-8 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">TripSplit</h3>
                  <p className="text-blue-200">Split expenses, not friendships</p>
                </div>
              </div>
            </div>

            {/* Free Features Highlight */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500/20 rounded-full p-2">
                    <Heart className="h-5 w-5 text-green-300" />
                  </div>
                  <h4 className="text-xl font-semibold text-white">
                    100% Free Forever
                  </h4>
                </div>
                
                <div className="space-y-3 text-blue-100">
                  <p className="text-lg font-medium">
                    Unlike other platforms, TripSplit is completely free with no hidden fees or premium tiers!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <Plane className="h-5 w-5 text-blue-300 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-1">
                          <Infinity className="h-4 w-4 text-green-300" />
                          <span className="font-semibold text-white">Unlimited Trips</span>
                        </div>
                        <p className="text-sm text-blue-200">Create as many as you want</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <Users className="h-5 w-5 text-blue-300 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-1">
                          <Infinity className="h-4 w-4 text-green-300" />
                          <span className="font-semibold text-white">Unlimited Members</span>
                        </div>
                        <p className="text-sm text-blue-200">No limit on group size</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <CreditCard className="h-5 w-5 text-blue-300 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-1">
                          <Infinity className="h-4 w-4 text-green-300" />
                          <span className="font-semibold text-white">Unlimited Transactions</span>
                        </div>
                        <p className="text-sm text-blue-200">Track every expense</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Buy Me Coffee */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-orange-600/80 to-amber-600/80 backdrop-blur-sm border-amber-300/50 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-amber-400/30 rounded-full p-4 shadow-lg">
                        <Coffee className="h-12 w-12 text-amber-100" />
                      </div>
                    </div>
                    
                    <h4 className="text-2xl font-bold text-white drop-shadow-lg">
                      Enjoying TripSplit?
                    </h4>
                    
                    <p className="text-amber-50 text-lg leading-relaxed font-medium drop-shadow-sm">
                      If this free platform has saved you time and money on your trips, 
                      consider buying me a coffee! ☕
                    </p>
                    
                    <div className="bg-black/20 rounded-lg p-4 space-y-2 backdrop-blur-sm">
                      <p className="text-amber-50 font-semibold drop-shadow-sm">
                        Your support helps keep TripSplit free for everyone
                      </p>
                      <p className="text-sm text-amber-100 drop-shadow-sm">
                        Every contribution goes towards server costs and new features
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={handleCoffeeClick}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-xl transform transition-all duration-200 hover:scale-105 border-2 border-white/10"
                    >
                      <Coffee className="mr-2 h-5 w-5" />
                      Buy Me a Coffee ☕
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <p className="text-xs text-amber-50 flex items-center justify-center gap-2 drop-shadow-sm">
                      <span>💌 Secured by PayPal:</span>
                      <button 
                        onClick={handlePayPalEmailClick}
                        className="underline hover:text-white transition-colors font-medium"
                      >
                        devesh.golani@gmail.com
                      </button>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fun Stats */}
            <div className="bg-white/5 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-white mb-4 text-center">
                Made with ❤️ for travelers worldwide
              </h5>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-300">∞</div>
                  <div className="text-sm text-blue-200">Free Forever</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-300">0%</div>
                  <div className="text-sm text-blue-200">Commission</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-300">100%</div>
                  <div className="text-sm text-blue-200">Open Source Spirit</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200 text-center md:text-left">
              © 2025 TripSplit. Made with love for the travel community. 
              <span className="block md:inline mt-1 md:mt-0 md:ml-2">
                No ads, no tracking, no premium tiers - just pure functionality.
              </span>
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-blue-200">
                <Heart className="h-4 w-4 text-red-300" />
                <span className="text-sm">Free & Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 opacity-10">
        <Coffee className="h-16 w-16 text-white animate-pulse" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <Plane className="h-20 w-20 text-white animate-bounce" style={{ animationDuration: '3s' }} />
      </div>
    </footer>
  );
}

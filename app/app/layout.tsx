
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster as ShadcnToaster } from '@/components/ui/toaster'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/providers'
import { Footer } from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TripSplit - Expense Splitting for Travel Groups',
  description: 'Split expenses easily with friends during your travels. Track costs, manage debts, and settle up seamlessly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-gray-50">
                {children}
              </div>
              <Footer />
            </div>
            <ShadcnToaster />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}

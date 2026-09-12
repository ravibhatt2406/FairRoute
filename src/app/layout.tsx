import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'FAIRROUTE AI — Intelligent & Fair Relief Logistics',
  description: 'AI logistics platform that balances essential-goods allocation, Jain’s fairness scoring, vehicle capacity constraints, and dynamic route optimization during crisis operations.',
  keywords: ['Humanitarian Logistics', 'Relief Allocation', 'Jain’s Fairness Index', 'AI Routing', 'Vehicle Capacity Bin-Packing', 'Crisis Logistics'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-cyan-100 selection:text-cyan-900">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

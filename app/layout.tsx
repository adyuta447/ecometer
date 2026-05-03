import type {Metadata} from 'next';
import { Inter, EB_Garamond } from 'next/font/google';
import './globals.css'; // Global styles
import { DashboardLayout } from '@/components/DashboardLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EcoMeter Dashboard',
  description: 'EcoMeter: Transforming ESG from cost center to profit driver.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${ebGaramond.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}

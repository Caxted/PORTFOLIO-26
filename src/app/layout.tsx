import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const cormorant = Cormorant_Garamond({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'], 
  variable: '--font-serif',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Sangeeth — Full-Stack Builder & AI Engineer',
  description: 'Full-stack builder (mobile + web + enterprise backend) with growing specialization in AI integration and LLM/web security.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

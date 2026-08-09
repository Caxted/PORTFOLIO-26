import type { Metadata } from 'next';
import { Anton, Cormorant_Garamond, Inter, Instrument_Serif, Outfit } from 'next/font/google';
import SmoothScroll from '@/components/SmoothScroll';
// Lenis's recommended stylesheet — without it, html.lenis-stopped (modal open)
// and the anchor-jump behaviour in SmoothScroll.tsx have no effect.
import 'lenis/dist/lenis.css';
import './globals.css';

/**
 * Display face — stands in for Druk Super Condensed.
 *
 * Druk is a retail typeface from Commercial Type and cannot be redistributed,
 * so it is not bundled here. Anton is the closest freely-licensable match:
 * same super-condensed proportions, heavy weight and flat terminals. If a Druk
 * licence is bought, drop the woff2 into /public/fonts and uncomment the
 * @font-face in globals.css — the stack already prefers it, so it takes over
 * with no other change.
 */
const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * UI/subheading face — stands in for San Francisco UI Text.
 *
 * SF is licensed for Apple-platform use and may not be served as a webfont, so
 * the stack in globals.css asks for the real system SF first (`-apple-system`)
 * and falls back to Inter, which is the closest freely-licensable neo-grotesque,
 * everywhere else.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

/**
 * Contact-details face — stands in for Aeonik.
 *
 * Aeonik is a retail typeface from CoType Foundry and cannot be redistributed,
 * so it is not bundled. Outfit is the closest freely-licensable match: the same
 * geometric skeleton, circular bowls, horizontal-bar 'e' and low stroke
 * contrast. As with Druk, the stack in globals.css lists 'Aeonik' first, so a
 * licensed copy dropped into /public/fonts takes over with no other change.
 */
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-details',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap'
});
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  variable: '--font-italic',
  display: 'swap',
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
    <html lang="en" className={`${cormorant.variable} ${instrumentSerif.variable} ${anton.variable} ${inter.variable} ${outfit.variable}`}>
      <body>
        <div className="grain-overlay" aria-hidden="true" />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

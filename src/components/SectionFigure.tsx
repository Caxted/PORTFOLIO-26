'use client';

import Image from 'next/image';

type Side = 'left' | 'right' | 'center';

/**
 * A cut-out marble figure sitting behind a section's content.
 *
 * Same construction as the hero and contact backdrops: the source is a subject
 * on pure black, matted to transparency by scripts/build-hero-matte.mjs, so the
 * figure sits on the section's own plate with no photo rectangle, no visible
 * edge and no separate grade to fight.
 *
 * All motion is driven by GSAP ScrollTrigger from page.tsx — the classes here
 * are the handles it addresses. Nothing animates on its own, so a section
 * scrolled past costs nothing.
 */
export default function SectionFigure({
  src,
  side = 'right',
  className = '',
}: {
  src: string;
  side?: Side;
  className?: string;
}) {
  return (
    <div className={`section-figure section-figure-${side} ${className}`} aria-hidden="true">
      <div className="section-figure-plate">
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="section-figure-img"
        />
      </div>

      {/* Sweeps across the marble once the section is in view */}
      <div className="section-figure-sheen" />
    </div>
  );
}

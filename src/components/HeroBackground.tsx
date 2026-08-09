'use client';

/**
 * Lower half of the hero stack: the black plate.
 *
 * The figure itself is NOT drawn here. It lives entirely in <HeroForeground>,
 * above the wordmark, as an alpha cutout — which is what puts the name behind
 * the statue's head.
 *
 * An earlier pass also painted the full source PNG here as a safety net under
 * the cutout. That was worse than useless: the source is opaque black outside
 * the figure, so its letterboxed band covered the glow and left a visible hard
 * seam wherever the band ended — obvious on narrow viewports where the band is
 * only a slice of the screen. The cutout already draws the whole figure, so the
 * extra layer bought nothing and cost a second full-size image download.
 */
export default function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      {/* Base plate — also the flash guard before the PNG decodes */}
      <div className="hero-bg-base" />

    </div>
  );
}

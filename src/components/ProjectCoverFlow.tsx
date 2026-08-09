'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface CoverFlowProject {
  n: string;
  t: string;
  subtitle: string;
  tags: string;
  year: string;
  role: string;
  techStack: string;
  d: string;
  features: string[];
  icon: ReactNode;
}

const pad = (n: number) => String(n).padStart(2, '0');

// Distance-from-active → transform. Cards recede in Z and tip on X as they
// move away from the centre, so the stack reads as depth rather than a flat
// vertical list. Clamped rather than left to grow unbounded so a project six
// slots away doesn't rotate past legibility before it's hidden by opacity.
function cardStyle(offset: number): React.CSSProperties {
  const abs = Math.abs(offset);
  const scale = Math.max(0.56, 1 - abs * 0.16);
  const rotateX = Math.max(-40, Math.min(40, offset * -18));
  const translateZ = -abs * 90;
  const translateY = offset * 108;
  const opacity = abs > 3.4 ? 0 : Math.max(0, 1 - abs * 0.3);
  return {
    transform: `translate(-50%, -50%) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
    opacity,
    zIndex: 100 - Math.round(abs),
    pointerEvents: abs > 3 ? 'none' : 'auto',
  };
}

/**
 * Vertical cover flow: a receding stack of project cards on the right, the
 * focused project's copy on the left. Entirely self-contained — wheel/touch/
 * keyboard navigation is scoped to the rail itself, so it never reaches for
 * the page's own scroll the way the folder section it replaced did (that was
 * a pinned ScrollTrigger spanning 1200% of scroll height; this has no
 * ScrollTrigger at all).
 */
export default function ProjectCoverFlow({ projects }: { projects: CoverFlowProject[] }) {
  const [active, setActive] = useState(0);
  const count = projects.length;
  const activeProject = projects[active];

  const railRef = useRef<HTMLDivElement>(null);
  const wheelLocked = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback((i: number) => {
    setActive(((i % count) + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Native listener, not React's onWheel: React attaches wheel/touch handlers
  // passively by default, so e.preventDefault() inside a JSX onWheel is a
  // silent no-op (logs a console warning) — the page would scroll AND the
  // cards would cycle at once. { passive: false } here is what actually lets
  // the rail own wheel input while the page scroll underneath stays put.
  //
  // preventDefault alone isn't enough, though: Lenis owns its own wheel
  // listener on window and drives scroll from JS, not from the browser's
  // native scroll action, so it still receives (and acts on) this event once
  // it bubbles past the rail regardless of preventDefault. stopPropagation
  // keeps it from ever reaching Lenis in the first place.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (wheelLocked.current || Math.abs(e.deltaY) < 4) return;
      wheelLocked.current = true;
      if (e.deltaY > 0) next(); else prev();
      // Matches the card transition duration below — one card change per
      // gesture instead of a wheel event's worth of deltaY skipping several.
      window.setTimeout(() => { wheelLocked.current = false; }, 550);
    };

    rail.addEventListener('wheel', onWheel, { passive: false });
    return () => rail.removeEventListener('wheel', onWheel);
  }, [next, prev]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(count - 1); }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (Math.abs(delta) < 32) return;
    if (delta < 0) next(); else prev();
  };

  return (
    <div className="coverflow">
      <div className="coverflow-text" key={active}>
        <div className="coverflow-text-index t-micro">{pad(active + 1)} / {pad(count)}</div>
        <div className="coverflow-text-tag t-micro">{activeProject.subtitle}</div>
        <h3 className="coverflow-text-title f-cond">{activeProject.t}</h3>
        <p className="coverflow-text-desc f-mono">{activeProject.d}</p>
        <div className="coverflow-text-features">
          {activeProject.features.map((f) => (
            <span key={f} className="coverflow-feature-tag">{f}</span>
          ))}
        </div>
        <div className="coverflow-text-meta">
          <div>
            <span className="coverflow-meta-label">Role</span>
            <span className="coverflow-meta-value">{activeProject.role}</span>
          </div>
          <div>
            <span className="coverflow-meta-label">Tech Stack</span>
            <span className="coverflow-meta-value">{activeProject.techStack}</span>
          </div>
          <div>
            <span className="coverflow-meta-label">Year</span>
            <span className="coverflow-meta-value">{activeProject.year}</span>
          </div>
        </div>
      </div>

      <div className="coverflow-right">
        <div
          className="coverflow-rail"
          tabIndex={0}
          role="listbox"
          aria-label="Projects"
          aria-activedescendant={`coverflow-card-${active}`}
          ref={railRef}
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="coverflow-track">
            {projects.map((p, i) => (
              <button
                key={p.t}
                id={`coverflow-card-${i}`}
                type="button"
                role="option"
                aria-selected={i === active}
                className={`coverflow-card${i === active ? ' is-active' : ''}`}
                style={cardStyle(i - active)}
                onClick={() => goTo(i)}
              >
                <span className="coverflow-card-num f-cond">{p.n}</span>
                <span className="coverflow-card-icon">{p.icon}</span>
                <span className="coverflow-card-title f-cond">{p.t}</span>
                <span className="coverflow-card-tags t-micro">{p.tags}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="coverflow-nav">
          <button type="button" className="coverflow-nav-btn" onClick={prev} aria-label="Previous project">
            <ChevronUp size={16} strokeWidth={2} />
          </button>
          <div className="coverflow-dots">
            {projects.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`coverflow-dot${i === active ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to project ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" className="coverflow-nav-btn" onClick={next} aria-label="Next project">
            <ChevronDown size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

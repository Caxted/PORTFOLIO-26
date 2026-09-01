'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export interface WheelProject {
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

/** Handle the pinned scrub in page.tsx drives the rim through. */
export interface WheelController {
  /** 0 → 1 across the whole wheel travel: project 0 focused → last focused. */
  setProgress(p: number): void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Degrees of arc between adjacent cards on the rim. */
export const WHEEL_STEP = 23;

/**
 * Fade profile, in slots from the focused card: solid out to FADE_FULL, gone
 * by FADE_OUT.
 *
 * FADE_OUT has to stay below half the project count (3 slots for six), because
 * that is where a card wraps to the far end of the rim. Fading by angle rather
 * than with a gradient over the container is the whole reason this works: past
 * about 60° the arc curves back toward the hub, so the card three slots out
 * sits almost on top of the one two slots out. Distance along the rim
 * separates those cleanly where distance across the box cannot.
 */
const FADE_FULL = 1.25;
const FADE_OUT = 2.65;

/**
 * The projects as a rotating wheel standing to the right of the sword-bearer.
 *
 * Cards sit on the rim of a circle whose centre is parked off the right edge,
 * so what you see is the wheel's left flank: a vertical arc bulging toward the
 * figure, cards rising from the lower right, coming upright at nine o'clock
 * where the focused one sits, and falling away to the upper right. Each card
 * tilts with the rim rather than being held upright, which is what makes it
 * read as one turning object instead of a column of cards on a curved path.
 *
 * The rim is endless. Each card's offset from the focus is wrapped into
 * (-count/2, count/2], so a card leaving the top reappears at the bottom and
 * there is never a bare stretch of rim — while a project still appears exactly
 * once, because it occupies exactly one slot. The wrap itself is invisible: it
 * happens three slots out, and FADE_OUT has taken the card to zero before then.
 *
 * Rotation is NOT owned here. The pinned ScrollTrigger in page.tsx calls
 * `setProgress` every frame through `controllerRef`, and that writes two custom
 * properties per card straight to the DOM — off React's render path entirely.
 * Only the focused index goes through state, and that changes at most
 * `projects.length` times across the whole section.
 *
 * Clicking a card or arrowing to it doesn't move the rim directly either: it
 * asks the page to scroll to that card's slot in the pinned range via
 * `onSelect`, so scroll position and rim angle can never disagree.
 */
export default function ProjectWheel({
  projects,
  controllerRef,
  onSelect,
}: {
  projects: WheelProject[];
  controllerRef?: React.MutableRefObject<WheelController | null>;
  onSelect?: (index: number) => void;
}) {
  const [active, setActive] = useState(0);
  const cardsRef = useRef<Array<HTMLButtonElement | null>>([]);
  // Mirrors `active` for the rAF-rate progress callback, which must not read
  // state (it would close over a stale value between renders).
  const activeRef = useRef(0);
  const count = projects.length;
  const activeProject = projects[active];

  /** Place every card on the rim for a focus position, measured in slots. */
  const layout = useCallback((pos: number) => {
    for (let i = 0; i < count; i++) {
      const el = cardsRef.current[i];
      if (!el) continue;
      // Shortest way round: wrap the offset into (-count/2, count/2].
      let d = i - pos;
      d -= Math.round(d / count) * count;
      const dist = Math.abs(d);
      const o = dist <= FADE_FULL
        ? 1
        : Math.max(0, (FADE_OUT - dist) / (FADE_OUT - FADE_FULL));
      el.style.setProperty('--a', String(d * WHEEL_STEP));
      el.style.setProperty('--o', o.toFixed(3));
    }
  }, [count]);

  useEffect(() => {
    if (!controllerRef) {
      layout(0);
      return;
    }
    const ref = controllerRef;
    ref.current = {
      setProgress(p) {
        const pos = Math.max(0, Math.min(count - 1, p * (count - 1)));
        layout(pos);
        const i = Math.round(pos);
        if (i !== activeRef.current) {
          activeRef.current = i;
          setActive(i);
        }
      },
    };
    // Seed the rim before the first scroll frame, or every card sits stacked on
    // the focus slot until the pin engages.
    layout(activeRef.current);
    return () => { ref.current = null; };
  }, [controllerRef, count, layout]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    let target: number | null = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') target = Math.min(count - 1, active + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') target = Math.max(0, active - 1);
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = count - 1;
    if (target === null) return;
    e.preventDefault();
    onSelect?.(target);
  };

  return (
    <div className="projwheel-scene">
      {/* Focused project's copy, tucked under the figure on the left */}
      <div className="projwheel-text" key={active}>
        <div className="projwheel-text-index t-micro">{pad(active + 1)} / {pad(count)}</div>
        <div className="projwheel-text-tag t-micro">{activeProject.subtitle}</div>
        <h3 className="projwheel-text-title f-cond">{activeProject.t}</h3>
        <p className="projwheel-text-desc f-mono">{activeProject.d}</p>
        <div className="projwheel-text-meta">
          <div>
            <span className="projwheel-meta-label">Role</span>
            <span className="projwheel-meta-value">{activeProject.role}</span>
          </div>
          <div>
            <span className="projwheel-meta-label">Tech Stack</span>
            <span className="projwheel-meta-value">{activeProject.techStack}</span>
          </div>
          <div>
            <span className="projwheel-meta-label">Year</span>
            <span className="projwheel-meta-value">{activeProject.year}</span>
          </div>
        </div>
      </div>

      <div
        className="projwheel"
        role="listbox"
        tabIndex={0}
        aria-label="Projects"
        aria-activedescendant={`projwheel-card-${active}`}
        onKeyDown={onKeyDown}
      >
        <div className="projwheel-hub">
          {/* The rim itself, so the cards read as mounted on something */}
          <div className="projwheel-rim" aria-hidden="true" />
          {projects.map((p, i) => (
            <button
              key={p.t}
              id={`projwheel-card-${i}`}
              ref={(el) => { cardsRef.current[i] = el; }}
              type="button"
              role="option"
              aria-selected={i === active}
              className={`projwheel-card${i === active ? ' is-active' : ''}`}
              onClick={() => onSelect?.(i)}
            >
              {/* Placement on the rim lives on the button and changes every
                  frame; everything that eases on a focus change lives on the
                  face, so no transition ever fights the scrub. */}
              <span className="projwheel-card-face">
                <span className="projwheel-card-num f-cond">{p.n}</span>
                <span className="projwheel-card-icon">{p.icon}</span>
                <span className="projwheel-card-title f-cond">{p.t}</span>
                <span className="projwheel-card-tags t-micro">{p.tags}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Outside .projwheel on purpose: that element carries the arc mask, and
          anything inside it — dots included — gets faded by the same gradient
          that trims the rim at the container edges. */}
      <div className="projwheel-dots">
        {projects.map((p, i) => (
          <button
            key={p.t}
            type="button"
            className={`projwheel-dot${i === active ? ' is-active' : ''}`}
            onClick={() => onSelect?.(i)}
            aria-label={`Go to project ${i + 1}: ${p.t}`}
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';

export interface SkillNode {
  category: string;
  name: string;
  detail: string;
  icon: ReactNode;
}

// Rounded to a fixed precision so server- and client-computed trig results
// (which can differ in the last bit across JS engines) always serialize
// identically and never trip a hydration mismatch.
function round(n: number) {
  return Math.round(n * 10000) / 10000;
}

function polarPoint(angleDeg: number, radiusPercent: number, center = 50) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: round(center + radiusPercent * Math.cos(rad)),
    y: round(center + radiusPercent * Math.sin(rad)),
  };
}

const NODE_RADIUS = 40;
const TICK_COUNT = 48;

/**
 * The wheel + its per-skill floating windows on the left, an optional
 * heading slot on the right (see the `heading` prop — page.tsx passes the
 * "Design Originates From Life." title through it, so the section reads as
 * one scene instead of a heading screen and a separate widget screen below
 * it). No shared "active" state any more: each floating window carries its
 * own icon/category/name and reveals its description on hover/focus, so
 * nothing elsewhere needs to react to a selection.
 */
export default function SkillWheel({ items, heading }: { items: SkillNode[]; heading?: ReactNode }) {
  const count = items.length;

  return (
    <div className="skillwheel-wrap">
      {/* Stage. The section's own David figure shows through here now (see
          .skillwheel-stage's transparent background), so the drawn HUD grid
          and rotating sweep that used to stand in for a backdrop were just
          clutter on top of a real photo — only the grain and the vignette
          (legibility, not decoration) stay. */}
      <div className="skillwheel-stage">
        <div className="skillwheel-stage-grain" aria-hidden="true" />
        <div className="skillwheel-stage-vignette" aria-hidden="true" />

        <div className="skillwheel-layout">
          <div className="skillwheel-root gsap-skillwheel">
            <svg className="skillwheel-svg" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="47" className="skillwheel-ring-outer" />
              <circle cx="50" cy="50" r="33" className="skillwheel-ring-inner" />

              <g className="skillwheel-ring-rotate" style={{ transformOrigin: '50px 50px' }}>
                {Array.from({ length: TICK_COUNT }).map((_, i) => {
                  const a = (i / TICK_COUNT) * 360;
                  const long = i % 4 === 0;
                  const p1 = polarPoint(a, 43);
                  const p2 = polarPoint(a, long ? 40 : 41.6);
                  return (
                    <line
                      key={i}
                      x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                      className={long ? 'skillwheel-tick skillwheel-tick-long' : 'skillwheel-tick'}
                    />
                  );
                })}
              </g>

              {items.map((_, i) => {
                const angle = (i / count) * 360;
                const p = polarPoint(angle, NODE_RADIUS);
                return (
                  <line
                    key={i}
                    x1="50" y1="50" x2={p.x} y2={p.y}
                    className="skillwheel-spoke"
                  />
                );
              })}

              <g transform="translate(50,50)">
                <circle r="13" className="skillwheel-hub-ring" />
                <polygon points="0,-7.5 6.5,5.5 -6.5,5.5" className="skillwheel-hub-mark" />
                <circle r="2" className="skillwheel-hub-dot" />
              </g>
            </svg>

            {items.map((item, i) => {
              const angle = (i / count) * 360;
              const p = polarPoint(angle, NODE_RADIUS);
              return (
                <div
                  key={item.category}
                  className="skillwheel-node-pos"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <div
                    className="skillwheel-window gsap-skill-node"
                    tabIndex={0}
                    style={{ animationDelay: `${i * -0.7}s` }}
                    aria-label={`${item.category}: ${item.name}. ${item.detail}`}
                  >
                    <div className="skillwheel-window-bar">
                      <span className="skillwheel-window-dot" />
                      <span className="skillwheel-window-cat">{item.category}</span>
                    </div>
                    <div className="skillwheel-window-body">
                      <span className="skillwheel-window-icon">{item.icon}</span>
                      <span className="skillwheel-window-name">{item.name}</span>
                    </div>
                    <div className="skillwheel-window-detail">{item.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {heading && <div className="skillwheel-heading-slot">{heading}</div>}
        </div>
      </div>
    </div>
  );
}

'use client';

import { createContext, useContext, useEffect, useRef, type RefObject } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EMPTY: RefObject<Lenis | null> = { current: null };
const LenisContext = createContext<RefObject<Lenis | null>>(EMPTY);

/**
 * A ref to the live Lenis instance (null until it mounts).
 *
 * Deliberately a ref rather than state: the only consumers read it from inside
 * a rAF/ticker callback, so publishing it through state would re-render the
 * whole page on mount to deliver a value nothing renders from.
 */
export const useLenisRef = () => useContext(LenisContext);

/**
 * Drives the whole page through Lenis (darkroomengineering/lenis) and hands
 * the RAF loop to GSAP so Lenis and ScrollTrigger tick on the same frame —
 * without this bridge, scrubbed timelines lag one frame behind the smoothed
 * scroll position and every pinned section jitters.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect the OS "reduce motion" setting: smoothing the scroll is exactly
    // the kind of vestibular trigger that preference exists to switch off.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const instance = new Lenis({
      // Kept short deliberately: this is the actual source of scroll-linked
      // animations feeling like they "trail" input — every scrub-tied
      // ScrollTrigger tracks this smoothed value 1:1 (see ScrollTrigger.update
      // below), so whatever glide Lenis takes to settle is glide every scrubbed
      // element visibly rides too. Longer durations (~1.15s+) read as
      // noticeably laggy; this keeps the eased "weighted" feel without it.
      duration: 0.6,
      // Expo-out: fast take-off, short glide to rest — the curve that reads as
      // "weighted" rather than floaty.
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      // Native momentum already feels right on touch; syncing it fights the OS.
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
      // Lenis takes over in-page #anchor jumps so nav links glide instead of teleport.
      anchors: { offset: 0, duration: 1.6 },
      // GSAP's ticker owns the RAF loop below.
      autoRaf: false,
    });

    const onScroll = () => ScrollTrigger.update();
    instance.on('scroll', onScroll);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    // GSAP normally drops a frame's delta after a stall; that desyncs Lenis, so disable it.
    gsap.ticker.lagSmoothing(0);

    lenisRef.current = instance;

    return () => {
      instance.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}

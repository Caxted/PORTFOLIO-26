'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import HeroBackground from '@/components/HeroBackground';
import HeroForeground from '@/components/HeroForeground';
import SectionFigure from '@/components/SectionFigure';
import SkillWheel from '@/components/SkillWheel';
import ProjectCoverFlow from '@/components/ProjectCoverFlow';
import { useLenisRef } from '@/components/SmoothScroll';
import { Code, Activity, Leaf, LayoutDashboard, Wifi, FileWarning, Map, ArrowUpRight, Smartphone, Database, Building2, BrainCircuit, ShieldHalf } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { n: '01', t: 'CowTrack', subtitle: 'AI-POWERED LIVESTOCK HEALTH MONITORING PLATFORM', tags: 'CV • FLUTTER', year: '2026', role: 'Full-Stack Developer\n& Machine Learning Engineer', techStack: 'Flutter, Dart\nTensorFlow Lite, YOLOv8\nFirebase, Hive (Local DB)\nREST APIs', d: 'CowTrack is an end-to-end livestock health monitoring platform that uses YOLO-based computer vision to detect diseases in cows in real time. The system works offline-first and syncs data when connected, enabling reliable use in rural environments.', features: ['YOLO Computer Vision', 'Real-time Detection', 'Cross-platform', 'Offline Sync'], icon: <Activity size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
  { n: '02', t: 'Leaflet', subtitle: 'GAMIFIED BOTANICAL CARE COMPANION', tags: 'FLUTTER • UX', year: '2023', role: 'Mobile Developer\n& UX Designer', techStack: 'Flutter, Dart\nRiverpod, Animations\nLocal Storage', d: 'A highly gamified botanical care companion app. Designed rich micro-interactions and immersive animations to reward users for real-world plant maintenance, increasing 30-day user retention by turning chores into a digital pet experience.', features: ['Micro-interactions', 'Gamification', 'Local Notifications', 'State Management'], icon: <Leaf size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
  { n: '03', t: 'LIFE-OS', subtitle: 'PERSONAL COMMAND CENTER DASHBOARD', tags: 'PRODUCTIVITY', year: '2023', role: 'UI/UX Designer\n& Frontend Developer', techStack: 'React, Next.js\nTailwind CSS\nFramer Motion', d: 'A comprehensive personal command center. Architected a dynamic dashboard integrating habit tracking, calendar synchronization, and modular widgets using React, wrapped in a brutalist yet highly functional aesthetic.', features: ['Modular Widgets', 'Calendar Sync', 'Habit Tracking', 'Brutalist UI'], icon: <LayoutDashboard size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
  { n: '04', t: 'Fake WiFi', subtitle: 'PROACTIVE NETWORK DEFENSE TOOL', tags: 'ML • SECURITY', year: '2026', role: 'Security Researcher\n& ML Engineer', techStack: 'Python, Scikit-learn\nWireshark, Scapy\nPandas, Bash', d: 'A proactive network defense tool. Developed an ML-driven anomaly detection engine capable of fingerprinting rogue access points and Evil Twin attacks in real-time, instantly alerting users to potential traffic interception.', features: ['Anomaly Detection', 'Packet Sniffing', 'Real-time Alerts', 'Rogue AP Fingerprinting'], icon: <Wifi size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
  { n: '05', t: 'Fake Loan', subtitle: 'PREDATORY LENDING SCAM DETECTOR', tags: 'AI FRAUD', year: '2026', role: 'AI Engineer\n& Data Scientist', techStack: 'Python, NLP\nRandom Forest\nFlask API', d: 'A financial security mechanism. Trained and deployed an NLP and Random Forest ensemble model to analyze loan offer linguistics and metadata, successfully identifying predatory lending scams with 94% accuracy.', features: ['NLP Linguistics', 'Ensemble Modeling', 'Fraud Detection', 'API Integration'], icon: <FileWarning size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
  { n: '06', t: 'Fault Line', subtitle: 'GEOLOGICAL RISK ANALYSIS PLATFORM', tags: 'NEXT.JS', year: '2023', role: 'Full-Stack Developer\n& System Architect', techStack: 'Next.js, WebGL\nSupabase, PostGIS\nMulti-Agent LLMs', d: 'A robust geological analysis dashboard. Built a high-performance Next.js full-stack application rendering complex topographical datasets. Integrated a multi-agent system which helps to take decisions on high-risk things based on geological factors.', features: ['WebGL Rendering', 'Multi-Agent System', 'Topographical Data', 'Risk Assessment'], icon: <Map size={36} color="var(--text-ink)" strokeWidth={1.5} /> }
];

// Split once at module scope so the per-character wordmark markup is stable
// across renders — each span is a mask the load reveal animates through.
const HERO_WORDMARK = 'SANGEETH'.split('');

// Chromatic aberration fringe, in px: the width at rest and the extra spread
// scroll velocity can add on top.
const CA_REST = 2;
const CA_MAX = 9;

const heroMetrics = [
  { value: 24, label: 'Projects' },
  { value: 3, label: 'AI Systems' },
  { value: 33, label: 'Bandit Levels' },
];

const skillNodes = [
  { category: 'Mobile', name: 'Flutter / Dart', detail: 'Riverpod, custom theming, role-based navigation', icon: <Smartphone strokeWidth={1.5} /> },
  { category: 'Frontend', name: 'Next.js / React', detail: 'Full-stack web apps, SSR/SSG', icon: <Code strokeWidth={1.5} /> },
  { category: 'Backend', name: 'Firebase & Supabase', detail: 'Firestore, Auth, Cloud Functions, Realtime DB', icon: <Database strokeWidth={1.5} /> },
  { category: 'Enterprise', name: 'Spring Boot (Java)', detail: 'Full CRM dashboard with enterprise-grade REST API', icon: <Building2 strokeWidth={1.5} /> },
  { category: 'AI / ML', name: 'Gemini · OpenAI', detail: 'Sarvam API, Random Forest classifier, AWS ML/AI certified', icon: <BrainCircuit strokeWidth={1.5} /> },
  { category: 'Security', name: 'Adversarial Red-Teaming', detail: 'GCG, indirect injection, OverTheWire Bandit (33/33)', icon: <ShieldHalf strokeWidth={1.5} /> },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [istTime, setIstTime] = useState('--:--');

  // Lenis mounts a tick after us; the GSAP effects below read it through this
  // ref inside the ticker, so nothing here needs to re-render when it arrives.
  const lenisRef = useLenisRef();

  useEffect(() => {
    const updateClock = () => {
      setIstTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const clockId = setInterval(updateClock, 30000);
    return () => clearInterval(clockId);
  }, []);

  // Modals are full-screen overlays with no scroll container of their own on
  // desktop, so without this, wheel/touch input while one is open falls
  // straight through to the page behind it — Lenis keeps scrolling and every
  // ScrollTrigger-scrubbed section keeps progressing, invisibly, until the
  // modal closes and the page has jumped somewhere else.
  //
  // lenis.stop() + preventDefault() on wheel/touch alone isn't enough: tested
  // against a real (isTrusted) wheel event, Chromium's compositor can still
  // commit the scroll regardless of a called preventDefault — this page is
  // mid-GSAP-scrub a lot of the time, and a busy main thread is exactly when
  // Chrome's threaded scrolling stops waiting on JS. Both `overflow: hidden`
  // and `overflow: clip` on <html> were tried and still leaked under that
  // same test; taking body out of flow with `position: fixed` was the only
  // approach that reliably held, because it removes the scrollable area
  // itself rather than trying to cancel a gesture on it.
  //
  // That in turn collapses the document's height for as long as the lock is
  // held — with body taken out of flow, the document no longer measures its
  // real scrollable extent — and ScrollTrigger's resize observer sees that
  // collapse and recalculates every trigger's start/end against the wrong
  // geometry, so restoring body afterwards left triggers wrong and scroll
  // jumping on close. Muting ScrollTrigger's auto-refresh for the duration
  // of the lock, then refreshing once manually after restoring, keeps it
  // from ever measuring the collapsed state at all.
  //
  // Known residual, deliberately not chased further: closing the modal
  // shortly after a fast wheel/trackpad gesture made while it was open can
  // still land a bit further down the page over the following second or so.
  // The gesture never visibly scrolls anything while the modal is up
  // (verified — this lock holds even under aggressive synthetic wheel
  // input), and the forced window.scrollTo + lenis.scrollTo below closes
  // most of the gap; what's left looks like the browser's own native
  // touch/wheel momentum queuing a fling against a background that
  // momentarily couldn't scroll, then releasing it once it can. A
  // requestAnimationFrame loop re-pinning the position for a bit after
  // unlock was tried and measurably absorbed it, but it can't tell that
  // apart from a genuine new scroll the user makes right after closing —
  // tested, and it reverted that too. Actively fighting every close for a
  // fraction of a second, to guard against a residual that only occurs if
  // the user scrolled during the modal in the first place, was the worse
  // trade, so it was removed.
  useEffect(() => {
    if (!isAboutOpen) return;

    const lenis = lenisRef.current;
    const lockedScrollY = window.scrollY;
    ScrollTrigger.config({ autoRefreshEvents: 'none' });
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    lenis?.stop();

    // Also guard wheel/touch directly — chiefly to stop the iOS Safari
    // rubber-band bounce a fixed body can still show, not to do the blocking
    // itself. Exempts the modal's own scroll container (About's mobile
    // layout) — but only where it's actually scrollable: on desktop
    // .about-modal-container has no overflow of its own, yet as the
    // full-viewport wrapper it's the closest match for nearly every event
    // target, so exempting it unconditionally by selector alone let every
    // wheel/touch input through regardless of breakpoint.
    const allowSelector = '.about-modal-container';
    const block = (e: Event) => {
      const container = (e.target as HTMLElement | null)?.closest?.(allowSelector) as HTMLElement | null;
      if (container) {
        const style = getComputedStyle(container);
        const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && container.scrollHeight > container.clientHeight;
        if (isScrollable) return;
      }
      e.preventDefault();
    };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });

    return () => {
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, lockedScrollY);
      // Re-enable auto-refresh before the manual one, so ScrollTrigger's own
      // default listeners (resize, visibilitychange, etc.) are back in place
      // for anything that happens after this.
      ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize' });
      ScrollTrigger.refresh();
      lenis?.start();
      // Force Lenis's own internal target back to the locked position
      // through its public API too, immediately (no easing) — a plain
      // window.scrollTo() alone left Lenis resuming toward a stale target.
      lenis?.scrollTo(lockedScrollY, { immediate: true, force: true });
    };
  }, [isAboutOpen, lenisRef]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Lenis itself lives in <SmoothScroll> (layout.tsx) and is already bridged
    // to the GSAP ticker there; here we only read its velocity for the skew.
    const ctx = gsap.context(() => {
      // Listeners and ticker callbacks registered below, undone when this
      // context reverts.
      const teardowns: Array<() => void> = [];

      /**
       * Scrub-scoped layer promotion, for use as a ScrollTrigger `onToggle`.
       *
       * Scrubbing transform/opacity on a viewport-sized layer makes Chrome
       * re-rasterise its contents at every step to keep them sharp; with the
       * layer promoted the compositor resamples the existing texture instead.
       * Measured over a scroll of each section, promoting just the layers that
       * are actually being scrubbed cut raster work roughly in half in both
       * the hero and the contact section.
       *
       * Deliberately toggled rather than declared in CSS: a static
       * `will-change` keeps those layers on the GPU for the page's entire
       * life, which is exactly the over-promotion the root-rule note in
       * globals.css documents as having produced real rendering artifacts
       * here before (headings painting twice, offset vertically).
       */
      const promoteWhileActive = (pairs: Array<[selector: string, value: string]>) => {
        const targets = pairs.flatMap(([selector, value]) =>
          gsap.utils.toArray<HTMLElement>(selector).map((el) => ({ el, value }))
        );
        teardowns.push(() => targets.forEach(({ el }) => { el.style.willChange = ''; }));
        return (self: { isActive: boolean }) => {
          targets.forEach(({ el, value }) => {
            el.style.willChange = self.isActive ? value : '';
          });
        };
      };

      // Initial Load Animation Sequence
      const tl = gsap.timeline();

      // 1. Loading Screen Animation
      tl.to('.loader-flower-path', { strokeDashoffset: 0, duration: 2, ease: 'power3.inOut', delay: 0.2 })
        .to('.loader-logo', { y: 0, duration: 1, ease: 'power4.out' }, '-=1.2')
        .to('.loader-sub', { y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8')
        .to('.loader-bar-fill', { width: '100%', duration: 2, ease: 'power2.inOut' }, 0)
        .to('.loader-content', { opacity: 0, duration: 0.5, ease: 'power2.out' }, '+=0.2')
        .to('.loader-curtain-left', { xPercent: -100, duration: 1.2, ease: 'power4.inOut' }, '+=0.1')
        .to('.loader-curtain-right', { xPercent: 100, duration: 1.2, ease: 'power4.inOut' }, '<')
        .set('.loader-screen', { display: 'none' })
        
      // 2. Hero load animations (starts as curtains open).
      //    fromTo, not to: nothing here is pre-hidden in CSS, so a plain
      //    `to({opacity:1})` animated from 1 to 1 and showed nothing.
      //    The wordmark is excluded — it gets the per-glyph reveal below.
        .fromTo('.hero-load:not(.hero-parallax-title)',
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.09, ease: 'power3.out' },
          '-=0.8');

      // The wordmark is the payoff of the whole load sequence, so it gets its
      // own treatment: each glyph rises out of its own mask, fastest first.
      // .hero-char is the glyph inside each overflow-hidden mask.
      gsap.set('.hero-parallax-title', { opacity: 1 });
      tl.from('.hero-char', {
        yPercent: 125,
        duration: 1.1,
        stagger: 0.045,
        ease: 'expo.out',
      }, '-=1.05');

      // Metrics tick up rather than just appearing — reads as instrumentation
      // rather than decoration, which is the register the HUD is going for.
      gsap.utils.toArray<HTMLElement>('.hero-count').forEach((el) => {
        const target = Number(el.dataset.count ?? 0);
        const pad = Number(el.dataset.pad ?? 0);
        const counter = { v: 0 };
        tl.to(counter, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v)).padStart(pad, '0');
          },
        }, '-=1.2');
      });

      // Simple blink effect for the HUD
      gsap.to('.loader-blink', { opacity: 0, duration: 0.5, repeat: -1, yoyo: true });

      // 1. Dynamic continuous scrub reveal for all items
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
        tl.fromTo(el, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' })
          .to(el, { y: -100, duration: 0.6, ease: 'none' });
      });

      // Scatter effect on Hero scroll scrub
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          // The three layers this timeline actually scrubs. .hero-bg-scan is
          // the biggest single win of the set: it is a full-viewport 1px
          // repeating-gradient whose opacity is scrubbed to 0, so unpromoted
          // it repaints that whole stripe pattern every frame.
          onToggle: promoteWhileActive([
            ['.hero-bg-scan', 'opacity'],
            ['.hero-parallax-title', 'transform'],
            ['.hero-figure', 'transform'],
          ]),
        }
      });
      
      // scaleX rather than letterSpacing. Animating letter-spacing relayouts
      // the text on every scrub frame — on display type this size that was a
      // measurable share of the scroll cost and made the glyphs shimmer as they
      // re-hinted. scaleX spreads the wordmark the same way, on the compositor.
      heroTl.to('.hero-parallax-title', { x: -100, y: -100, opacity: 0, scaleX: 1.06, scale: 0.9 }, 0)
            .to('.hero-parallax-roles', { x: -80, opacity: 0 }, 0)
            .to('.hero-parallax-desc', { x: -40, opacity: 0, y: -20 }, 0)
            // Backdrop planes drift at different rates — the depth cue that makes
            // a single flat PNG read as a lit set rather than wallpaper.
            // Both figure planes — the full image and the cutout above the
            // wordmark — must move as one or the cutout ghosts off the plate.
            .to('.hero-figure', { yPercent: 12, scale: 1.09, ease: 'none' }, 0)
            .to('.hero-bg-scan', { opacity: 0, ease: 'none' }, 0)
            .to('.hero-scroll-cue', { opacity: 0, y: 20, ease: 'none' }, 0);

      // Scrubbed Parallax wipes for section headers
      gsap.utils.toArray<HTMLElement>('.gsap-wipe').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0% 100% 0% 0%)', x: -50 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            x: 0,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'top 30%',
              scrub: true,
            }
          }
        );
      });

      // Work section handoff: the title + sword-bearer are the opening beat,
      // then the title fades as the cover flow takes over — one continuous
      // scene instead of two unrelated screens the user scrolls between.
      // Plain scrub, no pin: both tweens live on ONE timeline driven by a
      // single trigger, so the fade-out and fade-in are always in lockstep
      // (two independently-triggered scrubs on adjacent elements drifted out
      // of sync — the cover flow arrived while the title was still on screen,
      // reading as clutter instead of a handoff). The cover flow's own fade-in
      // starts at local time 0.4 so the second half of the scroll is a
      // cross-dissolve rather than a hard cut.
      if (document.querySelector('.work-section-grid') && document.querySelector('.coverflow')) {
        const workHandoffTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.work-section-grid',
            start: 'top 15%',
            end: 'bottom top',
            scrub: true,
            onToggle: promoteWhileActive([
              ['.work-section-grid', 'transform, opacity'],
              ['.coverflow', 'transform, opacity'],
            ]),
          },
        });
        workHandoffTl
          .fromTo('.work-section-grid', { opacity: 1, y: 0 }, { opacity: 0, y: -60, ease: 'none', duration: 1 }, 0)
          .fromTo('.coverflow', { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'none', duration: 0.6 }, 0.4);
      }

      // Massive Typography Scale Effect for Stack Section
      // Again scaleX instead of letterSpacing: this tween was the source of the
      // layout shifts measured across y~11400-11620, i.e. exactly the Work ->
      // Stack transition where the UI was seen to judder.
      gsap.fromTo('.gsap-scale-text',
        { scale: 0.8, opacity: 0, scaleX: 1.08 },
        {
          scale: 1.1,
          opacity: 1,
          scaleX: 1,
          scrollTrigger: {
            trigger: '#stack',
            start: 'top bottom',
            end: 'center center',
            scrub: true,
            // Display type at this size carrying a chromatic text-shadow, with
            // its scale scrubbed: unpromoted, every glyph and both shadow
            // copies are re-rendered at each new scale step. Promoting it cut
            // this section's raster work by a third and its raster time by
            // over half.
            onToggle: promoteWhileActive([['.gsap-scale-text', 'transform, opacity']]),
          }
        }
      );

      // Skill wheel entrance: the ring settles in, then nodes pop in one by one
      gsap.fromTo('.gsap-skillwheel',
        { opacity: 0, scale: 0.82, rotate: -10 },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 1.3,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: '#stack',
            start: 'top 65%',
          }
        }
      );
      gsap.utils.toArray<HTMLElement>('.gsap-skill-node').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, scale: 0.3 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: 0.5 + i * 0.09,
            ease: 'back.out(1.8)',
            clearProps: 'all',
            scrollTrigger: {
              trigger: '#stack',
              start: 'top 65%',
            }
          }
        );
      });

      // --- Section figures: Work's sword-bearer and Skills' David ---
      // Each gets its own entrance, matched to how the subject is composed:
      //   Work  — the sword-bearer is centred and RISES from below, so he
      //           arrives like something being raised into frame.
      //   Skills— David's profile faces left out of the right edge, so he
      //           SLIDES IN from the right extreme.
      // Scrubbed rather than triggered, so the motion belongs to the scroll
      // instead of firing once and being missed.
      ([
        ['#work',  '.work-figure',  { yPercent: 55, xPercent: 0 }],
        ['#stack', '.stack-figure', { yPercent: 0,  xPercent: 78 }],
      ] as const).forEach(([section, figure, from]) => {
        if (!document.querySelector(figure)) return;

        gsap.fromTo(`${figure} .section-figure-plate`,
          { yPercent: from.yPercent, xPercent: from.xPercent, scale: 1.06 },
          {
            yPercent: 0, xPercent: 0, scale: 1, ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              // Ends at 'top top', not 'bottom top': #work runs to roughly
              // twelve viewports because the folder interaction is pinned, so a
              // full-section range would spread this into near-stillness.
              end: 'top top',
              scrub: true,
              // Each plate carries a large alpha-matted cutout and is scrubbed
              // on transform, so it re-rasterises per step unless promoted.
              onToggle: promoteWhileActive([[`${figure} .section-figure-plate`, 'transform']]),
            },
          }
        );

        // The sheen is a one-shot: a specular pass reads as a light source
        // moving past, so tying it to scrub would let you scrape it back and
        // forth and break the illusion.
        gsap.fromTo(`${figure} .section-figure-sheen`,
          { opacity: 0, xPercent: -55 },
          {
            opacity: 1, xPercent: 55, duration: 1.9, ease: 'power2.inOut',
            scrollTrigger: { trigger: section, start: 'top 65%', once: true },
            onComplete() { gsap.to(this.targets(), { opacity: 0, duration: 0.5 }); },
          }
        );
      });

      // --- Contact: the hands close as the section scrolls ---
      // The whole point of the backdrop. Both halves start apart and travel
      // inward across the section's scroll range; the charge in the gap and a
      // slow push-in ride the same scrub so they resolve on the same beat.
      if (document.querySelector('.contact-hand-l')) {
        const reach = gsap.timeline({
          scrollTrigger: {
            trigger: '#contact',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
            // .contact-bg carries both viewport-sized hand images and is the
            // element the push-in scales, so it is the one that would
            // otherwise re-rasterise per scale step (measured across this
            // scroll: 2672 -> 1318 raster tasks, within noise of dropping the
            // push-in entirely).
            onToggle: promoteWhileActive([['.contact-bg', 'transform']]),
          },
        });
        reach
          .fromTo('.contact-hand-l', { xPercent: -14 }, { xPercent: 0, ease: 'none' }, 0)
          .fromTo('.contact-hand-r', { xPercent: 14 }, { xPercent: 0, ease: 'none' }, 0)
          .fromTo('.contact-bg', { scale: 1.16 }, { scale: 1, ease: 'none' }, 0);
      }

      // Contact headline reveals per word out of a mask, then the grid rows
      // ladder in underneath it.
      gsap.utils.toArray<HTMLElement>('.contact-info-grid > div').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 34, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: i * 0.08,
            scrollTrigger: { trigger: '#contact', start: 'top 55%' },
          }
        );
      });

      // Magnetic nav links: the cursor pulls each label off its rest position
      // and power3 lets it fall back. quickTo keeps this to one setter call per
      // move event instead of spawning a tween per frame.
      const fine = window.matchMedia('(pointer: fine)').matches;
      if (fine) {
        gsap.utils.toArray<HTMLElement>('.magnetic').forEach((el) => {
          const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' });
          const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' });
          const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.45);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
          };
          const onLeave = () => { xTo(0); yTo(0); };
          el.addEventListener('mousemove', onMove);
          el.addEventListener('mouseleave', onLeave);
          teardowns.push(() => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
          });
        });
      }

      // Scroll-velocity skew. Lenis exposes the smoothed velocity of its own
      // animated scroll value, which is what makes this readable — sampling
      // raw wheel deltas instead gives a jittery, steppy skew.
      const skewSetters = gsap.utils
        .toArray<HTMLElement>('.velocity-skew')
        .map((el) => gsap.quickTo(el, 'skewY', { duration: 0.7, ease: 'power3.out' }));

      // Chromatic aberration, driven off the same velocity signal: the RGB
      // channels split apart as the page picks up speed and re-converge to a
      // resting fringe when it settles. Written as a CSS custom property that
      // the text-shadow reads, so one setter drives every fringed element.
      const aberrationTargets = gsap.utils.toArray<HTMLElement>('.chromatic');
      const ca = { v: CA_REST };
      let caTween: gsap.core.Tween | null = null;
      let lastCa = -1;

      // Of those targets, only touch the ones actually near the viewport.
      // text-shadow isn't a compositor-only property like transform — writing
      // --ca repaints the element, and this page runs to several viewports
      // with headings spread across it (the hero wordmark alone is 8
      // individually-shadowed glyphs, all inheriting --ca from one
      // .hero-title write). Writing to all of them on every tick repainted
      // far more than was ever on screen. IntersectionObserver keeps the
      // "is this near the viewport" check off the render loop entirely,
      // rather than polling getBoundingClientRect from inside the ticker.
      const visibleAberrationTargets = new Set<HTMLElement>();
      if (aberrationTargets.length) {
        const aberrationObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const el = entry.target as HTMLElement;
              if (entry.isIntersecting) {
                visibleAberrationTargets.add(el);
                // Catch up immediately so a heading that scrolls into view
                // mid-scrub doesn't sit at a stale fringe until the next tick.
                el.style.setProperty('--ca', `${lastCa < 0 ? CA_REST : lastCa}px`);
              } else {
                visibleAberrationTargets.delete(el);
              }
            }
          },
          { rootMargin: '50% 0px' }
        );
        aberrationTargets.forEach((el) => aberrationObserver.observe(el));
        teardowns.push(() => aberrationObserver.disconnect());
      }

      if (skewSetters.length || aberrationTargets.length) {
        const onTick = () => {
          const v = lenisRef.current?.velocity ?? 0;

          skewSetters.forEach((set) => set(gsap.utils.clamp(-4, 4, v * 0.035)));

          if (aberrationTargets.length) {
            const target = CA_REST + gsap.utils.clamp(0, CA_MAX, Math.abs(v) * 0.05);
            // Ease toward the target instead of writing it raw — velocity is
            // spiky enough that a direct write reads as a flicker.
            if (Math.abs(target - ca.v) > 0.05) {
              caTween?.kill();
              caTween = gsap.to(ca, { v: target, duration: 0.45, ease: 'power2.out', overwrite: true });
            }
            // Only touch the DOM when the value actually moves a visible
            // amount. Writing --ca every frame re-rasterised the text-shadow
            // on display type the size of the viewport. Quantising to 0.25px
            // is invisible and skips most frames.
            const q = Math.round(ca.v * 4) / 4;
            if (q !== lastCa) {
              lastCa = q;
              const px = `${q}px`;
              visibleAberrationTargets.forEach((el) => el.style.setProperty('--ca', px));
            }
          }
        };
        gsap.ticker.add(onTick);
        teardowns.push(() => {
          gsap.ticker.remove(onTick);
          caTween?.kill();
        });
      }

      return () => teardowns.forEach((fn) => fn());
    }, containerRef);

    return () => ctx.revert();
    // lenisRef is the stable ref object from <SmoothScroll>'s context, so it
    // never changes identity — listing it satisfies the linter without ever
    // re-running this effect (which would replay the whole loader sequence).
  }, [lenisRef]);

  return (
    <main ref={containerRef} style={{ position: 'relative', width: '100vw', overflowX: 'hidden' }}>
      
      {/* PROFESSIONAL LOADING SCREEN - VAULT CURTAIN DESIGN */}
      <div className="loader-screen" style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none', display: 'flex' }}>
        
        {/* Solid Cream Curtains (Hides 3D Flower) */}
        <div className="loader-curtain-left" style={{ width: '50vw', height: '100vh', background: 'var(--bg-marble)', borderRight: '1px solid rgba(0,0,0,0.05)' }} />
        <div className="loader-curtain-right" style={{ width: '50vw', height: '100vh', background: 'var(--bg-marble)', borderLeft: '1px solid rgba(0,0,0,0.05)' }} />

        {/* HUD Content Wrapper */}
        <div className="loader-content" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Brutalist Corner Elements */}
          <div className="loader-corner loader-corner-tl" style={{ position: 'absolute', top: '40px', left: '40px', fontSize: '10px', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>
            [ SYS.01 ]
          </div>
          <div className="loader-corner loader-corner-tr" style={{ position: 'absolute', top: '40px', right: '40px', fontSize: '10px', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'right', fontWeight: 600 }}>
            <span style={{ color: 'var(--accent-red)' }}>REC</span> <span className="loader-blink" style={{ color: 'var(--accent-red)' }}>●</span><br/>
            <span className="loader-corner-sub" style={{ opacity: 0.5, display: 'block', marginTop: '8px' }}>COORD: 9.9312° N, 76.2673° E</span>
          </div>
          <div className="loader-corner loader-corner-bl" style={{ position: 'absolute', bottom: '40px', left: '40px', fontSize: '10px', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>
            PORTFOLIO_V2
          </div>
          <div className="loader-corner loader-corner-br loader-corner-sub" style={{ position: 'absolute', bottom: '40px', right: '40px', fontSize: '10px', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'right', opacity: 0.5 }}>
            DESIGN ORIGINATES FROM LIFE.
          </div>

          {/* SVG Animated Geometric Flower */}
          <div className="loader-flower-wrap" style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '60px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <g fill="none" stroke="var(--accent-red)" strokeWidth="0.5">
                {[0, 45, 90, 135].map((angle, i) => (
                  <ellipse key={`e1-${i}`} className="loader-flower-path" strokeDasharray="300" strokeDashoffset="300" cx="50" cy="50" rx="40" ry="10" transform={`rotate(${angle} 50 50)`} />
                ))}
                {[22.5, 67.5, 112.5, 157.5].map((angle, i) => (
                  <ellipse key={`e2-${i}`} className="loader-flower-path" strokeDasharray="300" strokeDashoffset="300" cx="50" cy="50" rx="25" ry="15" transform={`rotate(${angle} 50 50)`} />
                ))}
                <circle className="loader-flower-path" strokeDasharray="300" strokeDashoffset="300" cx="50" cy="50" r="5" />
              </g>
            </svg>
          </div>

          {/* Main Typography */}
          <div style={{ overflow: 'hidden', position: 'relative' }}>
            <h1 className="loader-logo f-display chromatic chromatic-text" style={{ fontSize: 'clamp(38px, 6vw, 96px)', color: 'var(--text-ink)', letterSpacing: '-0.01em', margin: 0, transform: 'translateY(100%)' }}>
              SANGEETH CS
            </h1>
          </div>

          <div style={{ overflow: 'hidden', marginTop: '10px' }}>
            <div className="loader-sub" style={{ color: '#005B41', fontSize: '12px', letterSpacing: '0.4em', textTransform: 'uppercase', transform: 'translateY(100%)', fontWeight: 600 }}>
              Neural Architecture & Design
            </div>
          </div>
          
          <div className="loader-bar-bg" style={{ position: 'absolute', bottom: '25vh', width: '300px', height: '2px', background: 'rgba(0,0,0,0.1)' }}>
            <div className="loader-bar-fill" style={{ width: '0%', height: '100%', background: 'var(--accent-red)' }} />
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="hero" style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>

        <HeroBackground />

        {/* Top header — nav as a floating frosted pill */}
        <header className="hero-load hero-header" style={{ position: 'absolute', top: '34px', left: '44px', right: '44px', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <nav className="hero-nav-links t-micro glass glass-pill hero-nav-pill" style={{ color: 'var(--bg-cream)' }}>
            <a className="magnetic" href="#work">Work</a>
            <a
              className="magnetic"
              href="#"
              onClick={(e) => { e.preventDefault(); setIsAboutOpen(true); }}
              style={{ cursor: 'pointer' }}
            >
              About
            </a>
            <a className="magnetic" href="#stack">Stack</a>
            <a className="magnetic" href="#contact" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Contact <span style={{ color: 'var(--accent-red)' }}>•</span></a>
          </nav>
        </header>

        {/* The wordmark, set in the display face.
            Rendered between <HeroBackground> and <HeroForeground> so the
            figure cutout paints over it — the name passes behind the statue's
            head. Per-character spans rather than SplitText so the masked
            reveal is plain markup GSAP can drive without rewriting the DOM. */}
        <div className="hero-title-layer">
          <div className="hero-load hero-parallax-title">
            <h1 className="f-display hero-title chromatic" aria-label="Sangeeth" style={{ fontSize: 'clamp(52px, 16.4vw, 320px)', margin: 0, lineHeight: 0.92, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>
              {HERO_WORDMARK.map((char, i) => (
                <span key={i} className="hero-char-mask" aria-hidden="true">
                  <span className="hero-char">{char}</span>
                </span>
              ))}
            </h1>
          </div>
        </div>

        <HeroForeground />

        {/* Metrics moved to the bottom right — it now occupies the corner the
            featured card used to sit in. */}
        <div className="hero-bottom-right">
          <div className="hero-load hero-parallax-roles glass hero-metrics" style={{ display: 'flex' }}>
            {heroMetrics.map((m, i) => (
              <Fragment key={m.label}>
                {i > 0 && <div className="hero-metric-sep" />}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                  <div className="t-metric hero-metric-num hero-count" data-count={m.value} data-pad="2">
                    {String(m.value).padStart(2, '0')}
                  </div>
                  <div className="t-micro" style={{ color: 'var(--bg-cream)', maxWidth: '104px' }}>{m.label}</div>
                </div>
              </Fragment>
          ))}
          </div>
        </div>

        {/* Action + blurb hold the bottom left */}
        <div className="hero-bottom-left">
          <div className="hero-bottom-row">
            <a href="#contact" className="hero-load hero-cta t-micro magnetic">
              <span>Start a project</span>
              <span className="hero-cta-arrow"><ArrowUpRight size={14} strokeWidth={2.2} /></span>
            </a>
            <p className="hero-load hero-parallax-desc hero-blurb f-mono">
              Full-stack systems, on-device ML and adversarial security research —
              built end to end, from model to interface.
            </p>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="hero-load hero-scroll-cue t-micro">
          <span className="hero-scroll-cue-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* WORK SECTION */}
      <section id="work" className="section-padding" style={{ position: 'relative', borderTop: '1px solid var(--border-line)' }}>
        <SectionFigure src="/images/projbg-fg.png" side="center" className="work-figure" />
        <div style={{ position: 'absolute', top: 0, right: '5%', width: '1px', height: '100%', background: 'var(--border-line)' }} />
        <div style={{ position: 'absolute', top: '100px', right: '5%', width: '10vw', height: '2px', background: 'var(--accent-red)' }} />
        
        <div className="work-section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          <div>
            <div className="gsap-wipe" style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-red)', marginBottom: '20px', borderBottom: '1px solid var(--border-line)', paddingBottom: '10px', display: 'inline-block' }}>
              Featured Projects 2026
            </div>
            <h2 className="gsap-wipe velocity-skew chromatic chromatic-text f-cond work-heading" style={{ fontSize: 'clamp(80px, 11vw, 200px)', lineHeight: 0.92, letterSpacing: '-0.02em', color: 'var(--paper-ink)', textTransform: 'uppercase', margin: '20px 0 40px 0' }}>
              <span style={{ color: 'var(--accent-red)' }}>Fusion</span> & <br/>Resonance
            </h2>
          </div>
          {/* Removed text block, empty div to keep grid layout intact */}
          <div></div>
        </div>

        <ProjectCoverFlow projects={projects} />
      </section>

      {/* ABOUT / STACK SECTION */}
      <section id="stack" className="section-padding" style={{ position: 'relative', overflow: 'hidden', background: 'var(--text-ink)', color: 'var(--bg-cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <SectionFigure src="/images/skillsbg-fg.png" side="right" className="stack-figure" />

        <SkillWheel
          items={skillNodes}
          heading={
            <h2 className="gsap-scale-text chromatic chromatic-text f-cond stack-heading" style={{ fontSize: 'clamp(80px, 12vw, 200px)', lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--bg-cream)', textTransform: 'uppercase', margin: 0, textAlign: 'right' }}>
              DESIGN <br/><span style={{ color: 'var(--accent-red)' }}>ORIGINATES</span><br/> FROM LIFE.
            </h2>
          }
        />
      </section>

      {/* FOOTER / CONTACT */}
      <footer id="contact" className="section-padding" style={{ position: 'relative', background: '#000000', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden', paddingBottom: '50px' }}>

        {/* Backdrop: the two reaching hands, split down the gap between them.
            Each half is the same image clipped to its side, so the seam falls
            in the black void in the middle and is invisible. Scrolling drives
            them together — the section performs its own verb. */}
        <div className="contact-bg" aria-hidden="true">
          <div className="contact-hand contact-hand-l">
            <Image src="/images/contactbg-fg.png" alt="" fill sizes="100vw" className="contact-hand-img" />
          </div>
          <div className="contact-hand contact-hand-r">
            <Image src="/images/contactbg-fg.png" alt="" fill sizes="100vw" className="contact-hand-img" />
          </div>
        </div>

        {/* Grain sits OUTSIDE .contact-bg deliberately. Inside it, this layer
            was a child of the element GSAP scrubs `scale` on, so its
            feTurbulence texture had to be re-rasterised at every new scale
            step — procedural noise is expensive to raster, and measured across
            a scroll of this section it accounted for over half of all raster
            work on the page (5015 -> 2356 raster tasks with it removed).
            Out here the layer never transforms, so it rasters once. z-index 1
            keeps it above .contact-bg (0) and below the content (2), which is
            exactly where it sat as .contact-bg's last child. */}
        <div className="contact-bg-grain" aria-hidden="true" />

        {/* Utility nav, echoes the hero header */}
        <nav className="gsap-reveal contact-utility-nav" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end', gap: '32px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: 'var(--bg-cream)' }}>
          <a href="#work">Work</a>
          <a href="#stack">Stack</a>
          <a href="#contact" style={{ borderBottom: '2px solid var(--accent-red)', paddingBottom: '4px' }}>Contact</a>
        </nav>

        {/* Brand row */}
        <div className="gsap-reveal contact-brand-row" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, color: 'var(--bg-cream)', marginTop: 'clamp(30px, 6vh, 70px)' }}>
          <span>Sangeeth</span>
        </div>

        {/* Giant heading */}
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="gsap-wipe f-italic contact-kicker" style={{ fontSize: 'clamp(18px, 2.4vw, 28px)', color: 'var(--accent-red)', marginBottom: '4px' }}>
            Got a project worth building?
          </div>
          <h2 className="gsap-wipe velocity-skew chromatic chromatic-text contact-giant-heading" style={{ fontSize: 'clamp(70px, 15vw, 260px)', fontWeight: 800, lineHeight: 0.85, letterSpacing: '-0.02em', color: 'var(--bg-cream)', textTransform: 'uppercase', margin: 0 }}>
            Contact
          </h2>
        </div>

        {/* Info grid */}
        <div className="gsap-reveal contact-info-grid" style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', paddingTop: '36px', marginTop: '60px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="contact-info-label">Kochi, India</span>
            <span className="f-details" style={{ fontSize: '20px', color: 'var(--bg-cream)' }}>{istTime} IST</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="contact-info-label">Get In Touch</span>
            <a href="mailto:sangeeth00x@gmail.com" className="f-details contact-info-link">sangeeth00x@gmail.com</a>
            <a href="tel:+918078757172" className="f-details contact-info-link">+91 8078757172</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="contact-info-label">Elsewhere</span>
            <a href="https://github.com/Caxted" target="_blank" rel="noreferrer" className="f-details contact-info-link">GitHub</a>
            <a href="https://www.linkedin.com/in/sangeeth-cs-94668531b/" target="_blank" rel="noreferrer" className="f-details contact-info-link">LinkedIn</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="contact-info-label">Role</span>
            <span className="f-details" style={{ fontSize: '18px', lineHeight: 1.4, color: 'var(--bg-cream)' }}>Full-Stack Developer<br/>&amp; AI Engineer</span>
          </div>

        </div>

        {/* Baseline */}
        <div className="footer-bottom" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', marginTop: '24px' }}>
          <span className="contact-baseline-text">© 2026 SANGEETH CS</span>
          <div className="footer-bottom-right" style={{ display: 'flex', gap: '24px' }}>
            <span className="contact-baseline-text">AVAILABLE FOR FREELANCE</span>
            <span className="contact-baseline-text">BASED IN INDIA</span>
          </div>
        </div>

      </footer>

      {/* Editorial About Modal */}
      <div
        className="about-modal-container"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(233, 231, 220, 0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          display: 'flex',
          opacity: isAboutOpen ? 1 : 0,
          pointerEvents: isAboutOpen ? 'auto' : 'none',
          transition: 'opacity 0.6s cubic-bezier(0.85, 0, 0.15, 1)',
          padding: '10vh 10vw'
        }}
      >
        <button 
          onClick={() => setIsAboutOpen(false)}
          style={{ position: 'absolute', top: '40px', right: '44px', background: 'none', border: 'none', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: 'var(--text-ink)', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          CLOSE <span style={{ color: 'var(--accent-red)', fontSize: '14px' }}>✕</span>
        </button>

        <div className="about-modal-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', width: '100%', height: '100%', alignItems: 'center', transform: isAboutOpen ? 'translateY(0)' : 'translateY(40px)', transition: 'transform 0.8s cubic-bezier(0.85, 0, 0.15, 1) 0.1s' }}>
          
          {/* Left Side: Big Title */}
          <div>
            <div style={{ color: 'var(--accent-red)', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '24px' }}>* The Architect</div>
            <h2 className="f-cond about-modal-h2" style={{ fontSize: '12vw', lineHeight: 0.85, fontWeight: 700, color: 'var(--text-ink)', letterSpacing: '-0.02em', margin: 0 }}>
              ABOUT<br />SANGEETH
            </h2>
          </div>

          {/* Right Side: Editorial Text */}
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div className="f-serif about-modal-quote" style={{ fontSize: '28px', lineHeight: 1.4, color: 'var(--text-ink)' }}>
              I am a <span style={{ fontStyle: 'italic', color: 'var(--accent-red)' }}>full-stack engineer</span> and AI builder obsessed with creating digital experiences that feel physically impossible.
            </div>
            
            <div style={{ fontSize: '12px', lineHeight: 1.8, color: 'rgba(0,0,0,0.6)', fontWeight: 500, letterSpacing: '0.02em' }}>
              Specializing in highly complex systems, machine learning architectures, and bleeding-edge web technologies, I bridge the gap between heavy computational logic and flawless, high-fashion art direction. Whether I&rsquo;m training custom YOLO models for livestock monitoring or building immersive 3D web applications, I refuse to compromise on aesthetics or performance.
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.1)' }} />

            <div className="about-details-cols" style={{ display: 'flex', gap: '80px' }}>
              <div>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '12px' }}>CORE FOCUS</div>
                <div style={{ fontSize: '11px', lineHeight: 2, color: 'var(--text-ink)', fontWeight: 500 }}>
                  Artificial Intelligence<br/>
                  Immersive Web (WebGL)<br/>
                  Scalable Architecture
                </div>
              </div>
              <div>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '12px' }}>LOCATION</div>
                <div style={{ fontSize: '11px', lineHeight: 2, color: 'var(--text-ink)', fontWeight: 500 }}>
                  India<br/>
                  Available for Remote<br/>
                  Freelance
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

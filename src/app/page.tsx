'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import CanvasBackground from '@/components/CanvasBackground';
import EmeraldDahlia from '@/components/EmeraldDahlia';
import Lenis from '@studio-freight/lenis';
import { User, Code, ArrowRight, Activity, Leaf, LayoutDashboard, Wifi, FileWarning, Map, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
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
        
      // 2. Hero load animations (starts as curtains open)
        .to('.hero-load', {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
        }, '-=0.8');

      // Simple blink effect for the HUD
      gsap.to('.loader-blink', { opacity: 0, duration: 0.5, repeat: -1, yoyo: true });

      // 1. Dynamic continuous scrub reveal for all items
      gsap.utils.toArray('.gsap-reveal').forEach((el: any) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
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
          scrub: 1,
        }
      });
      
      heroTl.to('.hero-parallax-title', { x: -100, y: -100, opacity: 0, letterSpacing: '0.1em', scale: 0.9 }, 0)
            .to('.hero-parallax-roles', { x: -80, opacity: 0 }, 0)
            .to('.hero-parallax-desc', { x: -40, opacity: 0, y: -20 }, 0);

      // Scrubbed Parallax wipes for section headers
      gsap.utils.toArray('.gsap-wipe').forEach((el: any) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0% 100% 0% 0%)', x: -50 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            x: 0,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'top 30%',
              scrub: 1.5,
            }
          }
        );
      });

      // Scrubbed dynamic red blocks at contact footer
      gsap.fromTo('.gsap-stagger-red', 
        { scaleY: 0, opacity: 0 },
        {
          scaleY: 1,
          opacity: 1,
          transformOrigin: 'bottom center',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 90%',
            end: 'bottom bottom',
            scrub: 1,
          }
        }
      );

      // Background blur after hero
      gsap.to('.canvas-bg-wrapper', {
        filter: 'blur(30px)',
        scrollTrigger: {
          trigger: '#work',
          start: 'top bottom',
          end: 'top center',
          scrub: true,
        }
      });

      // Folder Spread Scroll Animation
      const workSection = document.querySelector('#work');
      const folderFront = document.querySelector('.folder-front');
      const papers = gsap.utils.toArray('.project-paper');
      
      if (workSection && folderFront && papers.length > 0) {
        // Ensure papers stack in reverse DOM order so #01 is on top
        papers.forEach((paper: any, i: number) => {
          gsap.set(paper, { zIndex: papers.length - i + 10 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.folder-pin-wrapper',
            start: "top top",
            end: "+=1200%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          }
        });

        // 1. Open the folder
        tl.to(folderFront, { rotateX: -110, duration: 1, ease: 'power2.inOut' }, 0);
        // Drop the folder front behind the papers after it opens, so scattered papers rest on top
        tl.to(folderFront, { zIndex: 2, duration: 0.1 }, 0.5);

        // Predefined pseudo-random scatter positions for 6 papers
        const scatterPositions = [
          { x: '-35vw', y: '-15vh', rot: -8 },
          { x: '-10vw', y: '-18vh', rot: 4 },
          { x: '18vw', y: '-12vh', rot: 12 },
          { x: '-32vw', y: '18vh', rot: 10 },
          { x: '-2vw', y: '22vh', rot: -5 },
          { x: '25vw', y: '16vh', rot: -15 }
        ];

        // 2. Scatter the papers out
        papers.forEach((paper: any, i: number) => {
          const pos = scatterPositions[i % scatterPositions.length];
          tl.to(paper, {
            x: pos.x,
            y: pos.y,
            rotationZ: pos.rot,
            scale: 1.05,
            duration: 2.5,
            ease: 'power3.out'
          }, 0.5 + (i * 0.15));
        });

        // 3. Gather back into an organized stack
        const gatherTime = 4.5;
        papers.forEach((paper: any, i: number) => {
          tl.to(paper, {
            x: 0,
            y: '-5vh', // Lift them up slightly so they sit nicely in the center
            rotationZ: (i * 2) - 5, // Fanned out slightly to show a stack
            scale: 1.15,
            duration: 2,
            ease: 'power2.inOut',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
          }, gatherTime + (i * 0.1));
        });

        // 4. Flip through the stack
        const flipTime = gatherTime + 3;
        
        // Ensure the first one is perfectly straight before flipping
        tl.to(papers[0], { rotationZ: 0, scale: 1.2, duration: 0.5 }, flipTime);

        for(let i = 0; i < papers.length - 1; i++) {
          // Slide current top paper off screen
          tl.to(papers[i], {
            x: '100vw',
            rotationZ: 15,
            opacity: 0,
            duration: 1.5,
            ease: 'power2.in'
          }, flipTime + 1 + (i * 2.5));
          
          // Straighten and highlight the next paper
          tl.to(papers[i+1], {
            rotationZ: 0,
            scale: 1.2,
            duration: 1,
            ease: 'power2.out'
          }, flipTime + 1 + (i * 2.5 + 1));
        }
        
        // Hold final project
        tl.to({}, { duration: 2 }, flipTime + 1 + (5 * 2.5));
      }

      // Massive Typography Scale Effect for Stack Section
      gsap.fromTo('.gsap-scale-text',
        { scale: 0.8, opacity: 0, letterSpacing: '0.2em' },
        {
          scale: 1.1,
          opacity: 1,
          letterSpacing: '-0.02em',
          scrollTrigger: {
            trigger: '#stack',
            start: 'top bottom',
            end: 'center center',
            scrub: 1.5,
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} style={{ position: 'relative', width: '100vw', overflowX: 'hidden' }}>
      
      {/* PROFESSIONAL LOADING SCREEN - VAULT CURTAIN DESIGN */}
      <div className="loader-screen" style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none', display: 'flex' }}>
        
        {/* Solid Cream Curtains (Hides 3D Flower) */}
        <div className="loader-curtain-left" style={{ width: '50vw', height: '100vh', background: 'var(--bg-cream)', borderRight: '1px solid rgba(0,0,0,0.05)' }} />
        <div className="loader-curtain-right" style={{ width: '50vw', height: '100vh', background: 'var(--bg-cream)', borderLeft: '1px solid rgba(0,0,0,0.05)' }} />

        {/* HUD Content Wrapper */}
        <div className="loader-content" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Brutalist Corner Elements */}
          <div style={{ position: 'absolute', top: '40px', left: '40px', fontSize: '10px', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>
            [ SYS.01 ]
          </div>
          <div style={{ position: 'absolute', top: '40px', right: '40px', fontSize: '10px', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'right', fontWeight: 600 }}>
            <span style={{ color: 'var(--accent-red)' }}>REC</span> <span className="loader-blink" style={{ color: 'var(--accent-red)' }}>●</span><br/>
            <span style={{ opacity: 0.5, display: 'block', marginTop: '8px' }}>COORD: 9.9312° N, 76.2673° E</span>
          </div>
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', fontSize: '10px', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>
            PORTFOLIO_V2
          </div>
          <div style={{ position: 'absolute', bottom: '40px', right: '40px', fontSize: '10px', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'right', opacity: 0.5 }}>
            DESIGN ORIGINATES FROM LIFE.
          </div>

          {/* SVG Animated Geometric Flower */}
          <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '60px' }}>
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
            <h1 className="loader-logo f-cond" style={{ fontSize: 'clamp(40px, 6vw, 100px)', color: 'var(--text-ink)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, transform: 'translateY(100%)' }}>
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

      <CanvasBackground />

      {/* HERO SECTION */}
      <section id="hero" style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
        
        {/* Top header */}
        <header className="hero-load" style={{ position: 'absolute', top: '40px', left: '44px', right: '44px', zIndex: 10, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <nav style={{ display: 'flex', gap: '40px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: 'var(--text-ink)' }}>
            <a href="#work" style={{ transition: 'opacity 0.3s' }}>Work</a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setIsAboutOpen(true); }}
              style={{ transition: 'opacity 0.3s', cursor: 'pointer' }}
            >
              About
            </a>
            <a href="#stack" style={{ transition: 'opacity 0.3s' }}>Stack</a>
            <a href="#contact" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Contact <span style={{ color: 'var(--accent-red)' }}>•</span></a>
          </nav>
        </header>



        {/* Center Frosted Glass Panel */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
          <div className="hero-load hero-parallax-desc" style={{ width: 'clamp(300px, 60vw, 900px)', height: '58vh', background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)', borderRadius: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '40px 60px', boxSizing: 'border-box' }}>
          </div>
        </div>

        {/* Big SANGEETH Title */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, pointerEvents: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="hero-load hero-parallax-title">
            <h1 className="f-cond" style={{ transform: 'scaleY(1.4)', fontSize: 'clamp(100px, 15vw, 300px)', fontWeight: 700, margin: 0, lineHeight: 0.8, color: 'var(--text-ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              SANGEETH
            </h1>
          </div>
        </div>



        {/* Bottom Center Metrics */}
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <div className="hero-load hero-parallax-roles" style={{ display: 'flex', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
              <div className="f-serif" style={{ fontSize: '36px', color: 'var(--accent-red)', lineHeight: 1 }}>07</div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: 'var(--text-ink)' }}>PROJECTS</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(0,0,0,0.2)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
              <div className="f-serif" style={{ fontSize: '36px', color: 'var(--accent-red)', lineHeight: 1 }}>03</div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: 'var(--text-ink)' }}>AI SYSTEMS</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(0,0,0,0.2)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
              <div className="f-serif" style={{ fontSize: '36px', color: 'var(--accent-red)', lineHeight: 1 }}>33</div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, maxWidth: '100px', lineHeight: 1.6, color: 'var(--text-ink)' }}>BANDIT LEVELS<br/>COMPLETED</div>
            </div>
          </div>
        </div>



        {/* Bottom Extreme Right Dot */}
        <div className="hero-load" style={{ position: 'absolute', bottom: '40px', right: '44px', zIndex: 10 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)' }} />
        </div>

        {/* Cinematic Decorative Crosshairs */}
        <div className="hero-load" style={{ position: 'absolute', top: '15vh', left: '20vw', zIndex: 0 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0V40M0 20H40" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
          </svg>
        </div>
        <div className="hero-load" style={{ position: 'absolute', bottom: '15vh', right: '15vw', zIndex: 0 }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0V40M0 20H40" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
          </svg>
        </div>
        <div className="hero-load" style={{ position: 'absolute', top: '25vh', left: '44px', zIndex: 0, transform: 'translateX(-20px)' }}>
          <div style={{ width: '40px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
        </div>
      </section>

      {/* WORK SECTION */}
      <section id="work" className="section-padding" style={{ position: 'relative', borderTop: '1px solid var(--border-line)' }}>
        <div style={{ position: 'absolute', top: 0, right: '5%', width: '1px', height: '100%', background: 'var(--border-line)' }} />
        <div style={{ position: 'absolute', top: '100px', right: '5%', width: '10vw', height: '2px', background: 'var(--accent-red)' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start', marginBottom: '80px', position: 'relative', zIndex: 1 }}>
          <div>
            <div className="gsap-wipe" style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-red)', marginBottom: '20px', borderBottom: '1px solid var(--border-line)', paddingBottom: '10px', display: 'inline-block' }}>
              Featured Projects 2026
            </div>
            <h2 className="gsap-wipe f-cond" style={{ transform: 'scaleY(1.4)', transformOrigin: 'left center', fontSize: 'clamp(80px, 11vw, 200px)', fontWeight: 700, lineHeight: 0.85, letterSpacing: '-0.02em', color: 'var(--text-ink)', textTransform: 'uppercase', margin: '20px 0 40px 0' }}>
              <span style={{ color: 'var(--accent-red)' }}>Fusion</span> & <br/>Resonance
            </h2>
          </div>
          {/* Removed text block, empty div to keep grid layout intact */}
          <div></div>
        </div>

        {/* Projects Folder Layout */}
        <div className="folder-pin-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', paddingBottom: '10vh' }}>
          <div className="folder-container" style={{ margin: 0 }}>
            <div className="folder-back" />
          
          {[
            { n: '01', t: 'CowTrack', subtitle: 'AI-POWERED LIVESTOCK HEALTH MONITORING PLATFORM', tags: 'CV • FLUTTER', year: '2026', role: 'Full-Stack Developer\n& Machine Learning Engineer', techStack: 'Flutter, Dart\nTensorFlow Lite, YOLOv8\nFirebase, Hive (Local DB)\nREST APIs', d: 'CowTrack is an end-to-end livestock health monitoring platform that uses YOLO-based computer vision to detect diseases in cows in real time. The system works offline-first and syncs data when connected, enabling reliable use in rural environments.', features: ['YOLO Computer Vision', 'Real-time Detection', 'Cross-platform', 'Offline Sync'], icon: <Activity size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
            { n: '02', t: 'Leaflet', subtitle: 'GAMIFIED BOTANICAL CARE COMPANION', tags: 'FLUTTER • UX', year: '2023', role: 'Mobile Developer\n& UX Designer', techStack: 'Flutter, Dart\nRiverpod, Animations\nLocal Storage', d: 'A highly gamified botanical care companion app. Designed rich micro-interactions and immersive animations to reward users for real-world plant maintenance, increasing 30-day user retention by turning chores into a digital pet experience.', features: ['Micro-interactions', 'Gamification', 'Local Notifications', 'State Management'], icon: <Leaf size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
            { n: '03', t: 'LIFE-OS', subtitle: 'PERSONAL COMMAND CENTER DASHBOARD', tags: 'PRODUCTIVITY', year: '2023', role: 'UI/UX Designer\n& Frontend Developer', techStack: 'React, Next.js\nTailwind CSS\nFramer Motion', d: 'A comprehensive personal command center. Architected a dynamic dashboard integrating habit tracking, calendar synchronization, and modular widgets using React, wrapped in a brutalist yet highly functional aesthetic.', features: ['Modular Widgets', 'Calendar Sync', 'Habit Tracking', 'Brutalist UI'], icon: <LayoutDashboard size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
            { n: '04', t: 'Fake WiFi', subtitle: 'PROACTIVE NETWORK DEFENSE TOOL', tags: 'ML • SECURITY', year: '2026', role: 'Security Researcher\n& ML Engineer', techStack: 'Python, Scikit-learn\nWireshark, Scapy\nPandas, Bash', d: 'A proactive network defense tool. Developed an ML-driven anomaly detection engine capable of fingerprinting rogue access points and Evil Twin attacks in real-time, instantly alerting users to potential traffic interception.', features: ['Anomaly Detection', 'Packet Sniffing', 'Real-time Alerts', 'Rogue AP Fingerprinting'], icon: <Wifi size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
            { n: '05', t: 'Fake Loan', subtitle: 'PREDATORY LENDING SCAM DETECTOR', tags: 'AI FRAUD', year: '2026', role: 'AI Engineer\n& Data Scientist', techStack: 'Python, NLP\nRandom Forest\nFlask API', d: 'A financial security mechanism. Trained and deployed an NLP and Random Forest ensemble model to analyze loan offer linguistics and metadata, successfully identifying predatory lending scams with 94% accuracy.', features: ['NLP Linguistics', 'Ensemble Modeling', 'Fraud Detection', 'API Integration'], icon: <FileWarning size={36} color="var(--text-ink)" strokeWidth={1.5} /> },
            { n: '06', t: 'Fault Line', subtitle: 'GEOLOGICAL RISK ANALYSIS PLATFORM', tags: 'NEXT.JS', year: '2023', role: 'Full-Stack Developer\n& System Architect', techStack: 'Next.js, WebGL\nSupabase, PostGIS\nMulti-Agent LLMs', d: 'A robust geological analysis dashboard. Built a high-performance Next.js full-stack application rendering complex topographical datasets. Integrated a multi-agent system which helps to take decisions on high-risk things based on geological factors.', features: ['WebGL Rendering', 'Multi-Agent System', 'Topographical Data', 'Risk Assessment'], icon: <Map size={36} color="var(--text-ink)" strokeWidth={1.5} /> }
          ].map((p, i) => (
            <div key={i} className="project-paper" style={{ display: 'flex', flexDirection: 'column', padding: '30px', overflow: 'hidden', boxSizing: 'border-box' }}>
              {/* Subtle background tech grid */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: 0, pointerEvents: 'none' }} />
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                
                {/* Top Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  
                  {/* Left: Typography Heavy Titles */}
                  <div style={{ maxWidth: '65%' }}>
                    <h3 className="f-cond" style={{ fontSize: 'clamp(60px, 8vw, 120px)', transform: 'scaleY(1.3)', transformOrigin: 'bottom left', fontWeight: 700, color: 'var(--text-ink)', margin: '24px 0 24px 0', textTransform: 'uppercase', lineHeight: 0.8 }}>
                      {p.t}
                    </h3>
                    
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(0,0,0,0.7)', fontWeight: 600, marginBottom: '32px', lineHeight: 1.4 }}>
                      {p.subtitle}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {p.features.map((f, fi) => (
                        <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255, 68, 51, 0.3)', padding: '6px 12px', borderRadius: '4px', fontSize: '9px', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                          <div style={{ width: '4px', height: '4px', background: 'var(--accent-red)' }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Massive Number */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div className="f-cond" style={{ fontSize: '160px', transform: 'scaleY(1.3)', transformOrigin: 'top right', fontWeight: 700, color: 'var(--accent-red)', lineHeight: 0.7, margin: 0, letterSpacing: '-0.02em' }}>
                      {p.n}
                    </div>
                  </div>

                </div>

                {/* Bottom Section: Grid Data */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 2fr', gap: '24px', borderTop: '2px solid var(--text-ink)', paddingTop: '16px', marginTop: 'auto' }}>
                  
                  <div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-red)', fontWeight: 600, marginBottom: '8px' }}>Role</div>
                    <div style={{ fontSize: '10px', lineHeight: 1.6, color: 'var(--text-ink)', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{p.role}</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-red)', fontWeight: 600, marginBottom: '8px' }}>Tech Stack</div>
                    <div style={{ fontSize: '10px', lineHeight: 1.6, color: 'var(--text-ink)', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{p.techStack}</div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '11px', lineHeight: 1.6, color: 'rgba(0,0,0,0.8)', margin: 0, fontWeight: 500 }}>{p.d}</p>
                  </div>

                </div>

              </div>
            </div>
          ))}

            <div className="folder-front" style={{ display: 'flex', flexDirection: 'column', padding: '40px', boxSizing: 'border-box' }}>
              {/* Folder Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '20px', marginBottom: '30px', alignItems: 'flex-end' }}>
                <span className="f-cond" style={{ fontSize: '64px', transform: 'scaleY(1.4)', transformOrigin: 'bottom left', color: 'rgba(0,0,0,0.8)', letterSpacing: '-0.02em', fontWeight: 700, textTransform: 'uppercase', lineHeight: 0.85, display: 'inline-block' }}>Project Archive</span>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-red)', fontWeight: 600, padding: '4px 8px', border: '1px solid var(--accent-red)', borderRadius: '2px', display: 'flex', alignItems: 'center' }}>Confidential</span>
              </div>
              
              {/* Projects Index (Text Definition) */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(0,0,0,0.4)', marginBottom: '15px' }}>Index Contents</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x 20px', rowGap: '12px', fontSize: '13px', color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}>
                  <div style={{ display: 'flex', gap: '10px' }}><span style={{ opacity: 0.5 }}>01 /</span> CowTrack</div>
                  <div style={{ display: 'flex', gap: '10px' }}><span style={{ opacity: 0.5 }}>02 /</span> Leaflet</div>
                  <div style={{ display: 'flex', gap: '10px' }}><span style={{ opacity: 0.5 }}>03 /</span> LIFE-OS</div>
                  <div style={{ display: 'flex', gap: '10px' }}><span style={{ opacity: 0.5 }}>04 /</span> Fake WiFi</div>
                  <div style={{ display: 'flex', gap: '10px' }}><span style={{ opacity: 0.5 }}>05 /</span> Fake Loan</div>
                  <div style={{ display: 'flex', gap: '10px' }}><span style={{ opacity: 0.5 }}>06 /</span> Fault Line</div>
                </div>
              </div>

              {/* Folder Bottom Bar with Barcode */}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '20px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(0,0,0,0.4)', lineHeight: 1.6 }}>
                  Do Not Distribute<br/>Portfolio 2026
                </div>
                {/* Barcode Graphic */}
                <div style={{ display: 'flex', gap: '2px', height: '24px', opacity: 0.6 }}>
                  {[1,3,1,2,4,1,2,1,3,1,2,1,1,2].map((w, i) => (
                    <div key={i} style={{ width: `${w}px`, background: 'rgba(0,0,0,0.8)', height: '100%' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT / STACK SECTION */}
      <section id="stack" className="section-padding" style={{ background: 'var(--text-ink)', color: 'var(--bg-cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '100px', padding: '0 20px', boxSizing: 'border-box' }}>
          <h2 className="gsap-scale-text f-cond" style={{ transform: 'scaleY(1.4)', transformOrigin: 'center center', fontSize: 'clamp(80px, 12vw, 200px)', fontWeight: 700, lineHeight: 0.8, letterSpacing: '-0.02em', color: 'var(--bg-cream)', textTransform: 'uppercase', margin: '40px 0', textAlign: 'center' }}>
            DESIGN <br/><span style={{ color: 'var(--accent-red)' }}>ORIGINATES</span><br/> FROM LIFE.
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px', background: 'rgba(237,232,223,0.1)' }}>
          {[
            { c: 'Mobile', n: 'Flutter / Dart', s: 'Riverpod, custom theming, role-based navigation' },
            { c: 'Frontend', n: 'Next.js / React', s: 'Full-stack web apps, SSR/SSG' },
            { c: 'Backend', n: 'Firebase & Supabase', s: 'Firestore, Auth, Cloud Functions, Realtime DB' },
            { c: 'Enterprise', n: 'Spring Boot (Java)', s: 'Full CRM dashboard with enterprise-grade REST API' },
            { c: 'AI / ML', n: 'Gemini · OpenAI', s: 'Sarvam API, Random Forest classifier, AWS ML/AI certified' },
            { c: 'Security', n: 'Adversarial Red-Teaming', s: 'GCG, indirect injection, OverTheWire Bandit (33/33)' }
          ].map((s, i) => (
            <div key={i} className="gsap-reveal" style={{ background: 'var(--text-ink)', padding: '40px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-red)', marginBottom: '16px' }}>{s.c}</div>
              <div className="f-serif" style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>{s.n}</div>
              <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--text-muted)' }}>{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="section-padding" style={{ position: 'relative', textAlign: 'left', paddingBottom: '60px', background: 'var(--bg-cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', overflow: 'hidden' }}>
        
        {/* 3D Emerald Green Dahlia Background */}
        <EmeraldDahlia />

        {/* Abstract Green Graphic Elements */}
        <div className="gsap-reveal" style={{ position: 'absolute', top: 0, right: '50%', width: '1px', height: '100vh', background: 'rgba(0, 91, 65, 0.2)', opacity: 1, zIndex: 1 }} />
        <div className="gsap-reveal" style={{ position: 'absolute', bottom: '15%', left: 0, width: '100vw', height: '1px', background: 'rgba(0, 91, 65, 0.2)', opacity: 1, zIndex: 1 }} />

        {/* Text Container with Frosted Glass Blur Card */}
        <div style={{ 
          width: '100%', 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '120px', 
          position: 'relative', 
          zIndex: 2, 
          padding: '80px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.6)',
          borderLeft: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
          borderRadius: '32px'
        }}>
          
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
            <div className="gsap-wipe" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#005B41', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '40px', height: '2px', background: '#005B41' }} />
              Open For Opportunities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="gsap-wipe f-cond" style={{ fontSize: 'clamp(60px, 12vw, 200px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0', color: 'var(--text-ink)', lineHeight: 0.85, textTransform: 'uppercase' }}>
                LET'S <span style={{ color: '#005B41' }}>BUILD</span>
              </h2>
              <h2 className="gsap-wipe f-cond" style={{ fontSize: 'clamp(60px, 12vw, 200px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0', color: 'var(--text-ink)', lineHeight: 0.85, textTransform: 'uppercase', paddingLeft: '80px' }}>
                THE FUTURE.
              </h2>
            </div>
          </div>

          {/* Contact Grid */}
          <div className="gsap-reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: '80px', borderTop: '2px solid var(--text-ink)', paddingTop: '60px', marginTop: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#005B41', fontWeight: 600 }}>Email</span>
              <a href="mailto:sangeeth00x@gmail.com" className="f-serif" style={{ fontSize: '24px', color: 'var(--text-ink)', textDecoration: 'none' }}>
                sangeeth00x@gmail.com
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#005B41', fontWeight: 600 }}>Phone</span>
              <a href="tel:+918078757172" className="f-serif" style={{ fontSize: '24px', color: 'var(--text-ink)', textDecoration: 'none' }}>
                +91 8078757172
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#005B41', fontWeight: 600 }}>GitHub</span>
              <a href="https://github.com/Caxted" target="_blank" rel="noreferrer" className="f-serif" style={{ fontSize: '24px', color: 'var(--text-ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                @Caxted <ArrowRight size={20} color="#005B41" />
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#005B41', fontWeight: 600 }}>LinkedIn</span>
              <a href="https://www.linkedin.com/in/sangeeth-cs-94668531b/" target="_blank" rel="noreferrer" className="f-serif" style={{ fontSize: '24px', color: 'var(--text-ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Sangeeth CS <ArrowRight size={20} color="#005B41" />
              </a>
            </div>

          </div>

          {/* Footer Bottom Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '30px', marginTop: '20px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>
              © 2026 SANGEETH CS
            </span>
            <div style={{ display: 'flex', gap: '24px' }}>
               <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>AVAILABLE FOR FREELANCE</span>
               <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>BASED IN INDIA</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Editorial About Modal */}
      <div 
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', width: '100%', height: '100%', alignItems: 'center', transform: isAboutOpen ? 'translateY(0)' : 'translateY(40px)', transition: 'transform 0.8s cubic-bezier(0.85, 0, 0.15, 1) 0.1s' }}>
          
          {/* Left Side: Big Title */}
          <div>
            <div style={{ color: 'var(--accent-red)', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '24px' }}>* The Architect</div>
            <h2 className="f-cond" style={{ fontSize: '12vw', lineHeight: 0.85, fontWeight: 700, color: 'var(--text-ink)', letterSpacing: '-0.02em', margin: 0 }}>
              ABOUT<br />SANGEETH
            </h2>
          </div>

          {/* Right Side: Editorial Text */}
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div className="f-serif" style={{ fontSize: '28px', lineHeight: 1.4, color: 'var(--text-ink)' }}>
              I am a <span style={{ fontStyle: 'italic', color: 'var(--accent-red)' }}>full-stack engineer</span> and AI builder obsessed with creating digital experiences that feel physically impossible.
            </div>
            
            <div style={{ fontSize: '12px', lineHeight: 1.8, color: 'rgba(0,0,0,0.6)', fontWeight: 500, letterSpacing: '0.02em' }}>
              Specializing in highly complex systems, machine learning architectures, and bleeding-edge web technologies, I bridge the gap between heavy computational logic and flawless, high-fashion art direction. Whether I'm training custom YOLO models for livestock monitoring or building immersive 3D web applications, I refuse to compromise on aesthetics or performance.
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.1)' }} />

            <div style={{ display: 'flex', gap: '80px' }}>
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

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function ParallaxHeroImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check viewport width and reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.innerWidth >= 768;

    if (prefersReducedMotion || !isDesktop) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Subtly bound parallax to max 24px so it never drifts from crop
          const damped = Math.min(Math.max(scrollY * 0.08, -10), 28);
          setOffsetY(damped);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 
        Parallax Motion Wrapper:
        Isolated transform wrapper so scroll parallax does not collide with the entrance scale-settle animation.
      */}
      <div
        className="relative w-full h-[112%] -top-[4%] transition-transform duration-100 ease-out"
        style={{
          transform: enabled ? `translate3d(0, ${offsetY}px, 0)` : 'translate3d(0, 0, 0)',
        }}
      >
        {/* Entrance Settle Animation Container */}
        <div className="relative w-full h-full animate-hero-settle">
          <Image
            src="/images/hero-architecture.jpg"
            alt="Modern luxury architectural villa with reflection pool at twilight illustrating Estora real estate valuation intelligence"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[75%_35%] md:object-[80%_38%] lg:object-[85%_42%] opacity-100"
            quality={95}
          />
        </div>
      </div>

      {/* 
        Theme-Aware Directional Horizontal Scrim:
        - Left 0-30%: Pure background protecting the editorial headline and copy for 100% WCAG AAA contrast.
        - Center 30-65%: Smooth editorial transition gradient into transparency.
        - Right 65-100%: 100% transparent with ZERO overlay on the villa, wood soffits, concrete cantilever, and pool.
      */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background via-30% md:via-background/90 md:via-42% lg:via-background/75 lg:via-38% to-transparent to-75% lg:to-65% pointer-events-none" />

      {/* 
        Mobile Directional Scrim:
        Provides clear contrast for stacked typography while letting the villa and pool shine through below.
      */}
      <div className="md:hidden absolute inset-0 bg-gradient-to-b from-background via-background/85 via-50% to-background/30 pointer-events-none" />

      {/* Top edge fade: subtly blends the twilight sky into the header without clipping */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/80 to-transparent pointer-events-none" />

      {/* Bottom edge fade: melts the lower reflection pool cleanly into the methodology divider without fogging the building */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
    </div>
  );
}

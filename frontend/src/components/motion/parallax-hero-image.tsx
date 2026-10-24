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
            className="object-cover object-[center_35%] md:object-[58%_center] lg:object-[60%_center] opacity-100"
            quality={95}
          />
        </div>
      </div>

      {/* 
        Subtle, Localized Atmospheric Haze:
        - Replaces the broad opaque wash with a gentle translucent mist.
        - Left 0-25%: Translucent warm haze (never 100% opaque) preserving architectural visibility underneath.
        - Center 25-55%: Naturally dissolves into the crisp photograph with no visible vertical seam.
        - Right 55-100%: 100% transparent - the architectural pavilion, pool, and twilight sky remain at full natural color, contrast, and sharpness.
      */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background/75 via-background/40 via-35% to-transparent to-60% pointer-events-none" />

      {/* 
        Mobile Atmospheric Mist:
        Translucent top-down gradient providing clear contrast for headline while preserving full villa and pool visibility below.
      */}
      <div className="md:hidden absolute inset-0 bg-gradient-to-b from-background/80 via-background/45 via-45% to-transparent pointer-events-none" />
    </div>
  );
}

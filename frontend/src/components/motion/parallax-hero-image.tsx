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
          const damped = Math.min(Math.max(scrollY * 0.08, -10), 24);
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
        Both the base image, the oversized ESTORA wordmark, and the foreground building cutout
        are encapsulated within this unified transform wrapper.
        When scrolling occurs, all layers track synchronously in physical space.
      */}
      <div
        className="relative w-full h-[112%] -top-[4%] transition-transform duration-100 ease-out"
        style={{
          transform: enabled ? `translate3d(0, ${offsetY}px, 0)` : 'translate3d(0, 0, 0)',
        }}
      >
        {/* Layer 1: Base Architectural Photograph */}
        <div className="absolute inset-0 w-full h-full animate-hero-settle">
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

        {/* 
          Layer 2: Oversized ESTORA Architectural Wordmark
          - Spans across the upper twilight sky behind the cantilever and villa roofline.
          - Restrained warm ivory / stone tone with soft illumination.
          - Architectural typography anchored directly into the scene.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[2.5%] sm:top-[3.5%] md:top-[4.5%] lg:top-[5%] flex justify-center items-start pointer-events-none select-none z-[1] overflow-hidden"
        >
          <span
            className="font-serif font-medium uppercase tracking-[0.14em] sm:tracking-[0.18em] md:tracking-[0.22em] lg:tracking-[0.25em] text-[15vw] sm:text-[14vw] md:text-[13vw] lg:text-[12.5vw] xl:text-[12vw] leading-none text-[#F6F3EB]/70 dark:text-[#DCD5C5]/35 drop-shadow-[0_1px_8px_rgba(20,21,17,0.15)] transition-opacity duration-700"
          >
            ESTORA
          </span>
        </div>

        {/* 
          Layer 3: Foreground Architecture & Refined Silhouette Cutout
          - Exact 1:1 geometry of the building structure, cantilever, terrace, and pool reflection.
          - Renders on top of the wordmark so the concrete slabs, glass facades, and palm trees
            naturally and cleanly obscure the letters without artificial outlines.
        */}
        <div className="absolute inset-0 w-full h-full animate-hero-settle z-[2]">
          <Image
            src="/images/hero-architecture-foreground.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] md:object-[58%_center] lg:object-[60%_center]"
            quality={95}
          />
        </div>
      </div>

      {/* 
        Layer 4: Localized Atmospheric Left-Edge Haze
        - Subtle, localized warm haze focused on the left edge for text contrast.
        - Naturally dissolves into the crisp photograph by 50% without covering the pavilion or reflection pool.
      */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background/75 via-background/35 via-30% to-transparent to-55% pointer-events-none z-[3]" />

      {/* Mobile Atmospheric Mist */}
      <div className="md:hidden absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 via-40% to-transparent pointer-events-none z-[3]" />
    </div>
  );
}

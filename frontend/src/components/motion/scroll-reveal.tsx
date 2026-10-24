'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'none';
  distance?: number;
  threshold?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 16,
  threshold = 0.12,
  className,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setReducedMotion(true);
      setIsVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const transformStyle =
    reducedMotion || isVisible
      ? 'translate3d(0, 0, 0)'
      : direction === 'up'
      ? `translate3d(0, ${distance}px, 0)`
      : 'translate3d(0, 0, 0)';

  const dynamicStyle: React.CSSProperties = {
    ...style,
    transform: transformStyle,
    opacity: reducedMotion || isVisible ? 1 : 0,
    transition: reducedMotion
      ? 'none'
      : `opacity 650ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms, transform 650ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms`,
    willChange: isVisible ? 'auto' : 'opacity, transform',
  };

  return (
    <div ref={ref} className={cn('w-full', className)} style={dynamicStyle} {...props}>
      {children}
    </div>
  );
}

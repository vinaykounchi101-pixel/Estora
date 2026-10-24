import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

describe('ScrollReveal Motion Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children with transition styling', () => {
    render(
      <ScrollReveal>
        <div data-testid="reveal-content">Editorial Heading</div>
      </ScrollReveal>
    );

    const element = screen.getByTestId('reveal-content');
    expect(element).toBeInTheDocument();
  });

  it('immediately displays content when prefers-reduced-motion is true', () => {
    // Mock reduced motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(
      <ScrollReveal direction="up" distance={20}>
        <div>Accessible Content</div>
      </ScrollReveal>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transform).toBe('translate3d(0, 0, 0)');
    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.style.transition).toBe('none');
  });
});

describe('ParallaxHeroImage Component', () => {
  it('renders architectural hero photograph with full opacity and optimal quality attributes', async () => {
    const { ParallaxHeroImage } = await import('@/components/motion/parallax-hero-image');
    render(<ParallaxHeroImage />);

    const img = screen.getByAltText(/Modern luxury architectural villa/i);
    expect(img).toBeInTheDocument();
    expect(img.className).toContain('opacity-100');
    expect(img.className).not.toContain('opacity-85');
  });
});

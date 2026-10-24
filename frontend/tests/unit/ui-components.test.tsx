import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';

describe('UI Primitives', () => {
  it('renders Button with variants and disabled/loading state', () => {
    const { rerender } = render(<Button variant="primary">Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();

    rerender(<Button isLoading>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Input with label, hint, and error states', () => {
    const { rerender } = render(
      <Input label="Area" hint="Square feet" placeholder="e.g. 1200" />
    );
    expect(screen.getByLabelText(/area/i)).toBeInTheDocument();
    expect(screen.getByText(/square feet/i)).toBeInTheDocument();

    rerender(<Input label="Area" error="Area is required" />);
    expect(screen.getByText(/area is required/i)).toBeInTheDocument();
  });

  it('renders Badge with correct styles', () => {
    render(<Badge variant="sage">Pune Verified</Badge>);
    expect(screen.getByText(/pune verified/i)).toBeInTheDocument();
  });

  it('renders Card with content', () => {
    render(
      <Card>
        <CardTitle>Valuation Card</CardTitle>
      </Card>
    );
    expect(screen.getByText(/valuation card/i)).toBeInTheDocument();
  });
});

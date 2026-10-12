import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('title-cases a hyphenated status into readable text', () => {
    render(<StatusBadge status="in-review" />);
    expect(screen.getByText('In Review')).toBeInTheDocument();
  });

  it('renders an unmapped status without throwing', () => {
    render(<StatusBadge status="some-unmapped-status" />);
    expect(screen.getByText('Some Unmapped Status')).toBeInTheDocument();
  });
});

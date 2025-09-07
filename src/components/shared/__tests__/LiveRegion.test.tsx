import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LiveRegion } from '../LiveRegion';

// Mock timers
vi.useFakeTimers();

describe('LiveRegion', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders with correct ARIA attributes', () => {
    render(<LiveRegion message="Test message" />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region).toHaveClass('sr-only');
  });

  it('displays message when provided', () => {
    render(<LiveRegion message="Important update" />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Important update');
  });

  it('supports different politeness levels', () => {
    const { rerender } = render(<LiveRegion message="Test" level="assertive" />);
    
    let region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'assertive');

    rerender(<LiveRegion message="Test" level="off" />);
    region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'off');
  });

  it('clears message after delay', () => {
    render(<LiveRegion message="Temporary message" clearDelay={1000} />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Temporary message');
    
    vi.advanceTimersByTime(1000);
    
    expect(region).toHaveTextContent('');
  });

  it('updates message when prop changes', () => {
    const { rerender } = render(<LiveRegion message="First message" />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('First message');
    
    rerender(<LiveRegion message="Updated message" />);
    expect(region).toHaveTextContent('Updated message');
  });

  it('handles empty messages', () => {
    render(<LiveRegion message="" />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('');
  });

  it('clears existing timeout when new message arrives', () => {
    const { rerender } = render(<LiveRegion message="First" clearDelay={5000} />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('First');
    
    vi.advanceTimersByTime(2000);
    rerender(<LiveRegion message="Second" clearDelay={5000} />);
    expect(region).toHaveTextContent('Second');
    
    vi.advanceTimersByTime(5000);
    expect(region).toHaveTextContent('');
  });

  it('does not clear message when clearDelay is 0', () => {
    render(<LiveRegion message="Persistent message" clearDelay={0} />);
    
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Persistent message');
    
    vi.advanceTimersByTime(10000);
    expect(region).toHaveTextContent('Persistent message');
  });
});
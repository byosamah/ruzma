import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SkipNavigation } from '../SkipNavigation';

// Mock the main content and navigation elements
beforeEach(() => {
  document.body.innerHTML = `
    <div id="navigation">Navigation</div>
    <main id="main-content">Main Content</main>
  `;
});

describe('SkipNavigation', () => {
  it('renders skip links', () => {
    render(<SkipNavigation />);
    
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });

  it('has correct href attributes', () => {
    render(<SkipNavigation />);
    
    const mainLink = screen.getByText('Skip to main content');
    const navLink = screen.getByText('Skip to navigation');
    
    expect(mainLink).toHaveAttribute('href', '#main-content');
    expect(navLink).toHaveAttribute('href', '#navigation');
  });

  it('is hidden by default but visible on focus', () => {
    const { container } = render(<SkipNavigation />);
    
    const skipContainer = container.firstChild as HTMLElement;
    expect(skipContainer).toHaveClass('sr-only');
    expect(skipContainer).toHaveClass('focus-within:not-sr-only');
  });

  it('has proper focus management', async () => {
    const user = userEvent.setup();
    render(<SkipNavigation />);
    
    const mainLink = screen.getByText('Skip to main content');
    
    await user.tab();
    expect(mainLink).toHaveFocus();
  });

  it('applies custom className', () => {
    const { container } = render(<SkipNavigation className="custom-skip-nav" />);
    
    const skipContainer = container.firstChild as HTMLElement;
    expect(skipContainer).toHaveClass('custom-skip-nav');
  });

  it('has proper z-index for visibility', () => {
    render(<SkipNavigation />);
    
    const mainLink = screen.getByText('Skip to main content');
    const navLink = screen.getByText('Skip to navigation');
    
    expect(mainLink).toHaveClass('z-50');
    expect(navLink).toHaveClass('z-50');
  });

  it('uses high contrast styling for accessibility', () => {
    render(<SkipNavigation />);
    
    const mainLink = screen.getByText('Skip to main content');
    expect(mainLink).toHaveClass('bg-primary', 'text-primary-foreground');
  });
});
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert', () => {
  it('renders with default variant', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test description</AlertDescription>
      </Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('bg-background');
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders with destructive variant', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error Title</AlertTitle>
        <AlertDescription>Error description</AlertDescription>
      </Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
  });

  it('renders AlertTitle as h5 element', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
      </Alert>
    );
    
    const title = screen.getByRole('heading', { level: 5 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Test Title');
    expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight');
  });

  it('renders AlertDescription with proper styling', () => {
    render(
      <Alert>
        <AlertDescription>Test description with formatting</AlertDescription>
      </Alert>
    );
    
    const description = screen.getByText('Test description with formatting');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm');
  });

  it('supports custom className', () => {
    render(
      <Alert className="custom-alert-class">
        <AlertTitle className="custom-title-class">Title</AlertTitle>
        <AlertDescription className="custom-desc-class">Description</AlertDescription>
      </Alert>
    );
    
    expect(screen.getByRole('alert')).toHaveClass('custom-alert-class');
    expect(screen.getByRole('heading')).toHaveClass('custom-title-class');
    expect(screen.getByText('Description')).toHaveClass('custom-desc-class');
  });

  it('supports ARIA attributes', () => {
    render(
      <Alert aria-labelledby="alert-title" data-testid="test-alert">
        <AlertTitle id="alert-title">Important Alert</AlertTitle>
        <AlertDescription>This is important information</AlertDescription>
      </Alert>
    );
    
    const alert = screen.getByTestId('test-alert');
    expect(alert).toHaveAttribute('aria-labelledby', 'alert-title');
    expect(alert).toHaveAttribute('role', 'alert');
  });
});
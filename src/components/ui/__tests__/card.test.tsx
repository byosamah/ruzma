import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Components', () => {
  it('renders card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Test Content</p>
        </CardContent>
        <CardFooter>
          <button>Test Button</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  it('applies correct semantic structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Semantic Title</CardTitle>
        </CardHeader>
      </Card>
    );

    const title = screen.getByText('Semantic Title');
    expect(title.tagName).toBe('H3');
  });

  it('has proper styling classes', () => {
    const { container } = render(
      <Card className="custom-class">
        <CardContent>Content</CardContent>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-md', 'border', 'shadow-sm');
    expect(card).toHaveClass('custom-class');
  });

  it('supports click interactions when needed', () => {
    const handleClick = vi.fn();
    
    render(
      <Card onClick={handleClick} className="cursor-pointer">
        <CardContent>Clickable Card</CardContent>
      </Card>
    );

    const card = screen.getByText('Clickable Card').closest('div');
    card?.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('maintains responsive design', () => {
    render(
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle>Responsive Card</CardTitle>
        </CardHeader>
      </Card>
    );

    const header = screen.getByText('Responsive Card').parentElement;
    expect(header).toHaveClass('p-3', 'sm:p-4');
  });

  it('handles empty states gracefully', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    );

    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
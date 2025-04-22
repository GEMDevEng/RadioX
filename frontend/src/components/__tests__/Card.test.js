import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <h1>Test Heading</h1>
        <p>Test paragraph content</p>
      </Card>
    );
    
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test paragraph content')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<Card>Content</Card>);
    
    const cardElement = screen.getByText('Content').parentElement;
    expect(cardElement).toHaveClass('bg-white');
    expect(cardElement).toHaveClass('dark:bg-gray-800');
    expect(cardElement).toHaveClass('rounded-lg');
    expect(cardElement).toHaveClass('shadow-md');
    expect(cardElement).toHaveClass('p-6');
  });

  it('applies additional className when provided', () => {
    render(<Card className="custom-class">Content</Card>);
    
    const cardElement = screen.getByText('Content').parentElement;
    expect(cardElement).toHaveClass('custom-class');
    expect(cardElement).toHaveClass('bg-white');
    expect(cardElement).toHaveClass('dark:bg-gray-800');
  });

  it('renders with correct accessibility attributes', () => {
    render(
      <Card aria-label="Test card">
        <p>Accessible content</p>
      </Card>
    );
    
    const cardElement = screen.getByText('Accessible content').parentElement;
    expect(cardElement).toHaveAttribute('aria-label', 'Test card');
  });
});

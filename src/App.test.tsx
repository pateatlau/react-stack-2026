import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App';

describe('App Component', () => {
  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  };

  it('renders the main heading', () => {
    renderApp();
    expect(screen.getByText('react-stack')).toBeInTheDocument();
  });

  it('displays the counter component', () => {
    renderApp();
    expect(screen.getByText('Zustand counter')).toBeInTheDocument();
  });

  it('displays the increment button', () => {
    renderApp();
    const button = screen.getByRole('button', { name: /increment/i });
    expect(button).toBeInTheDocument();
  });
});

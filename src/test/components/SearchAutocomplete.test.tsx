import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchAutocomplete from '../../components/SearchAutocomplete';
import type { Suggestion } from '../../lib/types';

const suggestions: Suggestion[] = [
  { portfolioId: 'P1', provider: 'GENEFIX', description: 'Tornillo cortical' },
  { portfolioId: 'P2', provider: 'LH', description: 'Clavo intramedular' },
  { portfolioId: 'P3', provider: 'GENEFIX', description: 'Placa bloqueada' },
];

describe('SearchAutocomplete', () => {
  it('filters by description and renders grouped options', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={suggestions} onSelect={onSelect} />);

    await user.type(screen.getByRole('combobox'), 'tornillo');

    expect(screen.getByText('Genefix')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Tornillo cortical/i })).toBeInTheDocument();
  });

  it('filters by provider substring', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={suggestions} onSelect={onSelect} />);

    await user.type(screen.getByRole('combobox'), 'lh');

    expect(screen.getByText('Lh')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Clavo intramedular/i })).toBeInTheDocument();
  });

  it('calls onSelect with suggestion when clicking an option', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={suggestions} onSelect={onSelect} />);

    await user.type(screen.getByRole('combobox'), 'clavo');
    await user.click(screen.getByRole('option', { name: /Clavo intramedular/i }));

    expect(onSelect).toHaveBeenCalledWith(suggestions[1]);
  });

  it('calls onSelect(null) when query is cleared', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={suggestions} onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await user.type(input, 'Tornillo');
    await user.clear(input);

    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('supports keyboard selection with ArrowDown and Enter', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SearchAutocomplete suggestions={suggestions} onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await user.type(input, 'tor');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledWith(suggestions[0]);
  });

  it('shows matches from all portfolios without truncating early', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const manyFromP1: Suggestion[] = Array.from({ length: 55 }, (_, index) => ({
      portfolioId: 'P1',
      provider: 'GENEFIX',
      description: `Clavo largo ${index + 1}`,
    }));
    const crossPortfolioSuggestions: Suggestion[] = [
      ...manyFromP1,
      { portfolioId: 'P2', provider: 'LH', description: 'Clavo corto especial' },
    ];

    render(<SearchAutocomplete suggestions={crossPortfolioSuggestions} onSelect={onSelect} />);

    await user.type(screen.getByRole('combobox'), 'clavo');

    expect(screen.getByText('Genefix')).toBeInTheDocument();
    expect(screen.getByText('Lh')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Clavo corto especial/i })).toBeInTheDocument();
  });

  it('matches products when query words are separated in description', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const tokenizedSuggestions: Suggestion[] = [
      {
        portfolioId: 'P1',
        provider: 'GENEFIX',
        description: 'Clavo bloqueado de tibia canulado multibloqueo TI 11*300 mm',
      },
      {
        portfolioId: 'P2',
        provider: 'LH',
        description: 'Placa para húmero proximal',
      },
    ];

    render(<SearchAutocomplete suggestions={tokenizedSuggestions} onSelect={onSelect} />);

    await user.type(screen.getByRole('combobox'), 'Clavo tibia');

    expect(
      screen.getByRole('option', {
        name: /Clavo bloqueado de tibia canulado multibloqueo TI 11\*300 mm/i,
      }),
    ).toBeInTheDocument();
  });
});

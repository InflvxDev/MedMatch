import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ComparisonResults from '../../components/ComparisonResults';
import type { PortfolioComparison, Suggestion } from '../../lib/types';

const selection: Suggestion = {
  portfolioId: 'P1',
  provider: 'GENEFIX',
  description: 'Tornillo cortical',
};

describe('ComparisonResults', () => {
  it('renders empty state when there are no comparisons', () => {
    render(<ComparisonResults comparisons={[]} selection={selection} />);

    expect(screen.getByText('Sin coincidencias')).toBeInTheDocument();
    expect(screen.getByText(/Tornillo cortical/)).toBeInTheDocument();
  });

  it('shows global best price and one column per comparison', () => {
    const comparisons: PortfolioComparison[] = [
      {
        portfolio: {
          id: 'P1',
          provider: 'GENEFIX',
          descCol: 'P1_GENEFIX_Descripcion',
          marcaCol: null,
          priceCols: [{ key: 'P1_GENEFIX_PRECIO_BASE', label: 'Precio Base' }],
        },
        products: [
          {
            marca: 'ACME',
            description: 'Tornillo cortical',
            prices: [{ label: 'Precio Base', value: 1000 }],
            minPrice: 1000,
          },
        ],
      },
      {
        portfolio: {
          id: 'P2',
          provider: 'LH',
          descCol: 'P2_LH_Descripcion',
          marcaCol: null,
          priceCols: [{ key: 'P2_LH_PRECIO_BASE', label: 'Precio Base' }],
        },
        products: [
          {
            marca: '',
            description: 'Tornillo cortical',
            prices: [{ label: 'Precio Base', value: 900 }],
            minPrice: 900,
          },
        ],
      },
    ];

    render(<ComparisonResults comparisons={comparisons} selection={selection} />);

    expect(screen.getByText(/Mejor precio detectado/i)).toBeInTheDocument();
    expect(screen.getAllByText(/900/).length).toBeGreaterThan(0);
    expect(screen.getByText('Genefix')).toBeInTheDocument();
    expect(screen.getByText('Lh')).toBeInTheDocument();
  });
});

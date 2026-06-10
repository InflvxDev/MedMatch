import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProductCard from '../../components/ProductCard';
import type { ComparedProduct } from '../../lib/types';

const baseProduct: ComparedProduct = {
  marca: 'ACME',
  description: 'Tornillo cortical',
  prices: [{ label: 'Precio Base', value: 1000 }],
  minPrice: 1000,
};

describe('ProductCard', () => {
  it('shows the Mejor badge when product is the global best', () => {
    render(<ProductCard product={baseProduct} globalBestPrice={1000} />);
    expect(screen.getByText(/Mejor/i)).toBeInTheDocument();
  });

  it('does not show the Mejor badge when not global best', () => {
    render(<ProductCard product={baseProduct} globalBestPrice={900} />);
    expect(screen.queryByText(/Mejor/i)).not.toBeInTheDocument();
  });

  it('shows Sin precio when the product has no resolved prices', () => {
    render(
      <ProductCard
        product={{ ...baseProduct, prices: [], minPrice: null }}
        globalBestPrice={null}
      />,
    );
    expect(screen.getByText('Sin precio')).toBeInTheDocument();
  });

  it('renders marca only when present', () => {
    const { rerender } = render(<ProductCard product={baseProduct} globalBestPrice={null} />);
    expect(screen.getByText('ACME')).toBeInTheDocument();

    rerender(
      <ProductCard
        product={{ ...baseProduct, marca: '' }}
        globalBestPrice={null}
      />,
    );
    expect(screen.queryByText('ACME')).not.toBeInTheDocument();
  });
});

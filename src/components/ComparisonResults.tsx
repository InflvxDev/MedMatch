import { useMemo } from 'react';
import type { PortfolioComparison, Suggestion } from '../lib/types';
import { providerLabel } from '../lib/labels';
import ProductCard from './ProductCard';

interface Props {
  comparisons: PortfolioComparison[];
  selection: Suggestion;
}

export default function ComparisonResults({ comparisons, selection }: Props) {
  // Mejor (menor) precio global entre todos los productos de todos los portafolios.
  const globalBestPrice = useMemo(() => {
    const mins = comparisons
      .flatMap((c) => c.products.map((p) => p.minPrice))
      .filter((v): v is number => v !== null);
    return mins.length > 0 ? Math.min(...mins) : null;
  }, [comparisons]);

  if (comparisons.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-surface-200 bg-surface-50 p-6 text-center text-surface-600">
        No se encontraron coincidencias para «{selection.description}».
      </p>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Comparación de precios
      </h2>
      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: `repeat(${comparisons.length}, minmax(260px, 1fr))`,
        }}
      >
        {comparisons.map((comparison) => (
          <div key={comparison.portfolio.id} className="flex flex-col gap-3">
            <header className="rounded-lg bg-primary-600 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-400">
                {comparison.portfolio.id}
              </p>
              <p className="text-sm font-bold text-surface-50">
                {providerLabel(comparison.portfolio.provider)}
              </p>
            </header>
            <div className="flex flex-col gap-3">
              {comparison.products.map((product, idx) => (
                <ProductCard
                  key={`${product.marca}-${product.description}-${idx}`}
                  product={product}
                  globalBestPrice={globalBestPrice}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

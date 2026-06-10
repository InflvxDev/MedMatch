import { useMemo } from 'react';
import type { PortfolioComparison, Suggestion } from '../lib/types';
import { providerLabel } from '../lib/labels';
import { formatCurrency } from '../lib/format';
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
      <div className="reveal mt-8 rounded-xl border border-dashed border-primary-900/20 bg-surface-50/70 p-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary-600">
          Sin coincidencias
        </p>
        <p className="mt-3 text-sm text-secondary-600">
          No se encontraron registros para «{selection.description}».
        </p>
      </div>
    );
  }

  return (
    <section className="mt-6">
      <header className="reveal flex flex-col gap-3 border-b border-primary-900/10 pb-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 font-serif text-2xl font-semibold text-primary-700">
            <span className="font-mono text-sm font-normal text-accent-700">01</span>
            Comparación de precios
          </h2>
          <p className="mt-1 max-w-2xl truncate text-sm text-secondary-600">
            «{selection.description}»
          </p>
        </div>
        {globalBestPrice !== null && (
          <div className="text-left sm:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-secondary-600">
              Mejor precio detectado
            </p>
            <p className="font-mono text-lg font-semibold text-accent-700">
              {formatCurrency(globalBestPrice)}
            </p>
          </div>
        )}
      </header>

      <div className="mt-6 pb-2 sm:overflow-x-auto">
        <div
          className="flex flex-col gap-4 sm:grid sm:gap-5"
          style={{
            gridTemplateColumns: `repeat(${comparisons.length}, minmax(248px, 1fr))`,
          }}
        >
          {comparisons.map((comparison, colIdx) => (
            <div
              key={comparison.portfolio.id}
              className="reveal flex flex-col gap-3"
              style={{ animationDelay: `${colIdx * 90}ms` }}
            >
              <header className="relative overflow-hidden rounded-xl border border-surface-100/10 bg-primary-900/70 px-4 py-3 backdrop-blur-sm">
                <span className="absolute right-0 top-0 h-full w-1 bg-accent-400/70" />
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-400">
                    {comparison.portfolio.id}
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-secondary-300">
                    {comparison.products.length}
                    {comparison.products.length === 1 ? ' ítem' : ' ítems'}
                  </span>
                </div>
                <p className="mt-1 font-serif text-lg font-medium leading-tight text-surface-50">
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
      </div>
    </section>
  );
}

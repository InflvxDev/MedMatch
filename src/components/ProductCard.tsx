import type { ComparedProduct } from '../lib/types';
import { formatCurrency } from '../lib/format';

interface Props {
  product: ComparedProduct;
  /** Mejor (menor) precio global entre todos los portafolios comparados. */
  globalBestPrice: number | null;
}

export default function ProductCard({ product, globalBestPrice }: Props) {
  const isGlobalBest =
    globalBestPrice !== null &&
    product.minPrice !== null &&
    product.minPrice === globalBestPrice;

  return (
    <article
      className={`flex flex-col gap-3 rounded-xl border bg-surface-50 p-4 shadow-sm transition ${
        isGlobalBest ? 'border-accent-400 ring-2 ring-accent-400/40' : 'border-surface-200'
      }`}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          {product.marca && (
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
              {product.marca}
            </p>
          )}
          <h4 className="mt-0.5 text-sm font-semibold leading-snug text-primary-700">
            {product.description}
          </h4>
        </div>
        {isGlobalBest && (
          <span className="shrink-0 rounded-full bg-accent-400 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-800">
            Mejor precio
          </span>
        )}
      </header>

      <ul className="flex flex-col gap-1.5 border-t border-surface-200 pt-3">
        {product.prices.length === 0 && (
          <li className="text-sm text-surface-600">Sin precio disponible</li>
        )}
        {product.prices.map((price) => {
          const isMin = product.minPrice !== null && price.value === product.minPrice;
          return (
            <li key={price.label} className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-surface-700">{price.label}</span>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  isMin ? 'text-primary-700' : 'text-secondary-600'
                }`}
              >
                {formatCurrency(price.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

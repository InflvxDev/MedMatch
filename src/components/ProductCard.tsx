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
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-surface-50 p-4 transition duration-300 hover:-translate-y-0.5 ${
        isGlobalBest
          ? 'border-accent-400 shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-accent-400)_60%,transparent)]'
          : 'border-surface-300/50 shadow-[0_14px_34px_-22px_rgba(8,10,24,0.7)] hover:border-secondary-400/60'
      }`}
    >
      {/* Marca de portafolio destacado (cinta lateral) */}
      <span
        className={`absolute left-0 top-0 h-full w-1 ${
          isGlobalBest ? 'bg-accent-400' : 'bg-surface-300/60 group-hover:bg-secondary-400/60'
        }`}
      />

      <header className="flex items-start justify-between gap-2 pl-2">
        <div>
          {product.marca && (
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary-500">
              {product.marca}
            </p>
          )}
          <h4 className="mt-1 text-sm font-semibold leading-snug text-primary-700">
            {product.description}
          </h4>
        </div>
        {isGlobalBest && (
          <span className="vital-pulse inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-400 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary-900">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-900" />
            Mejor
          </span>
        )}
      </header>

      <ul className="flex flex-col gap-1.5 border-t border-dashed border-surface-300/60 pl-2 pt-3">
        {product.prices.length === 0 && (
          <li className="font-mono text-xs uppercase tracking-wider text-surface-500">
            Sin precio
          </li>
        )}
        {product.prices.map((price) => {
          const isMin = product.minPrice !== null && price.value === product.minPrice;
          return (
            <li key={price.label} className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-wide text-surface-600">
                {price.label}
              </span>
              <span
                className={`font-mono text-sm font-semibold tabular-nums ${
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

import { useMemo, useRef, useState, useEffect } from 'react';
import type { Suggestion } from '../lib/types';
import { providerLabel } from '../lib/labels';

interface Props {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
}

const MAX_RESULTS = 50;

export default function SearchAutocomplete({ suggestions, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return [];
    return suggestions
      .filter(
        (s) =>
          s.description.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [query, suggestions]);

  // Agrupar por proveedor para el dropdown.
  const grouped = useMemo(() => {
    const map = new Map<string, Suggestion[]>();
    for (const s of filtered) {
      const list = map.get(s.provider) ?? [];
      list.push(s);
      map.set(s.provider, list);
    }
    return [...map.entries()];
  }, [filtered]);

  // Lista plana en el mismo orden que se renderiza (para navegación por teclado).
  const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function choose(s: Suggestion) {
    setQuery(s.description);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(s);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || flat.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      choose(flat[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        placeholder="Busca un producto o proveedor…"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-xl border border-secondary-300 bg-surface-50 px-4 py-3 text-base text-primary-700 shadow-sm outline-none placeholder:text-surface-500 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-400/30"
        role="combobox"
        aria-expanded={open}
        aria-controls="search-listbox"
        autoComplete="off"
      />

      {open && query.trim() !== '' && (
        <div
          id="search-listbox"
          role="listbox"
          className="absolute z-20 mt-2 max-h-96 w-full overflow-auto rounded-xl border border-surface-200 bg-surface-50 shadow-lg"
        >
          {flat.length === 0 ? (
            <p className="px-4 py-3 text-sm text-surface-600">Sin resultados</p>
          ) : (
            grouped.map(([provider, items]) => (
              <div key={provider}>
                <p className="sticky top-0 bg-primary-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-surface-50">
                  {providerLabel(provider)}
                </p>
                {items.map((s) => {
                  const flatIndex = flat.indexOf(s);
                  const isActive = flatIndex === activeIndex;
                  return (
                    <button
                      key={`${s.portfolioId}-${s.description}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={() => choose(s)}
                      className={`block w-full px-4 py-2 text-left text-sm transition ${
                        isActive
                          ? 'bg-secondary-100 text-primary-700'
                          : 'text-primary-700 hover:bg-surface-100'
                      }`}
                    >
                      <span className="mr-2 inline-block rounded bg-surface-200 px-1.5 py-0.5 text-[10px] font-bold text-secondary-700">
                        {s.portfolioId}
                      </span>
                      {s.description}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

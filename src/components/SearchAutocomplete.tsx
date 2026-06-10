import { useMemo, useRef, useState, useEffect } from 'react';
import type { Suggestion } from '../lib/types';
import { providerLabel } from '../lib/labels';

interface Props {
  suggestions: Suggestion[];
  /** Se invoca con la selección, o con null cuando se limpia la búsqueda. */
  onSelect: (suggestion: Suggestion | null) => void;
}

const MAX_RESULTS = 50;

export default function SearchAutocomplete({ suggestions, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function updateQuery(value: string) {
    setQuery(value);
    setOpen(true);
    setActiveIndex(-1);
    // Al limpiar la búsqueda, se limpia también la comparación.
    if (value.trim() === '') onSelect(null);
  }

  function clearSearch() {
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
    onSelect(null);
    inputRef.current?.focus();
  }

  function choose(s: Suggestion) {
    setQuery(s.description);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(s);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      if (query !== '') clearSearch();
      else setOpen(false);
      return;
    }
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
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-secondary-300">
        <span className="inline-block h-px w-5 bg-accent-400" />
        Buscar producto
      </label>

      <div
        className={`group relative flex items-center rounded-xl border bg-surface-50 transition ${
          open
            ? 'border-accent-400 shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent-400)_18%,transparent)]'
            : 'border-surface-300/60 shadow-[0_8px_30px_-12px_rgba(8,10,24,0.7)]'
        }`}
      >
        <span className="pl-4 font-mono text-lg text-secondary-500">⌕</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="p. ej. Clavo cefalomedular corto TI…"
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent px-3 py-3.5 text-base text-primary-700 outline-none placeholder:text-surface-500/80"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-listbox"
          autoComplete="off"
        />
        {query !== '' && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpiar búsqueda"
            className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-secondary-500 transition hover:bg-surface-200 hover:text-danger-500"
          >
            ✕
          </button>
        )}
      </div>

      {open && query.trim() !== '' && (
        <div
          id="search-listbox"
          role="listbox"
          className="absolute z-30 mt-2 max-h-96 w-full overflow-auto rounded-xl border border-surface-300/60 bg-surface-50 shadow-[0_24px_60px_-20px_rgba(8,10,24,0.8)]"
        >
          {flat.length === 0 ? (
            <p className="px-4 py-4 text-center font-mono text-xs uppercase tracking-wider text-surface-500">
              Sin resultados
            </p>
          ) : (
            grouped.map(([provider, items]) => (
              <div key={provider}>
                <p className="sticky top-0 z-10 flex items-center gap-2 bg-primary-700 px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-400">
                  <span className="h-1 w-1 rounded-full bg-accent-400" />
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
                      className={`flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left text-sm transition ${
                        isActive
                          ? 'border-accent-400 bg-secondary-50 text-primary-700'
                          : 'border-transparent text-primary-700 hover:bg-surface-100'
                      }`}
                    >
                      <span className="shrink-0 rounded bg-primary-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-surface-50">
                        {s.portfolioId}
                      </span>
                      <span className="leading-snug">{s.description}</span>
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

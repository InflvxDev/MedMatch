import { useEffect, useMemo, useState } from 'react';
import type { ParsedWorkbook, Suggestion } from '../lib/types';
import { buildSuggestions, compare } from '../lib/compare';
import { loadWorkbook, saveWorkbook, clearWorkbook } from '../lib/storage';
import ExcelUploader from './ExcelUploader';
import SearchAutocomplete from './SearchAutocomplete';
import ComparisonResults from './ComparisonResults';

export default function App() {
  const [workbook, setWorkbook] = useState<ParsedWorkbook | null>(null);
  const [selection, setSelection] = useState<Suggestion | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Cargar workbook persistido al iniciar.
  useEffect(() => {
    let active = true;
    loadWorkbook().then((wb) => {
      if (active) {
        setWorkbook(wb);
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const suggestions = useMemo(
    () => (workbook ? buildSuggestions(workbook) : []),
    [workbook],
  );

  const comparisons = useMemo(
    () => (workbook && selection ? compare(workbook, selection) : []),
    [workbook, selection],
  );

  async function handleLoaded(wb: ParsedWorkbook) {
    setWorkbook(wb);
    setSelection(null);
    await saveWorkbook(wb);
  }

  async function handleReplace() {
    setWorkbook(null);
    setSelection(null);
    await clearWorkbook();
  }

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20 text-surface-600">Cargando…</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-10 flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary-700">
          Med<span className="text-accent-400">Match</span>
        </h1>
        <p className="text-sm text-surface-600">
          Comparador de precios de productos médicos
        </p>
      </header>

      {!workbook ? (
        <ExcelUploader onLoaded={handleLoaded} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-surface-600">
              {workbook.fileName} · {workbook.portfolios.length} portafolios ·{' '}
              {workbook.rows.length} registros
            </p>
            <button
              type="button"
              onClick={handleReplace}
              className="rounded-lg border border-secondary-300 bg-surface-50 px-3 py-1.5 text-xs font-semibold text-secondary-600 transition hover:bg-surface-100"
            >
              Reemplazar Excel
            </button>
          </div>

          <SearchAutocomplete suggestions={suggestions} onSelect={setSelection} />

          {selection && (
            <ComparisonResults comparisons={comparisons} selection={selection} />
          )}
        </div>
      )}
    </div>
  );
}

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-secondary-500">
          <span className="h-2 w-2 animate-ping rounded-full bg-accent-400" />
          Cargando instrumento
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pt-6 sm:px-8 sm:pt-10">
      {/* ---------------------------------------------------------------- */}
      {/* Cabecera editorial                                               */}
      {/* ---------------------------------------------------------------- */}
      <header className="relative border-b border-primary-900/10 pb-6 sm:pb-8">
        <div className="reveal flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.4em] text-secondary-600" style={{ animationDelay: '0ms' }}>
          <span className="inline-block h-px w-8 bg-accent-400" />
          Comparador clínico de precios
        </div>

        <div className="mt-5 flex flex-col gap-y-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-8">
          <h1
            className="reveal font-serif text-4xl font-semibold leading-[0.95] tracking-tight text-primary-700 sm:text-7xl"
            style={{ animationDelay: '90ms' }}
          >
            Med<span className="italic text-accent-700">Match</span>
            <span className="align-top font-mono text-base font-normal text-secondary-600">®</span>
          </h1>

          <p
            className="reveal max-w-none text-balance text-sm leading-relaxed text-secondary-600 sm:max-w-xs"
            style={{ animationDelay: '160ms' }}
          >
            Decisiones de compra basadas en evidencia. Compara portafolios médicos
            lado a lado y detecta el mejor precio al instante.
          </p>
        </div>

        <div
          className="rule-grow mt-7 h-px w-full bg-linear-to-r from-accent-400 via-secondary-500/40 to-transparent"
          style={{ animationDelay: '240ms' }}
        />
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Cuerpo                                                           */}
      {/* ---------------------------------------------------------------- */}
      <main className="mt-8 flex-1 sm:mt-10">
        {!workbook ? (
          <div className="reveal" style={{ animationDelay: '320ms' }}>
            <ExcelUploader onLoaded={handleLoaded} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Barra de instrumento */}
            <div
              className="reveal flex flex-col items-start gap-3 rounded-xl border border-primary-900/10 bg-surface-50/80 px-4 py-3 shadow-[0_10px_30px_-20px_rgba(8,10,24,0.5)] backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
              style={{ animationDelay: '40ms' }}
            >
              <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-secondary-600">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Archivo</dt>
                  <dd className="max-w-56 truncate text-primary-700">{workbook.fileName}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt>Portafolios</dt>
                  <dd className="text-accent-700">{String(workbook.portfolios.length).padStart(2, '0')}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt>Registros</dt>
                  <dd className="text-accent-700">{workbook.rows.length.toLocaleString('es-CO')}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleReplace}
                className="group inline-flex items-center gap-2 rounded-lg border border-primary-900/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-secondary-600 transition hover:border-accent-400 hover:text-accent-600"
              >
                <span className="text-accent-500 transition group-hover:rotate-90">↻</span>
                Reemplazar Excel
              </button>
            </div>

            {/* Buscador */}
            <div className="reveal relative z-30" style={{ animationDelay: '120ms' }}>
              <SearchAutocomplete
                suggestions={suggestions}
                onSelect={setSelection}
              />
            </div>

            {selection && (
              <ComparisonResults comparisons={comparisons} selection={selection} />
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-primary-900/10 pb-8 pt-6 sm:mt-16">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 font-serif text-sm font-semibold text-surface-50">
              M
            </span>
            <div className="leading-tight">
              <p className="font-serif text-base font-semibold text-primary-700">
                Med<span className="italic text-accent-700">Match</span>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary-600">
                Comparador clínico
              </p>
            </div>
          </div>



          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-secondary-600">
            © {new Date().getFullYear()} InflvxDev
          </p>
        </div>
      </footer>
    </div>
  );
}

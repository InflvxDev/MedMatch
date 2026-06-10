import { useState, type DragEvent } from 'react';
import { parseWorkbook, ExcelParseError, buildTemplateWorkbook } from '../lib/excel';
import type { ParsedWorkbook } from '../lib/types';

interface Props {
  onLoaded: (workbook: ParsedWorkbook) => void;
}

export default function ExcelUploader({ onLoaded }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    setIsLoading(true);
    try {
      const workbook = await parseWorkbook(file);
      onLoaded(workbook);
    } catch (err) {
      if (err instanceof ExcelParseError) {
        setError(err.message);
      } else {
        setError('No se pudo leer el archivo. Asegúrate de que sea un Excel válido (.xlsx).');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function handleDownloadTemplate() {
    try {
      const blob = await buildTemplateWorkbook();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla-medmatch.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo generar la plantilla. Intenta de nuevo.');
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition duration-300 sm:p-12 ${
          isDragging
            ? 'border-accent-400 bg-accent-400/10'
            : 'border-primary-900/20 bg-surface-50/70 hover:border-secondary-400 hover:bg-surface-50'
        }`}
      >
        {/* Esquinas tipo instrumento */}
        <span className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-accent-400/60" />
        <span className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-accent-400/60" />
        <span className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-accent-400/60" />
        <span className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-accent-400/60" />

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-400/40 bg-surface-100 text-2xl text-accent-600 transition group-hover:scale-105 ${
            isLoading ? 'animate-pulse' : ''
          }`}
        >
          {isLoading ? '◌' : '↑'}
        </div>

        <div>
          <p className="font-serif text-xl font-medium text-primary-700">
            {isLoading ? 'Procesando archivo…' : 'Sube tu archivo Excel'}
          </p>
          <p className="mt-2 text-sm text-secondary-600">
            Arrastra y suelta, o haz clic para seleccionar
          </p>
          <p className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-secondary-500">
            <span className="rounded bg-primary-700 px-1.5 py-0.5 text-accent-400">.xlsx</span>
            hoja «Todos los registros»
          </p>
        </div>

        <input
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          disabled={isLoading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-primary-900/10 bg-surface-50/50 p-4 text-center">
        <p className="text-sm text-secondary-600">
          ¿No tienes un archivo Excel? Descarga una plantilla en blanco con el
          formato requerido.
        </p>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 rounded-lg border border-accent-400/50 bg-surface-100 px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-accent-600 transition hover:border-accent-400 hover:bg-accent-400/10"
        >
          <span aria-hidden="true">↓</span>
          Descargar plantilla
        </button>
      </div>

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-danger-500/40 bg-danger-500/10 p-3 font-mono text-xs leading-relaxed text-danger-500">
          <span className="mt-0.5 shrink-0">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

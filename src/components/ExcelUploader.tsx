import { useState, type DragEvent } from 'react';
import { parseWorkbook, ExcelParseError } from '../lib/excel';
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

  return (
    <div className="mx-auto w-full max-w-xl">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition ${
          isDragging
            ? 'border-accent-400 bg-accent-50'
            : 'border-secondary-300 bg-surface-50 hover:border-secondary-400 hover:bg-surface-100'
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-surface-50">
          ↑
        </div>
        <div>
          <p className="text-base font-semibold text-primary-700">
            {isLoading ? 'Procesando archivo…' : 'Sube tu archivo Excel'}
          </p>
          <p className="mt-1 text-sm text-surface-600">
            Arrastra y suelta o haz clic para seleccionar (.xlsx)
          </p>
          <p className="mt-1 text-xs text-surface-500">
            La hoja debe llamarse <span className="font-semibold">«Todos los registros»</span>
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

      {error && (
        <p className="mt-4 rounded-lg border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}

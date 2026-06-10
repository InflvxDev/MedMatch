import type { CellValue } from 'exceljs';
import type { ExcelRow, ParsedWorkbook, Portfolio } from './types';
import { priceLabel } from './labels';

export const SHEET_NAME = 'Todos los registros';

/** Patrón de columna: P{n}_{PROVEEDOR}_{RESTO}. */
const COLUMN_PATTERN = /^P(\d+)_([^_]+)_(.+)$/i;

export class ExcelParseError extends Error {}

/**
 * Lee un archivo Excel y extrae portafolios y filas.
 * @throws {ExcelParseError} si falta la hoja o no hay portafolios válidos.
 */
export async function parseWorkbook(file: File): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer();
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(buffer);
  } catch {
    throw new ExcelParseError(
      'No se pudo leer el archivo. Asegúrate de que sea un Excel válido (.xlsx).',
    );
  }

  const sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    const available = workbook.worksheets.map((w) => w.name).join(', ');
    throw new ExcelParseError(
      `No se encontró la hoja "${SHEET_NAME}". Hojas disponibles: ${available}`,
    );
  }

  // Cabeceras desde la primera fila (índice de columna -> nombre).
  const headerByCol = new Map<number, string>();
  const headers: string[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const name = cellText(cell.value);
    if (name !== null && String(name).trim() !== '') {
      const header = String(name).trim();
      headerByCol.set(colNumber, header);
      headers.push(header);
    }
  });

  if (headers.length === 0) {
    throw new ExcelParseError('La hoja "Todos los registros" no tiene cabeceras.');
  }

  // Filas de datos (a partir de la fila 2).
  const rows: ExcelRow[] = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    if (!row.hasValues) continue;

    const record: ExcelRow = {};
    let hasData = false;
    for (const [col, header] of headerByCol) {
      const value = cellText(row.getCell(col).value);
      record[header] = value;
      if (value !== null && String(value).trim() !== '') hasData = true;
    }
    if (hasData) rows.push(record);
  }

  if (rows.length === 0) {
    throw new ExcelParseError('La hoja "Todos los registros" está vacía.');
  }

  const portfolios = detectPortfolios(headers);

  if (portfolios.length === 0) {
    throw new ExcelParseError(
      'No se detectaron portafolios. Verifica que existan columnas con el patrón "P1_PROVEEDOR_Descripcion".',
    );
  }

  return {
    portfolios,
    rows,
    fileName: file.name,
    parsedAt: Date.now(),
  };
}

/** Extrae un valor primitivo de una celda de ExcelJS. */
function cellText(value: CellValue): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();

  if (typeof value === 'object') {
    // Fórmula: { formula, result }
    if ('result' in value && value.result !== undefined) {
      return cellText(value.result as CellValue);
    }
    // Texto enriquecido: { richText: [{ text }] }
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('');
    }
    // Hipervínculo: { text, hyperlink }
    if ('text' in value && value.text !== undefined) {
      return cellText(value.text as CellValue);
    }
    // Error de celda: { error }
    if ('error' in value) return null;
  }

  return null;
}

/** Detecta portafolios a partir de las cabeceras de columna. */
export function detectPortfolios(headers: string[]): Portfolio[] {
  // Mapa: "P1::GENEFIX" -> datos del portafolio en construcción.
  const map = new Map<
    string,
    { id: string; provider: string; descCol: string | null; marcaCol: string | null; priceCols: string[] }
  >();

  for (const header of headers) {
    const match = COLUMN_PATTERN.exec(header);
    if (!match) continue;

    const id = `P${match[1]}`;
    const provider = match[2];
    const rest = match[3];
    const key = `${id}::${provider}`;

    let entry = map.get(key);
    if (!entry) {
      entry = { id, provider, descCol: null, marcaCol: null, priceCols: [] };
      map.set(key, entry);
    }

    const restUpper = rest.toUpperCase();
    if (restUpper.includes('PRECIO')) {
      entry.priceCols.push(header);
    } else if (restUpper.includes('DESCRIPCION')) {
      entry.descCol = header;
    } else if (restUpper.includes('MARCA')) {
      entry.marcaCol = header;
    }
  }

  const portfolios: Portfolio[] = [];
  for (const entry of map.values()) {
    // Un portafolio válido necesita al menos descripción.
    if (!entry.descCol) continue;
    portfolios.push({
      id: entry.id,
      provider: entry.provider,
      descCol: entry.descCol,
      marcaCol: entry.marcaCol,
      priceCols: entry.priceCols.map((col) => ({
        key: col,
        label: priceLabel(col, entry.id, entry.provider),
      })),
    });
  }

  // Ordenar por número de portafolio (P1, P2, ...).
  portfolios.sort((a, b) => portfolioNumber(a.id) - portfolioNumber(b.id));
  return portfolios;
}

function portfolioNumber(id: string): number {
  const n = Number(id.replace(/^P/i, ''));
  return Number.isFinite(n) ? n : 0;
}

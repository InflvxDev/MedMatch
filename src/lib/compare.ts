import type {
  ComparedProduct,
  ExcelRow,
  ParsedWorkbook,
  PortfolioComparison,
  ResolvedPrice,
  Suggestion,
} from './types';
import { parseNumber } from './format';

/** Construye la lista de sugerencias de autocompletado (todas las descripciones). */
export function buildSuggestions(workbook: ParsedWorkbook): Suggestion[] {
  const seen = new Set<string>();
  const suggestions: Suggestion[] = [];

  for (const portfolio of workbook.portfolios) {
    for (const row of workbook.rows) {
      const desc = cell(row, portfolio.descCol);
      if (!desc) continue;
      const dedupeKey = `${portfolio.id}::${desc}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      suggestions.push({
        portfolioId: portfolio.id,
        provider: portfolio.provider,
        description: desc,
      });
    }
  }

  return suggestions.sort((a, b) => a.description.localeCompare(b.description, 'es'));
}

/**
 * Compara productos a partir de una selección (portafolio + descripción exacta).
 *
 * 1. Filtra las filas donde el portafolio seleccionado tenga esa descripción.
 * 2. Por cada portafolio recolecta sus productos distintos en esas filas
 *    (dedupe por marca + descripción).
 */
export function compare(
  workbook: ParsedWorkbook,
  selection: Suggestion,
): PortfolioComparison[] {
  const sourcePortfolio = workbook.portfolios.find((p) => p.id === selection.portfolioId);
  if (!sourcePortfolio) return [];

  const target = selection.description.trim().toLowerCase();
  const matchedRows = workbook.rows.filter(
    (row) => (cell(row, sourcePortfolio.descCol) ?? '').trim().toLowerCase() === target,
  );

  if (matchedRows.length === 0) return [];

  const comparisons: PortfolioComparison[] = [];

  for (const portfolio of workbook.portfolios) {
    const seen = new Set<string>();
    const products: ComparedProduct[] = [];

    for (const row of matchedRows) {
      const description = cell(row, portfolio.descCol);
      if (!description) continue;

      const marca = portfolio.marcaCol ? cell(row, portfolio.marcaCol) ?? '' : '';
      const dedupeKey = `${marca}||${description}`.toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const prices = resolvePrices(row, portfolio.priceCols);
      const minPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.value)) : null;

      products.push({ marca, description, prices, minPrice });
    }

    if (products.length > 0) {
      comparisons.push({ portfolio, products });
    }
  }

  return comparisons;
}

function resolvePrices(
  row: ExcelRow,
  priceCols: { key: string; label: string }[],
): ResolvedPrice[] {
  const prices: ResolvedPrice[] = [];
  for (const col of priceCols) {
    const value = parseNumber(row[col.key]);
    if (value !== null) {
      prices.push({ label: col.label, value });
    }
  }
  return prices;
}

function cell(row: ExcelRow, key: string): string | null {
  const value = row[key];
  if (value === null || value === undefined) return null;
  const str = value.toString().trim();
  return str === '' ? null : str;
}

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Formatea un número como moneda colombiana (COP). */
export function formatCurrency(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return currencyFormatter.format(value);
}

/**
 * Intenta convertir un valor crudo de celda a número.
 * Soporta valores ya numéricos y strings con separadores ("1.890.000", "$ 1,890,000").
 */
export function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = value
    .toString()
    .replace(/[^\d,.-]/g, '') // quitar símbolos de moneda y espacios
    .trim();
  if (cleaned === '') return null;

  // Heurística: si hay coma y punto, asumir el último como separador decimal.
  let normalized = cleaned;
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      // coma decimal: "1.890.000,50"
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // punto decimal: "1,890,000.50"
      normalized = cleaned.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    // Solo comas presentes.
    const decimals = cleaned.length - lastComma - 1;
    if ((cleaned.match(/,/g) || []).length > 1 || decimals === 3) {
      // Varias comas, o una coma con 3 dígitos => separador de miles.
      normalized = cleaned.replace(/,/g, '');
    } else {
      // Una coma con 1, 2 (o >3) dígitos => separador decimal.
      normalized = cleaned.replace(',', '.');
    }
  } else if (lastDot !== -1) {
    // Solo puntos presentes.
    const decimals = cleaned.length - lastDot - 1;
    if ((cleaned.match(/\./g) || []).length > 1 || decimals === 3) {
      // Varios puntos, o un punto con 3 dígitos => separador de miles.
      normalized = cleaned.replace(/\./g, '');
    }
    // Un punto con 1, 2 (o >3) dígitos => se deja como decimal.
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

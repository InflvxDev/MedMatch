/**
 * Convierte una clave de columna de precio cruda en una etiqueta legible.
 *
 * Ej: "P1_GENEFIX_PRECIO_BASE_GENEFIX"  -> "Precio Base Genefix"
 *     "P2_LH_PRECIO_LISTA_2026"         -> "Precio Lista 2026"
 *     "P1_GENEFIX_PRECIO_FACTURA_NC_25" -> "Precio Factura Nc 25"
 *
 * Se eliminan el prefijo de portafolio (`P{n}`) y el proveedor.
 */
export function priceLabel(key: string, portfolioId: string, provider: string): string {
  let rest = key;

  // Quitar prefijo "P1_" y "PROVIDER_".
  const prefix = `${portfolioId}_${provider}_`;
  if (rest.toUpperCase().startsWith(prefix.toUpperCase())) {
    rest = rest.slice(prefix.length);
  } else if (rest.toUpperCase().startsWith(`${portfolioId.toUpperCase()}_`)) {
    rest = rest.slice(portfolioId.length + 1);
  }

  // Reemplazar separadores y capitalizar.
  const words = rest.split(/[_\s]+/).filter(Boolean);
  return words.map(titleCaseWord).join(' ').trim() || key;
}

function titleCaseWord(word: string): string {
  // Mantener tokens totalmente numéricos tal cual.
  if (/^\d+$/.test(word)) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Etiqueta legible del proveedor (capitaliza). */
export function providerLabel(provider: string): string {
  return provider
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(titleCaseWord)
    .join(' ');
}

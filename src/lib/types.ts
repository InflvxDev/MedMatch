// Tipos del dominio MedMatch

/** Una columna de precio detectada dentro de un portafolio. */
export interface PriceColumn {
  /** Clave cruda de la columna en el Excel, ej: "P1_GENEFIX_PRECIO_BASE_GENEFIX". */
  key: string;
  /** Etiqueta legible, ej: "Precio Base Genefix". */
  label: string;
}

/** Un portafolio detectado dinámicamente en la hoja. */
export interface Portfolio {
  /** Identificador del portafolio, ej: "P1". */
  id: string;
  /** Proveedor, ej: "GENEFIX". */
  provider: string;
  /** Clave de la columna de descripción, ej: "P1_GENEFIX_Descripcion". */
  descCol: string;
  /** Clave de la columna de marca, si existe. */
  marcaCol: string | null;
  /** Columnas de precio del portafolio. */
  priceCols: PriceColumn[];
}

/** Una fila cruda del Excel (clave de columna -> valor). */
export type ExcelRow = Record<string, string | number | null>;

/** Resultado del parseo del workbook. */
export interface ParsedWorkbook {
  portfolios: Portfolio[];
  rows: ExcelRow[];
  /** Nombre del archivo original. */
  fileName: string;
  /** Marca de tiempo del parseo. */
  parsedAt: number;
}

/** Sugerencia de autocompletado. */
export interface Suggestion {
  portfolioId: string;
  provider: string;
  description: string;
}

/** Un precio resuelto para mostrar en una tarjeta. */
export interface ResolvedPrice {
  label: string;
  value: number;
}

/** Un producto distinto dentro de un portafolio para la comparación. */
export interface ComparedProduct {
  marca: string;
  description: string;
  prices: ResolvedPrice[];
  /** Precio mínimo del producto (para resaltar el mejor). */
  minPrice: number | null;
}

/** Resultados de comparación agrupados por portafolio. */
export interface PortfolioComparison {
  portfolio: Portfolio;
  products: ComparedProduct[];
}

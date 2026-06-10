import { describe, expect, it } from 'vitest';
import { buildSuggestions, compare } from '../../lib/compare';
import type { ParsedWorkbook, Suggestion } from '../../lib/types';

const workbook: ParsedWorkbook = {
  fileName: 'test.xlsx',
  parsedAt: 0,
  portfolios: [
    {
      id: 'P1',
      provider: 'GENEFIX',
      descCol: 'P1_GENEFIX_Descripcion',
      marcaCol: 'P1_GENEFIX_MARCA',
      priceCols: [
        { key: 'P1_GENEFIX_PRECIO_BASE', label: 'Precio Base' },
        { key: 'P1_GENEFIX_PRECIO_LISTA', label: 'Precio Lista' },
      ],
    },
    {
      id: 'P2',
      provider: 'LH',
      descCol: 'P2_LH_Descripcion',
      marcaCol: null,
      priceCols: [{ key: 'P2_LH_PRECIO_LISTA', label: 'Precio Lista' }],
    },
  ],
  rows: [
    {
      P1_GENEFIX_Descripcion: 'Tornillo',
      P1_GENEFIX_MARCA: 'ACME',
      P1_GENEFIX_PRECIO_BASE: 1000,
      P1_GENEFIX_PRECIO_LISTA: 1200,
      P2_LH_Descripcion: 'Tornillo',
      P2_LH_PRECIO_LISTA: 900,
    },
    {
      P1_GENEFIX_Descripcion: 'Tornillo',
      P1_GENEFIX_MARCA: 'ACME',
      P1_GENEFIX_PRECIO_BASE: 950,
      P1_GENEFIX_PRECIO_LISTA: 1100,
      P2_LH_Descripcion: 'Tornillo',
      P2_LH_PRECIO_LISTA: 875,
    },
    {
      P1_GENEFIX_Descripcion: 'Placa',
      P1_GENEFIX_MARCA: 'BETA',
      P1_GENEFIX_PRECIO_BASE: 2000,
      P1_GENEFIX_PRECIO_LISTA: null,
      P2_LH_Descripcion: 'Placa',
      P2_LH_PRECIO_LISTA: 1800,
    },
  ],
};

describe('buildSuggestions', () => {
  it('returns distinct portfolio-description suggestions sorted by description', () => {
    const suggestions = buildSuggestions(workbook);
    expect(suggestions).toEqual([
      { portfolioId: 'P1', provider: 'GENEFIX', description: 'Placa' },
      { portfolioId: 'P2', provider: 'LH', description: 'Placa' },
      { portfolioId: 'P1', provider: 'GENEFIX', description: 'Tornillo' },
      { portfolioId: 'P2', provider: 'LH', description: 'Tornillo' },
    ]);
  });
});

describe('compare', () => {
  it('compares matching rows and computes min prices with deduped products', () => {
    const selection: Suggestion = {
      portfolioId: 'P1',
      provider: 'GENEFIX',
      description: 'Tornillo',
    };

    const result = compare(workbook, selection);
    expect(result).toHaveLength(2);

    const p1 = result.find((c) => c.portfolio.id === 'P1');
    const p2 = result.find((c) => c.portfolio.id === 'P2');

    expect(p1?.products).toHaveLength(1);
    expect(p1?.products[0]).toMatchObject({
      marca: 'ACME',
      description: 'Tornillo',
      minPrice: 1000,
    });

    expect(p2?.products).toHaveLength(1);
    expect(p2?.products[0]).toMatchObject({
      marca: '',
      description: 'Tornillo',
      minPrice: 900,
    });
  });

  it('returns empty array when selected portfolio does not exist', () => {
    const selection: Suggestion = {
      portfolioId: 'P9',
      provider: 'NONE',
      description: 'Tornillo',
    };
    expect(compare(workbook, selection)).toEqual([]);
  });

  it('returns empty array when description does not match any row', () => {
    const selection: Suggestion = {
      portfolioId: 'P1',
      provider: 'GENEFIX',
      description: 'No existe',
    };
    expect(compare(workbook, selection)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { detectPortfolios } from '../../lib/excel';

describe('detectPortfolios', () => {
  it('detects two portfolios sorted by id with expected columns', () => {
    const headers = [
      'P1_GENEFIX_Descripcion',
      'P1_GENEFIX_MARCA',
      'P1_GENEFIX_PRECIO_BASE',
      'P2_LH_Descripcion',
      'P2_LH_PRECIO_LISTA_2026',
    ];

    const result = detectPortfolios(headers);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'P1',
      provider: 'GENEFIX',
      descCol: 'P1_GENEFIX_Descripcion',
      marcaCol: 'P1_GENEFIX_MARCA',
    });
    expect(result[0].priceCols).toHaveLength(1);

    expect(result[1]).toMatchObject({
      id: 'P2',
      provider: 'LH',
      descCol: 'P2_LH_Descripcion',
      marcaCol: null,
    });
    expect(result[1].priceCols).toHaveLength(1);
  });

  it('drops portfolios that do not include a description column', () => {
    const headers = ['P1_GENEFIX_PRECIO_BASE'];
    expect(detectPortfolios(headers)).toEqual([]);
  });

  it('ignores non-matching headers', () => {
    const headers = ['Descripción', 'Precio', 'P1_GENEFIX_Descripcion'];
    const result = detectPortfolios(headers);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('P1');
  });

  it('collects multiple price columns for the same portfolio', () => {
    const headers = [
      'P1_GENEFIX_Descripcion',
      'P1_GENEFIX_PRECIO_BASE',
      'P1_GENEFIX_PRECIO_LISTA',
    ];

    const result = detectPortfolios(headers);
    expect(result).toHaveLength(1);
    expect(result[0].priceCols).toHaveLength(2);
  });

  it('supports provider names with underscores', () => {
    const result = detectPortfolios(['P1_SAN_MARTIN_Descripcion']);
    expect(result).toHaveLength(1);
    expect(result[0].provider).toBe('SAN_MARTIN');
  });

  it('groups all columns for a multi-word provider in one portfolio', () => {
    const headers = [
      'P1_SAN_MARTIN_Descripcion',
      'P1_SAN_MARTIN_MARCA',
      'P1_SAN_MARTIN_PRECIO_BASE',
    ];

    const result = detectPortfolios(headers);
    expect(result).toHaveLength(1);
    const [portfolio] = result;
    expect(portfolio.provider).toBe('SAN_MARTIN');
    expect(portfolio.descCol).toBe('P1_SAN_MARTIN_Descripcion');
    expect(portfolio.marcaCol).toBe('P1_SAN_MARTIN_MARCA');
    expect(portfolio.priceCols).toHaveLength(1);
    expect(portfolio.priceCols[0].label).toBe('Precio Base');
  });

  it('keeps single-word providers unchanged', () => {
    const result = detectPortfolios(['P2_LH_Descripcion']);
    expect(result).toHaveLength(1);
    expect(result[0].provider).toBe('LH');
  });

  it('parses repeated provider names in price columns', () => {
    const result = detectPortfolios([
      'P1_GENEFIX_Descripcion',
      'P1_GENEFIX_PRECIO_BASE_GENEFIX',
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].priceCols).toHaveLength(1);
    expect(result[0].priceCols[0].label).toBe('Precio Base Genefix');
  });

  it('ignores headers without known field markers', () => {
    const result = detectPortfolios(['P1_GENEFIX_Codigo']);
    expect(result).toEqual([]);
  });
});

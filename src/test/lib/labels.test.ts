import { describe, expect, it } from 'vitest';
import { priceLabel, providerLabel } from '../../lib/labels';

describe('priceLabel', () => {
  it('converts common column keys to human labels', () => {
    expect(priceLabel('P1_GENEFIX_PRECIO_BASE_GENEFIX', 'P1', 'GENEFIX')).toBe(
      'Precio Base Genefix',
    );
    expect(priceLabel('P2_LH_PRECIO_LISTA_2026', 'P2', 'LH')).toBe('Precio Lista 2026');
    expect(priceLabel('P1_GENEFIX_PRECIO_FACTURA_NC_25', 'P1', 'GENEFIX')).toBe(
      'Precio Factura Nc 25',
    );
  });
});

describe('providerLabel', () => {
  it('title-cases provider names', () => {
    expect(providerLabel('GENEFIX')).toBe('Genefix');
    expect(providerLabel('SAN_MARTIN')).toBe('San Martin');
  });
});

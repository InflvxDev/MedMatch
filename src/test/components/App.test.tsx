import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../components/App';
import type { ParsedWorkbook } from '../../lib/types';

vi.mock('../../lib/storage', () => ({
  loadWorkbook: vi.fn().mockResolvedValue(null),
  saveWorkbook: vi.fn().mockResolvedValue(undefined),
  clearWorkbook: vi.fn().mockResolvedValue(undefined),
}));


import { loadWorkbook } from '../../lib/storage';

describe('App', () => {
  it('shows uploader when no persisted workbook exists', async () => {
    vi.mocked(loadWorkbook).mockResolvedValueOnce(null);

    render(<App />);

    expect(await screen.findByText(/Sube tu archivo Excel/i)).toBeInTheDocument();
  });

  it('shows instrument bar when persisted workbook exists', async () => {
    const workbook: ParsedWorkbook = {
      fileName: 'persistido.xlsx',
      parsedAt: Date.now(),
      portfolios: [
        {
          id: 'P1',
          provider: 'GENEFIX',
          descCol: 'P1_GENEFIX_Descripcion',
          marcaCol: null,
          priceCols: [{ key: 'P1_GENEFIX_PRECIO_BASE', label: 'Precio Base' }],
        },
      ],
      rows: [{ P1_GENEFIX_Descripcion: 'Tornillo', P1_GENEFIX_PRECIO_BASE: 1000 }],
    };
    vi.mocked(loadWorkbook).mockResolvedValueOnce(workbook);

    render(<App />);

    expect(await screen.findByText('persistido.xlsx')).toBeInTheDocument();
    expect(await screen.findByText(/Reemplazar Excel/i)).toBeInTheDocument();
  });
});

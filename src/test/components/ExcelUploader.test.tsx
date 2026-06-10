import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ExcelUploader from '../../components/ExcelUploader';
import type { ParsedWorkbook } from '../../lib/types';

vi.mock('../../lib/excel', async () => {
  class MockExcelParseError extends Error {}
  return {
    ExcelParseError: MockExcelParseError,
    parseWorkbook: vi.fn(),
    buildTemplateWorkbook: vi.fn(),
  };
});

import { parseWorkbook, ExcelParseError } from '../../lib/excel';

describe('ExcelUploader', () => {
  it('shows parse error message when parsing fails with ExcelParseError', async () => {
    const user = userEvent.setup();
    const onLoaded = vi.fn();
    vi.mocked(parseWorkbook).mockRejectedValue(new ExcelParseError('boom'));

    const { container } = render(<ExcelUploader onLoaded={onLoaded} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(input, file);

    expect(await screen.findByText('boom')).toBeInTheDocument();
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it('calls onLoaded when parse succeeds', async () => {
    const user = userEvent.setup();
    const onLoaded = vi.fn();
    const workbook: ParsedWorkbook = {
      fileName: 'test.xlsx',
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
    vi.mocked(parseWorkbook).mockResolvedValue(workbook);

    const { container } = render(<ExcelUploader onLoaded={onLoaded} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(input, file);

    expect(onLoaded).toHaveBeenCalledWith(workbook);
  });
});

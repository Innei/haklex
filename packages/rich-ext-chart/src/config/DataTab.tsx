import { X } from 'lucide-react';

import type { ChartValue } from '../types';
import { CHART_PALETTE_SIZE } from '../types';
import type { ChartTabProps } from './ChartConfigPanel';
import { CommitInput } from './CommitInput';
import * as s from './config.css';
import { addRow, addSeries, removeRow, renameField, setCell } from './spec-edit';

const cellText = (value: ChartValue | undefined) => (value == null ? '' : String(value));

export function DataTab({ draft, onChange }: ChartTabProps) {
  const x = draft.x ?? '';
  const columns = [x, ...draft.series.map((series) => series.key)];

  return (
    <>
      <div className={s.tableScroll}>
        <table className={s.table}>
          <thead>
            <tr>
              {columns.map((key) => (
                <th key={key} scope="col">
                  <CommitInput
                    aria-label={`Rename ${key}`}
                    className={`${s.cell} ${s.headCell}`}
                    value={key}
                    onCommit={(name) => onChange(renameField(draft, key, name))}
                  />
                </th>
              ))}
              <th aria-label="Row actions" scope="col" />
            </tr>
          </thead>
          <tbody>
            {draft.data.map((row, index) => (
              <tr key={index}>
                {columns.map((key) => (
                  <td key={key}>
                    <CommitInput
                      aria-label={`Row ${index + 1} ${key}`}
                      className={key === x ? s.cell : `${s.cell} ${s.cellNumber}`}
                      inputMode={key === x ? undefined : 'decimal'}
                      value={cellText(row[key])}
                      onCommit={(raw) => onChange(setCell(draft, index, key, raw))}
                    />
                  </td>
                ))}
                <td>
                  <button
                    aria-label={`Remove row ${index + 1}`}
                    className={s.iconButton}
                    type="button"
                    onClick={() => onChange(removeRow(draft, index))}
                  >
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.actions}>
        <button className={s.addButton} type="button" onClick={() => onChange(addRow(draft))}>
          Add row
        </button>
        <button
          className={s.addButton}
          disabled={draft.series.length >= CHART_PALETTE_SIZE}
          type="button"
          onClick={() => onChange(addSeries(draft))}
        >
          Add series
        </button>
      </div>
    </>
  );
}

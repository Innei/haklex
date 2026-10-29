import { ActionButton } from '@haklex/rich-editor-ui';
import { Plus, X } from 'lucide-react';

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
                    plain
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
                      plain
                      aria-label={`Row ${index + 1} ${key}`}
                      className={key === x ? s.cell : `${s.cell} ${s.cellNumber}`}
                      inputMode={key === x ? undefined : 'decimal'}
                      value={cellText(row[key])}
                      onCommit={(raw) => onChange(setCell(draft, index, key, raw))}
                    />
                  </td>
                ))}
                <td>
                  <ActionButton
                    icon
                    aria-label={`Remove row ${index + 1}`}
                    size="sm"
                    onClick={() => onChange(removeRow(draft, index))}
                  >
                    <X />
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.actions}>
        <ActionButton size="md" variant="outline" onClick={() => onChange(addRow(draft))}>
          <Plus />
          Add row
        </ActionButton>
        <ActionButton
          disabled={draft.series.length >= CHART_PALETTE_SIZE}
          size="md"
          variant="outline"
          onClick={() => onChange(addSeries(draft))}
        >
          <Plus />
          Add series
        </ActionButton>
      </div>
    </>
  );
}

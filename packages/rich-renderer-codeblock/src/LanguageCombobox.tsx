import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@haklex/rich-editor-ui';
import { useCallback, useMemo, useState } from 'react';
import { bundledLanguagesInfo } from 'shiki/bundle/full';

import { normalizeLanguage } from './constants';
import { hasLanguageIcon, LanguageIcon } from './icons';
import * as styles from './styles.css';

const languageItems = bundledLanguagesInfo.map((info) => ({
  id: info.id,
  name: info.name,
}));

interface LanguageComboboxProps {
  language: string;
  onLanguageChange?: (language: string) => void;
}

export function LanguageCombobox({ language, onLanguageChange }: LanguageComboboxProps) {
  const normalizedLanguage = normalizeLanguage(language);
  const [query, setQuery] = useState('');

  const handleValueChange = useCallback(
    (value: (typeof languageItems)[number] | null) => {
      if (value) {
        onLanguageChange?.(value.id);
      }
    },
    [onLanguageChange],
  );

  const selectedValue = useMemo(() => {
    const found = languageItems.find((item) => item.id === normalizedLanguage);
    if (found) return found;
    if (normalizedLanguage === 'text') return null;
    return { id: normalizedLanguage, name: normalizedLanguage };
  }, [normalizedLanguage]);

  const items = useMemo(() => {
    const all =
      selectedValue && !languageItems.some((item) => item.id === selectedValue.id)
        ? [...languageItems, selectedValue]
        : languageItems;
    const q = query.trim().toLowerCase();
    if (!q || all.some((item) => item.id === q)) return all;
    return [...all, { id: q, name: `Use "${q}"` }];
  }, [query, selectedValue]);

  return (
    <div className={`${styles.lang} ${styles.semanticClassNames.lang}`}>
      {hasLanguageIcon(normalizedLanguage) && (
        <LanguageIcon language={normalizedLanguage} size={14} />
      )}
      <Combobox
        autoHighlight
        itemToStringLabel={(item) => item.id}
        itemToStringValue={(item) => item.id}
        items={items}
        value={selectedValue}
        onInputValueChange={(value) => setQuery(value)}
        onValueChange={handleValueChange}
      >
        <ComboboxInput
          className={styles.langInput}
          placeholder="language"
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        />
        <ComboboxContent align="end" side="top" sideOffset={8}>
          <ComboboxEmpty>No languages found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.id} value={item}>
                <LanguageIcon language={item.id} size={16} />
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

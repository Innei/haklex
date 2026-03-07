import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@haklex/rich-editor-ui';
import { useCallback, useMemo } from 'react';
import { bundledLanguagesInfo } from 'shiki/bundle/web';

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

  const handleValueChange = useCallback(
    (value: (typeof languageItems)[number] | null) => {
      if (value) {
        onLanguageChange?.(value.id);
      }
    },
    [onLanguageChange],
  );

  const selectedValue = useMemo(
    () => languageItems.find((item) => item.id === normalizedLanguage) ?? null,
    [normalizedLanguage],
  );

  return (
    <div className={`${styles.lang} ${styles.semanticClassNames.lang}`}>
      {hasLanguageIcon(normalizedLanguage) && (
        <LanguageIcon language={normalizedLanguage} size={14} />
      )}
      <Combobox
        itemToStringLabel={(item) => item.id}
        itemToStringValue={(item) => item.id}
        items={languageItems}
        value={selectedValue}
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

import * as React from 'react';

export type PortalTheme = 'light' | 'dark';

type PortalThemeContextType = {
  className: string;
  theme: PortalTheme;
};

const PortalThemeContext = React.createContext<PortalThemeContextType>({
  className: '',
  theme: 'light',
});

const PortalContainerContext = React.createContext<Element | null>(null);
export const PortalContainerProvider = PortalContainerContext.Provider;

export function usePortalContainer(): Element {
  return React.useContext(PortalContainerContext) ?? document.body;
}

export function PortalThemeProvider({
  className,
  theme,
  children,
}: {
  className: string;
  theme: PortalTheme;
  children?: React.ReactNode;
}) {
  return (
    <PortalThemeContext.Provider
      value={React.useMemo(() => ({ className, theme }), [className, theme])}
    >
      {children}
    </PortalThemeContext.Provider>
  );
}

export function usePortalTheme() {
  return React.useContext(PortalThemeContext);
}

export function PortalThemeWrapper({ children }: { children: React.ReactNode }) {
  const { className, theme } = usePortalTheme();
  if (!className) return children;
  return (
    <div
      suppressHydrationWarning
      className={className}
      data-theme={theme}
      style={{ display: 'contents' }}
    >
      {children}
    </div>
  );
}

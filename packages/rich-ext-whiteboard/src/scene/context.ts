import { createContext } from 'react';

export const SceneDarkContext = createContext<{ filterId: string } | null>(null);

export const SceneHandFontContext = createContext<string | null>(null);

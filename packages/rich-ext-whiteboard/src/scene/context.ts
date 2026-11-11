import { createContext } from 'react';

export const SceneDarkContext = createContext<{ filterId: string } | null>(null);

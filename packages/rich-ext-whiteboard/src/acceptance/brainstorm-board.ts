import {
  newElement,
  newFreedrawElement,
  newLinearElement,
  newRichTextElement,
  newSvgElement,
  newTextElement,
} from '../model/create';
import type { RichTextContent } from '../model/richtext';
import type { ExcalidrawElement, ExcalidrawScene } from '../scene/types';

const CLEAN = { roughness: 0, seed: 7 };
const INK = '#3d3d3d';

const card = (title: string, who: string): RichTextContent => ({
  root: {
    type: 'root',
    children: [
      { type: 'heading', tag: 'h3', children: [{ type: 'text', text: title }] },
      { type: 'paragraph', children: [{ type: 'text', text: who, style: 'color: #6b6b6b' }] },
    ],
  },
});

const BOTTLE_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 100">',
  '<rect x="18" y="2" width="12" height="10" rx="2" fill="#3d3d3d"/>',
  '<path d="M19 12h10v14c0 4 9 8 9 18v46a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V44c0-10 9-14 9-18z" fill="#d9480f" stroke="#3d3d3d" stroke-width="2"/>',
  '<circle cx="24" cy="66" r="11" fill="#fff4e6" stroke="#3d3d3d" stroke-width="1.5"/>',
  '<path d="M24 58c4 5 5 8 2 12-1-3-3-4-4-4 0 3-2 4-2 7-3-4-1-9 4-15z" fill="#f76707"/>',
  '</svg>',
].join('');

const DAYS = ['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20'];
const COLUMN = 168;
const LEFT = 60;

const dayX = (i: number) => LEFT + 40 + i * COLUMN;

const timeline: ExcalidrawElement[] = [
  newLinearElement('line', {
    id: 'timeline',
    x: LEFT,
    y: 238,
    width: 820,
    points: [
      [0, 0],
      [820, 0],
    ],
    strokeColor: INK,
    strokeWidth: 2,
    ...CLEAN,
  }),
  ...DAYS.flatMap((day, i) => [
    newTextElement({
      id: `day-${i}`,
      text: day,
      originalText: day,
      x: dayX(i) - 36,
      y: 196,
      width: 72,
      height: 23,
      fontFamily: 2,
      fontSize: 20,
      textAlign: 'center',
      strokeColor: INK,
      ...CLEAN,
    }),
    newElement('ellipse', {
      id: `dot-${i}`,
      x: dayX(i) - 6,
      y: 232,
      width: 12,
      height: 12,
      strokeColor: INK,
      backgroundColor: '#ffffff',
      fillStyle: 'solid',
      strokeWidth: 2,
      ...CLEAN,
    }),
  ]),
];

const CARDS: Array<[string, string, string, number, number]> = [
  ['card-brew', 'Brew', 'Mila', 0, 0],
  ['card-taste', 'Taste test', 'All of us', 1, 0],
  ['card-labels', 'Labels', 'Theo', 2, 0],
  ['card-launch', 'Launch', 'All of us', 4, 0],
  ['card-milk', 'Buy milk', 'Dan', 0, 1],
];
const CARD_COLORS: Record<string, string> = {
  'card-brew': '#f3c4d8',
  'card-taste': '#d9cff5',
  'card-labels': '#c5dcf7',
  'card-launch': '#f7e48f',
  'card-milk': '#cfe8c7',
};

const cards = CARDS.map(([id, title, who, column, row]) =>
  newRichTextElement({
    id,
    x: dayX(column) - 75,
    y: 280 + row * 120,
    width: 150,
    height: 96,
    backgroundColor: CARD_COLORS[id],
    shadow: true,
    content: card(title, who),
    seed: 7,
  }),
);

export const BRAINSTORM_BOARD: ExcalidrawScene = {
  type: 'excalidraw',
  version: 2,
  source: 'haklex-acceptance',
  appState: { viewBackgroundColor: '#ffffff', gridSize: 20 },
  elements: [
    newTextElement({
      id: 'title',
      text: 'A very hot hot sauce',
      originalText: 'A very hot hot sauce',
      x: 60,
      y: 40,
      width: 470,
      height: 51,
      fontFamily: 2,
      fontSize: 44,
      strokeColor: '#1e1e1e',
      ...CLEAN,
    }),
    newFreedrawElement({
      id: 'underline',
      x: 60,
      y: 104,
      width: 470,
      height: 8,
      points: [
        [0, 4],
        [120, 6],
        [240, 3],
        [360, 6],
        [470, 2],
      ],
      pressures: [],
      simulatePressure: true,
      strokeColor: '#d9774f',
      strokeWidth: 2,
      ...CLEAN,
    }),
    newSvgElement({
      id: 'bottle',
      x: 820,
      y: 30,
      width: 48,
      height: 100,
      angle: 0.15,
      svg: BOTTLE_SVG,
    }),
    newElement('rectangle', {
      id: 'area',
      x: LEFT - 30,
      y: 176,
      width: 880,
      height: 340,
      strokeColor: '#b9dfb0',
      backgroundColor: '#f2f9ee',
      fillStyle: 'solid',
      strokeWidth: 1,
      roundness: { type: 3 },
      ...CLEAN,
    }),
    ...timeline,
    ...cards,
    newRichTextElement({
      id: 'card-blank',
      x: dayX(1) - 50,
      y: 412,
      width: 150,
      height: 90,
      angle: -0.06,
      backgroundColor: '#f6f2cf',
      content: { root: { type: 'root', children: [] } },
      seed: 7,
    }),
  ],
};

type Json = Record<string, unknown>;

let seed = 100;

function el(type: string, id: string, extra: Json): Json {
  return {
    id,
    type,
    x: 0,
    y: 0,
    width: 100,
    height: 60,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: `a${seed % 10}`,
    roundness: null,
    seed: seed++,
    version: 4,
    versionNonce: seed++,
    isDeleted: false,
    boundElements: null,
    updated: 1_731_000_000_000,
    link: null,
    locked: false,
    ...extra,
  };
}

function text(id: string, extra: Json): Json {
  return el('text', id, {
    text: 'Label',
    originalText: 'Label',
    fontSize: 20,
    fontFamily: 5,
    textAlign: 'left',
    verticalAlign: 'top',
    containerId: null,
    autoResize: true,
    lineHeight: 1.25,
    height: 25,
    ...extra,
  });
}

function arrow(id: string, extra: Json): Json {
  return el('arrow', id, {
    points: [
      [0, 0],
      [120, 0],
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: 'arrow',
    elbowed: false,
    roundness: { type: 2 },
    ...extra,
  });
}

function box(id: string, x: number, y: number, label: string, extra: Json = {}): Json[] {
  const tid = `${id}-label`;
  return [
    el('rectangle', id, {
      x,
      y,
      width: 140,
      height: 60,
      backgroundColor: '#a5d8ff',
      roundness: { type: 3 },
      boundElements: [{ id: tid, type: 'text' }],
      ...extra,
    }),
    text(tid, {
      x: x + 10,
      y: y + 18,
      width: 120,
      text: label,
      originalText: label,
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: id,
    }),
  ];
}

const architecture: Json = {
  elements: [
    ...box('client', 30, 100, 'Client'),
    ...box('gateway', 260, 100, 'API Gateway'),
    ...box('users', 500, 20, 'User Service'),
    arrow('a1', {
      x: 175,
      y: 130,
      points: [
        [0, 0],
        [80, 0],
      ],
      startBinding: { elementId: 'client', focus: 0, gap: 5, fixedPoint: null },
      endBinding: { elementId: 'gateway', focus: 0, gap: 5, fixedPoint: null },
    }),
    arrow('a2', {
      x: 405,
      y: 130,
      points: [
        [0, 0],
        [90, -80],
      ],
      startBinding: { elementId: 'gateway', focus: 0.2, gap: 5 },
      endBinding: { elementId: 'users', focus: -0.1, gap: 5 },
    }),
  ],
  appState: { viewBackgroundColor: '#ffffff' },
};

const minimalLegacy: Json = {
  elements: [
    {
      id: 'rect1',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 120,
      strokeColor: '#1e1e1e',
      backgroundColor: '#a5d8ff',
      fillStyle: 'hachure',
      strokeWidth: 1,
      roughness: 1,
      opacity: 100,
      angle: 0,
      seed: 1,
      version: 1,
      isDeleted: false,
    },
    { id: 'text1', type: 'text', x: 120, y: 140, width: 80, height: 25, text: 'Hello' },
  ],
};

const excalidrawComExport: Json = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements: [
    el('ellipse', 'e1', { x: 40, y: 40, width: 120, height: 80, backgroundColor: '#ffec99' }),
    el('diamond', 'd1', { x: 220, y: 30, width: 100, height: 100, fillStyle: 'cross-hatch' }),
  ],
  appState: {
    gridSize: 20,
    gridStep: 5,
    gridModeEnabled: false,
    viewBackgroundColor: '#f8f9fa',
    currentItemFontFamily: 5,
    lockedMultiSelections: {},
  },
  files: {},
};

const elbow: Json = {
  elements: [
    el('rectangle', 'from', { x: 0, y: 0, boundElements: [{ id: 'elbow', type: 'arrow' }] }),
    el('rectangle', 'to', { x: 300, y: 200, boundElements: [{ id: 'elbow', type: 'arrow' }] }),
    arrow('elbow', {
      x: 105,
      y: 30,
      width: 190,
      height: 200,
      elbowed: true,
      roundness: null,
      points: [
        [0, 0],
        [95, 0],
        [95, 200],
        [190, 200],
      ],
      fixedSegments: [{ index: 2, start: [95, 0], end: [95, 200] }],
      startIsSpecial: false,
      endIsSpecial: false,
      startBinding: { elementId: 'from', focus: 0, gap: 5, fixedPoint: [1.0001, 0.5001] },
      endBinding: { elementId: 'to', focus: 0, gap: 5, fixedPoint: [-0.0001, 0.5001] },
    }),
  ],
};

const arrowLabel: Json = {
  elements: [
    arrow('labelled', {
      x: 10,
      y: 50,
      width: 200,
      points: [
        [0, 0],
        [200, 0],
      ],
      boundElements: [{ id: 'arrow-text', type: 'text' }],
    }),
    text('arrow-text', {
      x: 80,
      y: 38,
      width: 60,
      text: 'calls',
      originalText: 'calls',
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: 'labelled',
    }),
  ],
};

const groupsAndMeta: Json = {
  elements: [
    el('rectangle', 'g1', { groupIds: ['inner', 'outer'], customData: { owner: 'mx' } }),
    el('ellipse', 'g2', { x: 120, groupIds: ['inner', 'outer'], link: 'https://innei.in' }),
    el('diamond', 'g3', { x: 260, groupIds: ['outer'], locked: true }),
  ],
  appState: { viewBackgroundColor: 'transparent', gridSize: null },
};

const images: Json = {
  elements: [
    el('image', 'img1', {
      width: 300,
      height: 200,
      fileId: 'file-a',
      status: 'saved',
      scale: [1, 1],
      crop: { x: 10, y: 10, width: 200, height: 120, naturalWidth: 600, naturalHeight: 400 },
    }),
    el('image', 'img2', {
      x: 320,
      width: 120,
      height: 120,
      fileId: 'file-b',
      status: 'saved',
      scale: [-1, 1],
      crop: null,
    }),
  ],
  files: {
    'file-a': {
      id: 'file-a',
      mimeType: 'image/png',
      dataURL: 'data:image/png;base64,iVBORw0KGgo=',
      created: 1_731_000_000_000,
      lastRetrieved: 1_731_000_000_500,
    },
    'file-b': {
      id: 'file-b',
      mimeType: 'image/jpeg',
      dataURL: 'https://cdn.example.com/b.jpg',
      created: 1_731_000_000_001,
    },
    'file-unused': {
      id: 'file-unused',
      mimeType: 'image/png',
      dataURL: 'data:image/png;base64,AAAA',
      created: 1,
    },
  },
};

const frames: Json = {
  elements: [
    el('frame', 'frame-1', { x: 0, y: 0, width: 400, height: 300, name: 'Flow' }),
    el('rectangle', 'child-1', { x: 20, y: 40, frameId: 'frame-1' }),
    el('ellipse', 'child-2', { x: 200, y: 120, frameId: 'frame-1' }),
    el('magicframe', 'magic-1', { x: 500, y: 0, width: 300, height: 200, name: null }),
  ],
};

const embeds: Json = {
  elements: [
    el('embeddable', 'yt', {
      width: 560,
      height: 315,
      link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      validated: true,
    }),
    el('iframe', 'raw', { x: 600, width: 300, height: 200, customData: { generationData: 1 } }),
  ],
};

const freedraw: Json = {
  elements: [
    el('freedraw', 'ink', {
      width: 80,
      height: 40,
      points: [
        [0, 0],
        [20, 10],
        [50, 35],
        [80, 40],
      ],
      pressures: [0.2, 0.5, 0.7, 0.4],
      simulatePressure: false,
      lastCommittedPoint: [80, 40],
    }),
  ],
};

const deletedAndFuture: Json = {
  elements: [
    el('rectangle', 'alive', {}),
    el('rectangle', 'gone', { isDeleted: true }),
    el('laser-pointer-trail', 'future', { futureProp: { nested: [1, 2, 3] } }),
    text('gone-text', { isDeleted: true }),
  ],
  appState: { viewBackgroundColor: '#fff', theme: 'dark', zoom: { value: 1.5 } },
  libraryItems: [],
};

const textVariety: Json = {
  elements: [
    text('cjk', { text: '你好，白板\n第二行', originalText: '你好，白板\n第二行', height: 50 }),
    text('sans', { y: 80, fontFamily: 6, angle: Math.PI / 6 }),
    text('mono', { y: 160, fontFamily: 8, textAlign: 'right' }),
    text('legacy-virgil', { y: 240, fontFamily: 1, lineHeight: 1.2 }),
  ],
};

const empty: Json = { elements: [] };

export const ROUND_TRIP_FIXTURES: Record<string, Json> = {
  architecture,
  minimalLegacy,
  excalidrawComExport,
  elbow,
  arrowLabel,
  groupsAndMeta,
  images,
  frames,
  embeds,
  freedraw,
  deletedAndFuture,
  textVariety,
  empty,
};

export function withoutDeleted(scene: Json): Json {
  const elements = (scene.elements as Json[] | undefined) ?? [];
  return { ...scene, elements: elements.filter((item) => !item.isDeleted) };
}

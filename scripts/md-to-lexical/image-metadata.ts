import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';

import type { LNode } from './types.js';

interface ImageMeta {
  accent: string;
  height: number;
  thumbhash: string;
  width: number;
}

const cache = new Map<string, ImageMeta | null>();

async function fetchImageBuffer(src: string): Promise<Buffer | null> {
  try {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const res = await fetch(src, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    }
    // Local file
    const { readFileSync } = await import('node:fs');
    return readFileSync(src);
  } catch {
    return null;
  }
}

async function computeMeta(src: string): Promise<ImageMeta | null> {
  if (cache.has(src)) return cache.get(src)!;

  const buf = await fetchImageBuffer(src);
  if (!buf) {
    cache.set(src, null);
    return null;
  }

  try {
    const img = sharp(buf);
    const metadata = await img.metadata();
    const width = metadata.width!;
    const height = metadata.height!;

    // Resize to small dimensions for thumbhash (max 100px)
    const thumbSize = 100;
    const { data, info } = await img
      .resize(thumbSize, thumbSize, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const thumbhash = Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString(
      'base64',
    );

    // Dominant color via sharp stats
    const stats = await sharp(buf).resize(1, 1).raw().toBuffer();
    const accent = `#${stats[0].toString(16).padStart(2, '0')}${stats[1].toString(16).padStart(2, '0')}${stats[2].toString(16).padStart(2, '0')}`;

    const meta: ImageMeta = { width, height, thumbhash, accent };
    cache.set(src, meta);
    return meta;
  } catch {
    cache.set(src, null);
    return null;
  }
}

function collectImageNodes(node: any, result: any[]): void {
  if (node.type === 'image' && node.src) {
    result.push(node);
  }
  if (node.children) {
    for (const child of node.children) {
      collectImageNodes(child, result);
    }
  }
  // Gallery images stored in an `images` array
  if (node.images && Array.isArray(node.images)) {
    for (const img of node.images) {
      if (img.src) result.push(img);
    }
  }
}

export async function enrichImages(root: LNode): Promise<void> {
  const imageNodes: any[] = [];
  collectImageNodes(root, imageNodes);

  if (imageNodes.length === 0) return;

  const uniqueSrcs = [...new Set(imageNodes.map((n) => n.src as string))];
  process.stderr.write(`Fetching metadata for ${uniqueSrcs.length} images...\n`);

  // Fetch in parallel with concurrency limit
  const concurrency = 5;
  for (let i = 0; i < uniqueSrcs.length; i += concurrency) {
    const batch = uniqueSrcs.slice(i, i + concurrency);
    await Promise.all(batch.map((src) => computeMeta(src)));
    process.stderr.write(
      `  ${Math.min(i + concurrency, uniqueSrcs.length)}/${uniqueSrcs.length}\n`,
    );
  }

  // Apply metadata to all image nodes
  for (const node of imageNodes) {
    const meta = cache.get(node.src);
    if (meta) {
      node.width = meta.width;
      node.height = meta.height;
      node.thumbhash = meta.thumbhash;
      node.accent = meta.accent;
    }
  }
}

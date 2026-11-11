const ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

export function randomId(size = 21): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = '';
  for (const byte of bytes) id += ALPHABET[byte & 63];
  return id;
}

export function randomInteger(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

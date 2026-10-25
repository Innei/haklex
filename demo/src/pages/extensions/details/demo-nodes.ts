function demoTextNode(text: string, format = 0) {
  return {
    type: 'text',
    text,
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    version: 1,
  };
}

export function demoParagraph(text: string, blockId: string) {
  return {
    type: 'paragraph',
    children: [demoTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
    $: { blockId },
  };
}

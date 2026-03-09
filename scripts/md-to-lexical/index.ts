#!/usr/bin/env node

import { readFileSync } from 'node:fs'

import { markdownToLexical } from './convert.js'
import { enrichImages } from './image-metadata.js'
import { parseMarkdown } from './parse.js'
import { preprocess } from './preprocess.js'

async function main() {
  const args = process.argv.slice(2)
  const noImages = args.includes('--no-images')
  const filteredArgs = args.filter((a) => !a.startsWith('--'))

  let markdown: string

  if (filteredArgs.length > 0 && filteredArgs[0] !== '-') {
    const filePath = filteredArgs[0]
    markdown = readFileSync(filePath, 'utf-8')
  } else {
    markdown = readFileSync(0, 'utf-8')
  }

  // Phase 1: Pre-process custom block syntax
  const pre = preprocess(markdown)

  // Phase 2: Parse with remark
  const mdast = parseMarkdown(pre.processed)

  // Phase 3: Convert to Lexical JSON
  const editorState = markdownToLexical(mdast, pre)

  // Phase 4: Enrich images with dimensions + thumbhash
  if (!noImages) {
    await enrichImages(editorState.root)
  }

  // Output
  const output = JSON.stringify(editorState, null, 2)
  process.stdout.write(output + '\n')
}

main()

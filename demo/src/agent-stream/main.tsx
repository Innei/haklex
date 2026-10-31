import 'modern-normalize/modern-normalize.css';
import '@haklex/rich-editor/style.css';
import '@haklex/rich-renderer-image/style.css';
import '../styles/base.css';
import '../styles/workbench.css';
import './style.css';

import { RichEditor } from '@haklex/rich-editor';
import { $createImageNode } from '@haklex/rich-editor/nodes';
import {
  AgentStreamPlugin,
  playAgentWrite,
  type PlaybackState,
} from '@haklex/rich-plugin-agent-stream';
import { ImageRenderer } from '@haklex/rich-renderer-image/static';
import { $createHeadingNode } from '@lexical/rich-text';
import type { LexicalEditor } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot, $isElementNode } from 'lexical';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { InspectorSection, OptionButton } from '../components/workbench/Inspector';
import { Workbench } from '../components/workbench/Workbench';
import landscape from '../poc-virtualization/assets/landscape.jpg';
import { AGENT_PARAGRAPHS, INITIAL_STATE, REWRITE } from './samples';

const renderers = { Image: ImageRenderer };

const paragraph = (text: string) => $createParagraphNode().append($createTextNode(text));

const writes: { label: string; run: (editor: LexicalEditor) => void }[] = [
  {
    label: '续写：标题 + 两段',
    run: (editor) =>
      playAgentWrite(editor, () => {
        $getRoot().append(
          $createHeadingNode('h2').append($createTextNode('为什么要把动画和数据分开')),
          paragraph(AGENT_PARAGRAPHS[0]!),
          paragraph(AGENT_PARAGRAPHS[1]!),
        );
      }),
  },
  {
    label: '改写第二段的后半句',
    run: (editor) =>
      playAgentWrite(editor, () => {
        const target = $getRoot().getChildAtIndex(2);
        if ($isElementNode(target)) target.clear().append($createTextNode(REWRITE));
      }),
  },
  {
    label: '段落 + 图片 + 段落',
    run: (editor) =>
      playAgentWrite(editor, () => {
        $getRoot().append(
          paragraph(AGENT_PARAGRAPHS[2]!),
          $createImageNode({ src: landscape, altText: '示意图', width: 1600, height: 1067 }),
          paragraph(AGENT_PARAGRAPHS[3]!),
        );
      }),
  },
  {
    label: '连发三次（每 300ms 一次）',
    run: (editor) => {
      AGENT_PARAGRAPHS.slice(4, 7).forEach((text, i) =>
        setTimeout(
          () => playAgentWrite(editor, () => void $getRoot().append(paragraph(text))),
          i * 300,
        ),
      );
    },
  },
];

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [speed, setSpeed] = useState(80);
  const [agentName, setAgentName] = useState('AI');
  const [resetKey, setResetKey] = useState(0);
  const [playback, setPlayback] = useState<PlaybackState>({ playing: false, blockKey: null });
  const editorRef = useRef<LexicalEditor | null>(null);
  const scroll = useRef<HTMLDivElement>(null);

  return (
    <main className="app agent-stream-app" data-theme={theme}>
      <Workbench
        panelLabel="Agent 流式显示控制"
        title="Agent 写入 · 流式显示"
        actions={
          <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            切换明暗
          </button>
        }
        panel={
          <>
            <div className="wb-panel-head">模拟 agent 写入</div>
            <InspectorSection title="写入">
              <div className="agent-stream-actions">
                {writes.map((w) => (
                  <button
                    className="btn"
                    key={w.label}
                    onClick={() => editorRef.current && w.run(editorRef.current)}
                  >
                    {w.label}
                  </button>
                ))}
                <button className="btn" onClick={() => setResetKey((k) => k + 1)}>
                  重置文档
                </button>
              </div>
              <p aria-live="polite" className="wb-section-text">
                {playback.playing ? `播放中 · block ${playback.blockKey}` : '空闲'}
              </p>
            </InspectorSection>
            <InspectorSection title="速度（字/秒）">
              <div className="opt-list">
                {[40, 80, 160].map((n) => (
                  <OptionButton key={n} selected={speed === n} onClick={() => setSpeed(n)}>
                    {n}
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
            <InspectorSection title="光标名">
              <div className="opt-list">
                {['AI', 'Claude'].map((n) => (
                  <OptionButton key={n} selected={agentName === n} onClick={() => setAgentName(n)}>
                    {n}
                  </OptionButton>
                ))}
              </div>
            </InspectorSection>
          </>
        }
      >
        <div className="agent-stream-viewport" ref={scroll}>
          <div className="agent-stream-column">
            <RichEditor
              initialValue={INITIAL_STATE}
              key={resetKey}
              rendererConfig={renderers}
              theme={theme}
              onEditorReady={(editor) => {
                editorRef.current = editor;
              }}
            >
              <AgentStreamPlugin
                agentName={agentName}
                charsPerSecond={speed}
                scrollContainer={scroll}
                onPlaybackChange={setPlayback}
              />
            </RichEditor>
          </div>
        </div>
      </Workbench>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

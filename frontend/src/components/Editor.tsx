import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditorStore } from '../store/useEditorStore';
import type { editor } from 'monaco-editor';

// Colors for remote users
const CURSOR_COLORS = [
  '#F97316', '#EC4899', '#14B8A6', '#A855F7', '#EAB308',
  '#06B6D4', '#EF4444', '#22C55E', '#3B82F6', '#F43F5E',
];

export const Editor = () => {
  const { text, insertText, deleteText, updateCursor, activeUsers, clientId } = useEditorStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const isRemoteUpdate = useRef(false);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    // Intercept cursor changes for Presence
    editorInstance.onDidChangeCursorPosition((e) => {
      if (isRemoteUpdate.current) return;
      const model = editorInstance.getModel();
      if (model) {
        const offset = model.getOffsetAt(e.position);
        updateCursor(offset);
      }
    });
  };

  const handleChange = (value: string | undefined, ev: editor.IModelContentChangedEvent) => {
    if (isRemoteUpdate.current) return;
    
    const changes = ev.changes;
    for (const change of changes) {
      if (change.text === '') {
        for (let i = 0; i < change.rangeLength; i++) {
          deleteText(change.rangeOffset);
        }
      } else {
        for (let i = 0; i < change.text.length; i++) {
          insertText(change.rangeOffset + i, change.text[i]);
        }
      }
    }
  };

  // Sync upstream CRDT state down to Monaco
  useEffect(() => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    if (model && model.getValue() !== text) {
      isRemoteUpdate.current = true;
      const pos = editorRef.current.getPosition();
      model.setValue(text);
      if (pos) editorRef.current.setPosition(pos);
      isRemoteUpdate.current = false;
    }
  }, [text]);

  // Render remote cursors as Monaco decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    const remoteUsers = activeUsers.filter(
      (u) => u.id !== clientId && u.cursorIndex !== undefined
    );

    const newDecorations: editor.IModelDeltaDecoration[] = remoteUsers.map((user, idx) => {
      const pos = model.getPositionAt(user.cursorIndex!);
      const color = CURSOR_COLORS[idx % CURSOR_COLORS.length];

      // Inject dynamic CSS for this user's cursor color
      const styleId = `cursor-style-${user.id}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        .remote-cursor-${idx} {
          background: ${color};
          width: 2px !important;
          margin-left: -1px;
        }
        .remote-cursor-label-${idx}::after {
          content: '${user.name}';
          position: absolute;
          top: -18px;
          left: 0;
          background: ${color};
          color: white;
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
        }
      `;

      return {
        range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
        options: {
          className: `remote-cursor-${idx}`,
          beforeContentClassName: `remote-cursor-label-${idx}`,
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      };
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [activeUsers, clientId]);

  return (
    <div className="w-full h-full flex-grow relative rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
      <MonacoEditor
        height="100%"
        language="typescript"
        theme="vs-dark"
        value={text}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Inter', monospace",
          wordWrap: 'on',
          padding: { top: 16 },
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
        }}
        onMount={handleEditorDidMount}
        onChange={handleChange}
      />
    </div>
  );
};

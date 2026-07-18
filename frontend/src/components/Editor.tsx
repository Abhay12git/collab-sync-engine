import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditorStore } from '../store/useEditorStore';
import type { editor } from 'monaco-editor';

export const Editor: React.FC = () => {
  const { text, insertText, deleteText, updateCursor } = useEditorStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isRemoteUpdate = useRef(false);

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;

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
    
    // Convert Monaco's changes into CRDT index operations
    const changes = ev.changes;
    for (const change of changes) {
      if (change.text === '') {
        // Deletion
        for (let i = 0; i < change.rangeLength; i++) {
          deleteText(change.rangeOffset);
        }
      } else {
        // Insertion
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
      
      if (pos) editorRef.current.setPosition(pos); // Restore local cursor
      isRemoteUpdate.current = false;
    }
  }, [text]);

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
          fontFamily: 'Inter, monospace',
          wordWrap: 'on',
          padding: { top: 16 },
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
        onMount={handleEditorDidMount}
        onChange={handleChange}
      />
    </div>
  );
};

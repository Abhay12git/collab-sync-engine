import React, { useEffect } from 'react';
import { useEditorStore } from './store/useEditorStore';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';

function App() {
  const { initConnection, disconnect } = useEditorStore();

  useEffect(() => {
    initConnection();
    return () => {
      disconnect();
    };
  }, [initConnection, disconnect]);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-brand-dark">
      <Toolbar />
      <main className="flex-grow p-6 flex flex-col">
        <Editor />
      </main>
    </div>
  );
}

export default App;

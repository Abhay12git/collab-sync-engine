import { useEffect, useRef } from 'react';
import { useEditorStore } from './store/useEditorStore';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';

function App() {
  const { initConnection, disconnect } = useEditorStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initConnection();
    }
    // Don't disconnect on StrictMode unmount — we want the socket to persist
  }, [initConnection]);

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

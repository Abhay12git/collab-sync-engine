import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store/useEditorStore';
import { Editor } from '../components/Editor';
import { Toolbar } from '../components/Toolbar';

export const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { initConnection, disconnect } = useEditorStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
      initConnection(id);
    }
    return () => {
      // Only disconnect when actually navigating away (not StrictMode)
    };
  }, [id, initConnection, navigate]);

  // Cleanup on unmount when navigating away
  useEffect(() => {
    return () => {
      disconnect();
      initialized.current = false;
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-brand-dark">
      <Toolbar documentId={id} />
      <main className="flex-grow p-6 flex flex-col">
        <Editor />
      </main>
    </div>
  );
};

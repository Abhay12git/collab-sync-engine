import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useEditorStore as useEditor } from '../store/useEditorStore';
import { Users, Code, Activity, ArrowLeft } from 'lucide-react';

interface ToolbarProps {
  documentId?: string;
}

export const Toolbar = ({ documentId }: ToolbarProps) => {
  const { connected, activeUsers } = useEditor();
  const navigate = useNavigate();

  return (
    <div className="w-full h-14 bg-brand-surface border-b border-gray-800 flex items-center justify-between px-6 shadow-md z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded bg-brand-dark/60 hover:bg-brand-dark flex items-center justify-center transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={16} className="text-gray-400" />
        </button>
        <div className="w-8 h-8 rounded bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
          <Code size={18} className="text-white" />
        </div>
        <h1 className="font-semibold text-lg tracking-tight text-white">Sync Engine</h1>
        {documentId && (
          <span className="text-xs text-gray-500 font-mono ml-2 hidden sm:inline">
            {documentId.slice(0, 8)}…
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-300">{activeUsers.length} Online</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Activity size={16} className={connected ? 'text-green-500' : 'text-red-500'} />
          <span className="text-sm font-medium text-gray-300">
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};

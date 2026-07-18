import { useEditorStore } from '../store/useEditorStore';
import { Users, Code, Activity } from 'lucide-react';

export const Toolbar: React.FC = () => {
  const { connected, activeUsers } = useEditorStore();

  return (
    <div className="w-full h-14 bg-brand-surface border-b border-gray-800 flex items-center justify-between px-6 shadow-md z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
          <Code size={18} className="text-white" />
        </div>
        <h1 className="font-semibold text-lg tracking-tight text-white">Sync Engine</h1>
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

import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store/useEditorStore';
import { Users, Code, Activity, ArrowLeft } from 'lucide-react';

const AVATAR_COLORS = [
  '#F97316', '#EC4899', '#14B8A6', '#A855F7', '#EAB308',
  '#06B6D4', '#EF4444', '#22C55E', '#3B82F6', '#F43F5E',
];

interface ToolbarProps {
  documentId?: string;
}

export const Toolbar = ({ documentId }: ToolbarProps) => {
  const { connected, activeUsers, clientId } = useEditorStore();
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
      </div>

      <div className="flex items-center gap-6">
        {/* User avatars */}
        <div className="flex items-center -space-x-2">
          {activeUsers.map((user, idx) => (
            <div
              key={user.id}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-brand-surface"
              style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
              title={user.id === clientId ? `${user.name} (you)` : user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>

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

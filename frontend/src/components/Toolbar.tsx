import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorStore, type SupportedLanguage } from '../store/useEditorStore';
import { ShareModal } from './ShareModal';
import { Users, Code, Activity, ArrowLeft, Share2, Globe } from 'lucide-react';

const AVATAR_COLORS = [
  '#F97316', '#EC4899', '#14B8A6', '#A855F7', '#EAB308',
  '#06B6D4', '#EF4444', '#22C55E', '#3B82F6', '#F43F5E',
];

const LANGUAGES: { id: SupportedLanguage; name: string }[] = [
  { id: 'typescript', name: 'TypeScript' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
];

interface ToolbarProps {
  documentId?: string;
}

export const Toolbar = ({ documentId }: ToolbarProps) => {
  const { connected, activeUsers, clientId, language, setLanguage, documentTitle } = useEditorStore();
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <div className="w-full h-14 bg-brand-surface border-b border-gray-800 flex items-center justify-between px-6 shadow-md z-10">
        {/* Left: Nav & Branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-lg bg-brand-dark/60 hover:bg-brand-dark flex items-center justify-center transition-colors border border-gray-800"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} className="text-gray-400" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <Code size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white leading-tight">
                {documentTitle || 'Sync Engine'}
              </span>
              {documentId && (
                <span className="text-[10px] text-gray-500 font-mono">
                  ID: {documentId.slice(0, 8)}…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls & Status */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-brand-dark/50 border border-gray-700/60 rounded-lg px-2.5 py-1">
            <Globe size={14} className="text-gray-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs font-medium text-gray-200 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-brand-surface text-gray-200">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Share Button */}
          {documentId && (
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent/15 hover:bg-brand-accent/25 border border-brand-accent/40 text-brand-accent text-xs font-medium rounded-lg transition-all"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          )}

          {/* User avatars */}
          <div className="flex items-center -space-x-2 border-l border-gray-800 pl-4">
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

          {/* Online count */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={15} />
            <span>{activeUsers.length}</span>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <Activity size={15} className={connected ? 'text-green-500' : 'text-red-500'} />
            <span className="text-xs font-medium text-gray-300">
              {connected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {documentId && (
        <ShareModal
          documentId={documentId}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </>
  );
};

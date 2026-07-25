import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Share2, X, UserPlus, Check, AlertCircle } from 'lucide-react';

interface ShareModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal = ({ documentId, isOpen, onClose }: ShareModalProps) => {
  const { token } = useAuthStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Editor' | 'Viewer'>('Editor');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/documents/${documentId}/share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to share document');

      setMessage({ type: 'success', text: `Successfully shared with ${email} as ${role}!` });
      setEmail('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-brand-surface border border-gray-700/70 rounded-2xl p-6 shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
            <Share2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Share Document</h3>
            <p className="text-xs text-gray-400">Invite team members to collaborate in real-time</p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3 rounded-lg text-xs font-medium mb-4 flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {/* Share Form */}
        <form onSubmit={handleShare} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">User Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-brand-dark/70 border border-gray-600/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Permission Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'Editor' | 'Viewer')}
              className="w-full px-3.5 py-2.5 bg-brand-dark/70 border border-gray-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all"
            >
              <option value="Editor">Can Edit (Editor)</option>
              <option value="Viewer">Can View (Viewer)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 disabled:opacity-50"
          >
            <UserPlus size={16} />
            {loading ? 'Sharing...' : 'Add Collaborator'}
          </button>
        </form>

        {/* Direct Link Copy */}
        <div className="pt-4 border-t border-gray-800">
          <label className="block text-xs font-medium text-gray-400 mb-2">Or share via direct link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="flex-grow px-3 py-2 bg-brand-dark/50 border border-gray-700 rounded-lg text-xs text-gray-400 font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check size={14} className="text-green-400" /> : null}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

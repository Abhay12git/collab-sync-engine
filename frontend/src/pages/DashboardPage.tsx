import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Code, Plus, FileText, LogOut, Clock } from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  role: string;
  updatedAt: string;
}

export const DashboardPage = () => {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setDocuments(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: `Untitled Document` }),
      });
      const json = await res.json();
      if (res.ok) {
        navigate(`/doc/${json.data.id}`);
      }
    } catch (err) {
      console.error('Failed to create document', err);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="border-b border-gray-800 bg-brand-surface/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <Code size={18} className="text-white" />
            </div>
            <h1 className="font-semibold text-lg text-white tracking-tight">Sync Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Your Documents</h2>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/40 disabled:opacity-50"
          >
            <Plus size={18} />
            New Document
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-6">Create your first document to start collaborating</p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-6 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-medium rounded-lg transition-all"
            >
              Create Document
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/doc/${doc.id}`)}
                className="w-full text-left bg-brand-surface/60 hover:bg-brand-surface border border-gray-700/50 hover:border-gray-600/50 rounded-xl p-5 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-gray-500 group-hover:text-brand-accent transition-colors" />
                    <div>
                      <h3 className="font-medium text-white group-hover:text-brand-accent transition-colors">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full">
                          {doc.role}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {formatDate(doc.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Clock, Trash2, MessageSquare, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { getChatEntries, deleteChatEntry, clearAllEntries } from '../utils/chatHistoryDB';

export default function ChatHistory({ toolId, providerId }) {
  const [entries, setEntries] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!open || !toolId) return;
    getChatEntries(toolId, 50).then(setEntries).catch(() => {});
  }, [toolId, open]);

  const handleDelete = async (id) => {
    await deleteChatEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleClear = async () => {
    await clearAllEntries(toolId);
    setEntries([]);
    setSelected(null);
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} د`;
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} س`;
    return d.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'short' });
  };

  const shortPrompt = (txt) => {
    const cleaned = txt.replace(/^===[\s\S]*?===/, '').trim();
    return cleaned.length > 60 ? cleaned.slice(0, 60) + '…' : cleaned;
  };

  const providerLabel = {
    nvidia: 'NVIDIA',
    gemini: 'Gemini',
    openrouter: 'OpenRouter'
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed left-4 bottom-4 z-50 p-3 rounded-full shadow-xl transition-all ${
          open ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:shadow-2xl'
        }`}
        title="سجل المحادثات"
      >
        {open ? <ChevronRight className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 bg-white shadow-2xl border-l border-gray-200 transition-all duration-300 flex flex-col ${
        open ? 'w-80' : 'w-0'
      }`}>
        {open && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-800">سجل المحادثات</h2>
              </div>
              {entries.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  مسح الكل
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                  <MessageSquare className="w-10 h-10 mb-3 opacity-50" />
                  <p className="text-sm">لا توجد محادثات بعد</p>
                  <p className="text-xs mt-1">كل محادثة مع AI تُحفظ هنا تلقائيًا</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {entries.map(entry => (
                    <div key={entry.id}>
                      <button
                        onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                        className={`w-full text-right p-3 hover:bg-gray-50 transition-colors ${
                          selected?.id === entry.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              entry.providerId === 'nvidia' ? 'bg-cyan-100 text-cyan-700' :
                              entry.providerId === 'gemini' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>{providerLabel[entry.providerId] || entry.providerId}</span>
                            <span className="text-[10px] text-gray-400">{formatDate(entry.createdAt)}</span>
                          </div>
                          <Trash2
                            onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                            className="w-3 h-3 text-gray-300 hover:text-red-500 flex-shrink-0"
                          />
                        </div>
                        <p className="text-xs text-gray-700 mt-1 leading-relaxed line-clamp-2 text-right">
                          {shortPrompt(entry.prompt)}
                        </p>
                      </button>

                      {/* Expanded response */}
                      {selected?.id === entry.id && (
                        <div className="px-3 pb-3 bg-blue-50/50 border-b border-blue-100">
                          <div className="bg-white rounded-lg p-3 border border-blue-100">
                            <p className="text-[11px] font-bold text-blue-600 mb-1">الرد:</p>
                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap" dir="auto">
                              {entry.response?.slice(0, 300)}{entry.response?.length > 300 ? '…' : ''}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 text-[10px] text-gray-400 text-center">
              المحادثات محفوظة محليًا في متصفحك فقط
            </div>
          </>
        )}
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/10"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

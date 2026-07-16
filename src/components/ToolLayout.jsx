import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Eye, EyeOff, ShieldAlert, Settings2 } from 'lucide-react';
import { AI_PROVIDERS } from '../data/providers';
import ChatHistory from './ChatHistory';
import ModelSelector from './ModelSelector';

const PROVIDER_LIST = [
  { id: 'nvidia', label: 'NVIDIA NIM', gradient: 'from-cyan-500 to-sky-600' },
  { id: 'openrouter', label: 'OpenRouter', gradient: 'from-orange-500 to-amber-600' },
  { id: 'gemini', label: 'Google Gemini', gradient: 'from-blue-500 to-indigo-600' },
];

export default function ToolLayout({
  tool,
  apiKey,
  model,
  customEndpoint,
  onApiKeyChange,
  onModelChange,
  onCustomEndpointChange,
  providerOverride,
  providerId,
  onProviderChange,
  children
}) {
  const provider = providerOverride || AI_PROVIDERS.nvidia;
  const ProviderIcon = provider.icon;
  const navigate = useNavigate();
  const [showKey, setShowKey] = useState(false);
  const handleKeyChange = (e) => {
    onApiKeyChange(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md`}>
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{tool.title}</h1>
                <p className="text-xs text-gray-500">أداة ذكاء اصطناعي</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
              {PROVIDER_LIST.map(p => {
                const isActive = providerId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onProviderChange?.(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? `bg-gradient-to-br ${p.gradient} text-white shadow-md scale-105`
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-sm ${isActive ? 'bg-white/30' : 'bg-gray-400'}`} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* API Key + Model Bar */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-2">
            {/* Provider Info Row */}
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded bg-gradient-to-br ${provider.gradient}`} />
              <span className="text-xs font-medium text-gray-500">{provider.name}</span>
            </div>

            {/* API Key Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 min-w-max">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">مفتاح API</span>
              </div>
              <div className="flex-1 flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey || ''}
                    onChange={handleKeyChange}
                    placeholder={providerId === 'gemini' ? 'AQ.Ab... (مفتاح المصادقة)' : providerId === 'openrouter' ? 'sk-or-v1-...' : 'nvapi-...'}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all font-mono dir-ltr text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            {/* Security notice: appears once key is typed */}
            {apiKey && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  🔐 مفتاح API هذا <strong>لا يُخزَّن</strong> في أي سيرفر أو متصفح.
                  عند تحديث الصفحة أو إغلاق المتصفح، <strong>يُحذف المفتاح نهائيًا</strong>.
                  احتفظ بمفتاحك في مكان آمن وأدخله مجددًا في كل جلسة.
                </span>
              </div>
            )}

            {/* Model + Endpoint rows — مخفية لمزود Gemini */}
            {providerId === 'gemini' ? (
              <div className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                ✅ تعمل الآن بـ <strong>Google Gemini 2.5 Flash</strong> — أدخل مفتاح API أعلاه وابدأ.
              </div>
            ) : (
              <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${provider.gradient}`} />
                  <span className="text-xs font-bold text-blue-700">{provider.name}</span>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <Settings2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">الموديل</span>
                  <div className="flex-1 min-w-[200px]">
                    <ModelSelector
                      providerId={providerId}
                      apiKey={apiKey}
                      value={model || provider.defaultModel}
                      onChange={onModelChange}
                      provider={provider}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Endpoint:</span>
                  <input
                    type="text"
                    value={customEndpoint || (typeof provider.defaultEndpoint === 'string' ? provider.defaultEndpoint : '') || ''}
                    onChange={(e) => onCustomEndpointChange(e.target.value)}
                    placeholder={typeof provider.defaultEndpoint === 'string' ? provider.defaultEndpoint : 'https://generativelanguage.googleapis.com'}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono dir-ltr text-left"
                  />
                </div>
              </div>

              <div className="text-[10px] text-gray-400 mt-1 px-1 flex items-center gap-3">
                <span>⚡ سريع</span>
                <span>⏱️ متوسط</span>
                <span>🐢 بطيء</span>
                <span>📷 يقرا الصور</span>
              </div>
              </>
            )}
          </div>

          {!apiKey && (
            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
              يرجى إدخال مفتاح API الخاص بـ {provider.name} لاستخدام هذه الأداة
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {apiKey || tool?.noKeyRequired ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${provider.gradient} flex items-center justify-center mb-6 shadow-lg`}>
              <ProviderIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">أدخل مفتاح API للبدء</h2>
            <p className="text-gray-500 max-w-md">
              أداة {tool.title} تحتاج إلى مفتاح API لـ {provider.name}. أدخل مفتاحك أعلاه لاستخدامه.
            </p>
            <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200 max-w-md text-right">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>🔐 تنبيه مهم:</strong> هذا التطبيق لا يخزّن مفاتيح API. عند إغلاق المتصفح أو تحديث الصفحة، يُحذف المفتاح نهائيًا.
                احتفظ بمفتاحك الخاص وأدخله مجددًا في كل جلسة عمل.
              </span>
            </div>
          </div>
        )}
      </div>
      <ChatHistory toolId={tool?.id} providerId={providerId} />
    </div>
  );
}

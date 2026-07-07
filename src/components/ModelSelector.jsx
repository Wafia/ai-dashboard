import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Check } from 'lucide-react';

// Static curated lists
const CURATED_MODELS = {
  openrouter: {
    images: [
      { id: 'google/gemini-3.1-flash-image', name: 'Nano Banana 2', desc: 'Gemini 3.1 Flash Image — أحدث وأسرع موديل صور', speed: 'fast' },
      { id: 'google/gemini-2.5-flash-image', name: 'Nano Banana', desc: 'Gemini 2.5 Flash Image — مستقر ومجرب', speed: 'fast' },
      { id: 'google/gemini-3-pro-image', name: 'Nano Banana Pro', desc: 'أعلى جودة لتوليد الصور', speed: 'slow' },
      { id: 'google/gemini-3.1-flash-lite-image', name: 'Nano Banana 2 Lite', desc: 'توليد صور سريع وخفيف', speed: 'fast' },
      { id: 'openai/gpt-5-image', name: 'GPT-5 Image', desc: 'OpenAI — توليد صور', speed: 'slow' },
      { id: 'openai/gpt-5-image-mini', name: 'GPT-5 Image Mini', desc: 'OpenAI — توليد صور سريع', speed: 'fast' },
      { id: 'openai/gpt-5.4-image-2', name: 'GPT-5.4 Image 2', desc: 'OpenAI — أحدث موديل صور', speed: 'slow' },
    ],
    chat: [
      { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash', desc: '284B MoE — سريع، 1M سياق', speed: 'fast' },
      { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro', desc: '1M سياق، قوي للمهام المعقدة', speed: 'slow' },
      { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 (122B)', desc: 'MoE عربي قوي', speed: 'fast' },
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: '1M سياق — متعدد الوسائط', speed: 'fast' },
      { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'OpenAI الرائد', speed: 'slow' },
      { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', desc: 'Anthropic — توازن سرعة وجودة', speed: 'fast' },
      { id: 'mistralai/mistral-small-3.2-24b-instruct', name: 'Mistral Small 3.2', desc: 'ممتاز بالفرنسية والدارجة', speed: 'fast' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', desc: 'تفكير متقدم', speed: 'fast' },
    ],
  },
};

const PROVIDER_LABELS = {
  google: 'Google', openai: 'OpenAI', 'black-forest-labs': 'Black Forest Labs',
  deepseek: 'DeepSeek', anthropic: 'Anthropic', meta: 'Meta', 'meta-llama': 'Meta Llama',
  mistralai: 'Mistral AI', qwen: 'Qwen', 'x-ai': 'xAI', recraft: 'Recraft',
  nvidia: 'NVIDIA', cohere: 'Cohere', microsoft: 'Microsoft', amazon: 'Amazon',
  bytedance: 'ByteDance', minimax: 'MiniMax', 'z-ai': 'Zhipu AI',
  moonshotai: 'Moonshot AI', stepfun: 'Stepfun', alibaba: 'Alibaba',
  perplexity: 'Perplexity', nousresearch: 'Nous Research', thedrummer: 'The Drummer',
  'sao10k': 'Sao10k', liquid: 'Liquid', 'ibm-granite': 'IBM Granite',
  'aion-labs': 'Aion Labs', deepcogito: 'Deep Cogito', 'arcee-ai': 'Arcee AI',
  inception: 'Inception', 'kwaivgi': 'Kwaivgi', 'kwaipilot': 'Kwai Pilot',
  'bytedance-seed': 'ByteDance Seed', 'sourceful': 'Sourceful', 'mancer': 'Mancer',
  'undi95': 'Undi95', 'gryphe': 'Gryphe', 'inflection': 'Inflection',
  'anthracite-org': 'Anthracite', 'rekaai': 'Reka', 'inclusionai': 'Inclusion AI',
  'poolside': 'Poolside', 'tencent': 'Tencent', 'nex-agi': 'Nex AGI',
  'sakana': 'Sakana', 'moonshotai': 'Moonshot AI', 'minimax': 'MiniMax',
  'cohere': 'Cohere', 'relace': 'Relace', 'writer': 'Writer',
  'upstage': 'Upstage', 'liquid': 'Liquid', 'perceptron': 'Perceptron',
  'zyphra': 'Zyphra', 'sesame': 'Sesame', 'canopylabs': 'Canopy Labs',
  'hexgrad': 'HexGrad', 'xiaomi': 'Xiaomi',
};

function getProviderGroup(modelId) {
  const p = modelId.split('/');
  return p.length > 1 ? p[0] : 'other';
}

function isImageModel(model) {
  const id = (model.id || '').toLowerCase();
  const n = (model.name || model.id || '').toLowerCase();
  const kw = ['flux', 'image', 'nano-banana', 'grok-imagine', 'recraft', 'sdxl', 'dall-e',
              'stable-diffusion', 'imagen', 'seedream', 'wan-', 'hailuo', 'sora',
              'veo', 'lyria', 'maï-image', 'gpt-image'];
  return kw.some(k => id.includes(k) || n.includes(k));
}

function getSpeedLabel(speed) {
  if (speed === 'fast') return { icon: '⚡', label: 'سريع', cls: 'bg-green-100 text-green-700' };
  if (speed === 'slow') return { icon: '🐢', label: 'بطيء', cls: 'bg-red-100 text-red-700' };
  return { icon: '⏱️', label: 'متوسط', cls: 'bg-yellow-100 text-yellow-700' };
}

export default function ModelSelector({ providerId, apiKey, value, onChange, provider }) {
  const [apiModels, setApiModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // استخدم provider.models للمزودات التي لا تدعم الجلب الديناميكي
  const localModels = useMemo(() => {
    if (!provider || providerId === 'openrouter') return [];
    return (provider.models || []).map(m => ({
      ...m,
      _group: m.category === 'images' ? '_local_images' : m.category === 'coding' ? '_local_coding' : '_local_chat',
      _isCurated: true,
      _isLocal: true,
    }));
  }, [provider, providerId]);

  const curated = CURATED_MODELS[providerId];

  // Fetch models from OpenRouter API
  const fetchModels = useCallback(async () => {
    if (providerId !== 'openrouter' || !apiKey) {
      setApiModels([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApiModels(data?.data || []);
    } catch (e) {
      setError(e.message);
      setApiModels([]);
    } finally {
      setLoading(false);
    }
  }, [providerId, apiKey]);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  // Build organized model groups
  const { curatedImage, curatedChat, curatedCoding, dynamicGroups } = useMemo(() => {
    const curatedImage = (curated?.images || []).map(m => ({ ...m, _group: '_curated_images', _isCurated: true }));
    const curatedChat = (curated?.chat || []).map(m => ({ ...m, _group: '_curated_chat', _isCurated: true }));
    const curatedCoding = (curated?.coding || []).map(m => ({ ...m, _group: '_curated_coding', _isCurated: true }));
    
    // For non-OpenRouter providers, use models from provider config
    const localChat = localModels.filter(m => m.category === 'chat' || (!m.category && !isImageModel(m)));
    const localImages = localModels.filter(m => m.category === 'images' || isImageModel(m));
    const localCoding = localModels.filter(m => m.category === 'coding');

    const groups = {};

    for (const m of apiModels) {
      const cat = isImageModel(m) ? 'images' : 'chat';
      const group = getProviderGroup(m.id);
      if (!groups[group]) groups[group] = { label: PROVIDER_LABELS[group] || group, order: cat === 'images' ? 1 : 2, models: [] };
      groups[group].models.push({
        id: m.id,
        name: m.name || m.id.split('/').pop(),
        desc: `سياق ${m.context_length ? (m.context_length / 1000).toFixed(0) + 'K' : '??'}`,
        speed: m.id.includes('speed') || m.id.includes('flash') || m.id.includes('mini') || m.id.includes('schnell') ? 'fast' : 'slow',
        _group: group,
        _isCurated: false,
        _category: cat,
      });
    }

    const sorted = Object.entries(groups)
      .sort(([, a], [, b]) => a.order - b.order || a.label.localeCompare(b.label))
      .map(([key, val]) => ({ key, ...val }));

    return { curatedImage, curatedChat, curatedCoding, dynamicGroups: sorted };
  }, [apiModels, curated]);

  // Filter by search
  const filterFn = (m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
  };

  const selectedModelName = useMemo(() => {
    const all = [...curatedImage, ...curatedChat, ...curatedCoding, ...localModels, ...apiModels.map(m => ({ id: m.id, name: m.name || m.id.split('/').pop() }))];
    const found = all.find(m => m.id === value);
    return found?.name || value || 'اختر موديل';
  }, [value, curatedImage, curatedChat, curatedCoding, localModels, apiModels]);

  // Group visibility
  const toggleGroup = (key) => setCollapsedGroups(p => ({ ...p, [key]: !p[key] }));

  // Render model option
  const renderModel = (m) => {
    if (!filterFn(m)) return null;
    const sp = getSpeedLabel(m.speed);
    const isSelected = value === m.id;
    return (
      <button
        key={m.id}
        onClick={() => { onChange(m.id); setOpen(false); }}
        className={`w-full text-right px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 hover:bg-gray-100 ${
          isSelected ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-700 border border-transparent'
        }`}
      >
        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-500' : 'bg-gray-300'}`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{sp.icon} {m.name}</div>
          {m.desc && <div className="text-[10px] text-gray-500 truncate">{m.desc}</div>}
        </div>
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${sp.cls}`}>{sp.label}</span>
      </button>
    );
  };

  const hasCuratedImage = curatedImage.some(filterFn) || localModels.filter(m => m._group === '_local_images').some(filterFn);
  const hasCuratedChat = curatedChat.some(filterFn) || localModels.filter(m => m._group === '_local_chat').some(filterFn);
  const hasCuratedCoding = curatedCoding.some(filterFn) || localModels.filter(m => m._group === '_local_coding').some(filterFn);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:border-gray-400 outline-none bg-white font-semibold text-right flex items-center gap-2 transition-all"
      >
        <span className="flex-1 truncate">{selectedModelName}</span>
        {loading ? (
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[70vh] flex flex-col">
          {/* Search bar */}
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن موديل..."
              className="flex-1 text-sm outline-none bg-transparent"
              autoFocus
            />
            {apiKey && providerId === 'openrouter' && (
              <button onClick={fetchModels} className="text-gray-400 hover:text-gray-600 p-1" title="تحديث القائمة">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>تعذر جلب الموديلات: {error}</span>
            </div>
          )}

          {/* Model list */}
          <div className="overflow-y-auto p-2 space-y-1 flex-1">
            {/* ⭐ Curated images */}
            {hasCuratedImage && (
              <div className="mb-2">
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                  <span>⭐ مقترحة — توليد صور</span>
                </div>
                {[...curatedImage, ...localModels.filter(m => m._group === '_local_images')].filter(filterFn).map(renderModel)}
              </div>
            )}

            {/* ⭐ Curated chat */}
            {hasCuratedChat && (
              <div className="mb-2">
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                  <span>⭐ مقترحة — شات ونصوص</span>
                </div>
                {[...curatedChat, ...localModels.filter(m => m._group === '_local_chat')].filter(filterFn).map(renderModel)}
              </div>
            )}

            {/* ⭐ Curated coding */}
            {hasCuratedCoding && (
              <div className="mb-2">
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                  <span>⭐ مقترحة — برمجة</span>
                </div>
                {[...curatedCoding, ...localModels.filter(m => m._group === '_local_coding')].filter(filterFn).map(renderModel)}
              </div>
            )}

            {/* Dynamic groups from API */}
            {dynamicGroups.map(group => {
              const filtered = group.models.filter(filterFn);
              if (filtered.length === 0) return null;
              const collapsed = collapsedGroups[group.key];
              return (
                <div key={group.key}>
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-2"
                  >
                    {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span>{group.label}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({filtered.length})</span>
                  </button>
                  {!collapsed && filtered.map(renderModel)}
                </div>
              );
            })}

            {/* Empty state */}
            {!loading && curatedImage.length === 0 && curatedChat.length === 0 && curatedCoding.length === 0 && localModels.length === 0 && dynamicGroups.every(g => g.models.filter(filterFn).length === 0) && (
              <div className="text-center py-6 text-gray-400 text-xs">
                {search ? 'لا توجد نتائج للبحث' : 'لم يتم تحميل الموديلات بعد'}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-4 text-gray-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                جاري تحميل {apiModels.length === 0 ? 'الموديلات...' : `${apiModels.length} موديل`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

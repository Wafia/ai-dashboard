import { Cpu, Sparkles } from 'lucide-react';

function safeParseJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      for (const key of ['avatars', 'angles', 'data', 'items', 'results', 'response']) {
        if (Array.isArray(parsed[key])) return parsed[key];
      }
      const arr = Object.values(parsed).find(v => Array.isArray(v));
      if (arr) return arr;
    }
    return [];
  } catch {
    const match = raw.match(/\[[\s\S]*?\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return Array.isArray(parsed) ? parsed : [];
      } catch {}
    }
    return [];
  }
}

const NVIDIA_CATEGORIES = [
  { id: 'chat', label: '💬 نصوص وسكريبتات' },
  { id: 'images', label: '🖼️ صور ورؤية' },
  { id: 'coding', label: '👨‍💻 برمجة وتقنية' },
];

const NVIDIA_MODELS = [
  // 💬 شات
  { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash', desc: '284B MoE، 1M سياق، ممتاز للنصوص العربية والكتابة', speed: 'fast', category: 'chat' },
  { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', desc: '1M سياق — تفكير عميق ومهام معقدة', speed: 'slow', category: 'chat' },
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', desc: 'Meta — تفكير متقدم، شامل، توليد نصوص احترافي', speed: 'fast', category: 'chat' },
  { id: 'meta/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick', desc: '128 MoE — متعدد اللغات، multimedia، الأحدث', speed: 'fast', category: 'chat' },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B', desc: 'Google — كثيف 31B، تفكير حدودي، برمجة، وكيل', speed: 'fast', category: 'chat' },
  { id: 'mistralai/mistral-nemotron', name: 'Mistral NemoTron', desc: 'مهام وكيلية، برمجة، اتباع تعليمات — مع NVIDIA', speed: 'fast', category: 'chat' },
  { id: 'mistralai/ministral-14b-instruct-2512', name: 'Ministral 14B', desc: 'VLM متعدد الأغراض — شات، تعليمات، صور', speed: 'fast', category: 'chat' },
  { id: 'minimaxai/minimax-m3', name: 'MiniMax M3', desc: '230B MoE — تفكير، برمجة، مهام مكتبية', speed: 'slow', category: 'chat' },
  // 🖼️ صور ورؤية
  { id: 'moonshotai/kimi-k2.6', name: 'Kimi K2.6', desc: '1T MoE — فيديو، صور، برمجة وكيلية — الأقوى', speed: 'slow', category: 'images', vision: true },
  { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen 3.5 (397B)', desc: 'VLM 400B MoE — رؤية متقدمة، عربي، وكيل', speed: 'slow', category: 'images', vision: true },
  { id: 'mistralai/mistral-large-3-675b-instruct-2512', name: 'Mistral Large 3 (675B)', desc: 'MoE VLM — شات، وكيل، صور — متعدد الوسائط', speed: 'slow', category: 'images', vision: true },
  { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 (122B)', desc: '122B MoE — برمجة، تفكير، شات، عربي', speed: 'fast', category: 'images', vision: true },
  // 👨‍💻 برمجة
  { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'Nemotron 3 Super 120B', desc: 'Mamba-Transformer، 1M سياق — وكلاء أذكياء، برمجة', speed: 'slow', category: 'coding' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b', name: 'Nemotron 3 Nano 30B', desc: 'MoE كفء 1M سياق — برمجة، تفكير، أدوات', speed: 'fast', category: 'coding' },
  { id: 'mistralai/mistral-small-4-119b-2603', name: 'Mistral Small 4 (119B)', desc: 'Hybrid MoE — تفكير، برمجة، multimodal، 256k سياق', speed: 'slow', category: 'coding' },
  { id: 'z-ai/glm-5.2', name: 'GLM 5.2', desc: 'مهام وكيلية طويلة — برمجة، تخطيط، تفكير', speed: 'slow', category: 'coding' },
];

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'سريع ومتعدد الوسائط — 1M سياق', speed: 'fast', category: 'chat', vision: true },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'أقوى للتفكير والمهام المعقدة — 2M سياق', speed: 'slow', category: 'chat', vision: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'خفيف وسريع — 1M سياق', speed: 'fast', category: 'chat', vision: true },
];

export const AI_PROVIDERS = {
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    icon: Cpu,
    color: 'cyan',
    gradient: 'from-cyan-500 to-sky-600',
    supportsBrowserCors: false,
    defaultModel: 'deepseek-ai/deepseek-v4-flash',
    models: NVIDIA_MODELS,
    categories: NVIDIA_CATEGORIES,
    modelsByCategory: { chat: NVIDIA_MODELS.filter(m => m.category === 'chat'), images: NVIDIA_MODELS.filter(m => m.category === 'images'), coding: NVIDIA_MODELS.filter(m => m.category === 'coding') },
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    defaultEndpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    buildChatBody: ({ messages, model, jsonMode }) => {
      const isDeepSeek = model?.includes('deepseek');
      const body = {
        model,
        messages,
        max_tokens: 8192,
        temperature: 0.3,
        top_p: 0.7,
        stream: false
      };
      if (isDeepSeek) {
        body.chat_template_kwargs = { thinking: false };
      }
      if (jsonMode) body.response_format = { type: 'json_object' };
      return body;
    },
    parseChat: (data) => {
      const msg = data.choices?.[0]?.message;
      let content = msg?.content || '';
      if (msg?.reasoning_content) {
        content = `🤔 *التفكير:*\n${msg.reasoning_content}\n\n---\n\n${content}`;
      }
      return content;
    },
    parseJson: (data) => safeParseJson(data.choices?.[0]?.message?.content || '[]')
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    icon: Sparkles,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    supportsBrowserCors: true,
    defaultModel: 'gemini-2.5-flash',
    models: GEMINI_MODELS,
    categories: [{ id: 'chat', label: '💬 شات' }],
    modelsByCategory: { chat: GEMINI_MODELS },
    endpoint: (apiKey, model) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    headers: () => ({ 'Content-Type': 'application/json' }),
    buildChatBody: ({ messages, systemPrompt, jsonMode }) => {
      const contents = [];
      for (const msg of messages) {
        if (msg.role === 'system') continue;
        const role = msg.role === 'assistant' ? 'model' : 'user';
        if (typeof msg.content === 'string') {
          contents.push({ role, parts: [{ text: msg.content }] });
        } else if (Array.isArray(msg.content)) {
          const parts = msg.content.map(p => {
            if (p.type === 'text') return { text: p.text };
        if (p.type === 'image_url') {
          const parts = (p.image_url?.url || '').split(',');
          const mimeMatch = parts[0]?.match(/data:(.*?);/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          return { inlineData: { mimeType, data: parts[1] || '' } };
        }
            return { text: '' };
          });
          contents.push({ role, parts });
        }
      }
      const body = { contents, generationConfig: { temperature: 0.3, topP: 0.7, maxOutputTokens: 16384 } };
      if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };
      if (jsonMode) body.generationConfig.response_mime_type = 'application/json';
      return body;
    },
    parseChat: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    parseJson: (data) => {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      return safeParseJson(text);
    },
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: Sparkles,
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    supportsBrowserCors: true,
    defaultModel: 'deepseek/deepseek-v4-flash',
    models: [
      // 💬 Chat models
      { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash', desc: '284B MoE — سريع، 1M سياق، ممتاز للنصوص العربية', speed: 'fast', category: 'chat' },
      { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro', desc: '1M سياق، قوي للتفكير والمهام المعقدة', speed: 'slow', category: 'chat' },
      { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 (122B)', desc: 'MoE عربي قوي — برمجة، تفكير، شات', speed: 'fast', category: 'chat' },
      { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen 3.5 (397B)', desc: 'VLM 400B — رؤية متقدمة، دردشة، وكيل', speed: 'slow', category: 'chat', vision: true },
      { id: 'mistralai/mistral-small-3.2-24b-instruct', name: 'Mistral Small 3.2 (24B)', desc: 'الأحدث — ممتاز بالفرنسية والدارجة', speed: 'fast', category: 'chat' },
      { id: 'mistralai/mistral-nemo', name: 'Mistral Nemo (12B)', desc: 'مع NVIDIA — متعدد اللغات، اتباع تعليمات', speed: 'fast', category: 'chat' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', desc: 'تفكير متقدم، شامل، قوي', speed: 'fast', category: 'chat' },
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'سريع ومتعدد الوسائط — 1M سياق', speed: 'fast', category: 'chat', vision: true },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'أقوى للتفكير — 2M سياق', speed: 'slow', category: 'chat', vision: true },
      { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'OpenAI الرائد — متعدد الوسائط', speed: 'slow', category: 'chat', vision: true },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', desc: 'Anthropic — سريع، خفيف', speed: 'fast', category: 'chat' },
      // 🖼️ Image generation models (correct IDs from OpenRouter API)
      { id: 'google/gemini-3.1-flash-lite-image', name: 'Nano Banana 2 Lite', desc: 'Gemini 3.1 Flash Lite — توليد صور سريع', speed: 'fast', category: 'images' },
      { id: 'google/gemini-3.1-flash-image', name: 'Nano Banana 2', desc: 'Gemini 3.1 Flash Image — أحدث موديل صور', speed: 'fast', category: 'images' },
      { id: 'google/gemini-3.1-flash-image-preview', name: 'Nano Banana 2 Preview', desc: 'Gemini 3.1 Flash Image Preview', speed: 'fast', category: 'images' },
      { id: 'google/gemini-3-pro-image', name: 'Nano Banana Pro', desc: 'Gemini 3 Pro Image — أعلى جودة', speed: 'slow', category: 'images' },
      { id: 'google/gemini-3-pro-image-preview', name: 'Nano Banana Pro Preview', desc: 'Gemini 3 Pro Image Preview', speed: 'slow', category: 'images' },
      { id: 'google/gemini-2.5-flash-image', name: 'Nano Banana', desc: 'Gemini 2.5 Flash Image — مستقر ومجرب', speed: 'fast', category: 'images' },
      { id: 'openai/gpt-5.4-image-2', name: 'GPT-5.4 Image 2', desc: 'OpenAI — أحدث موديل صور', speed: 'slow', category: 'images' },
      { id: 'openai/gpt-5-image-mini', name: 'GPT-5 Image Mini', desc: 'OpenAI — توليد صور سريع', speed: 'fast', category: 'images' },
      { id: 'openai/gpt-5-image', name: 'GPT-5 Image', desc: 'OpenAI — توليد صور', speed: 'slow', category: 'images' },
    ],
    categories: [
      { id: 'chat', label: '💬 شات وتوليد نصوص' },
      { id: 'images', label: '🖼️ توليد صور' },
    ],
    modelsByCategory: {
      chat: [
        { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash', desc: '284B MoE — سريع، 1M سياق، ممتاز للنصوص العربية', speed: 'fast', category: 'chat' },
        { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro', desc: '1M سياق، قوي للتفكير والمهام المعقدة', speed: 'slow', category: 'chat' },
        { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 (122B)', desc: 'MoE عربي قوي — برمجة، تفكير، شات', speed: 'fast', category: 'chat' },
        { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen 3.5 (397B)', desc: 'VLM 400B — رؤية متقدمة، دردشة، وكيل', speed: 'slow', category: 'chat', vision: true },
        { id: 'mistralai/mistral-small-3.2-24b-instruct', name: 'Mistral Small 3.2 (24B)', desc: 'الأحدث — ممتاز بالفرنسية والدارجة', speed: 'fast', category: 'chat' },
        { id: 'mistralai/mistral-nemo', name: 'Mistral Nemo (12B)', desc: 'مع NVIDIA — متعدد اللغات، اتباع تعليمات', speed: 'fast', category: 'chat' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', desc: 'تفكير متقدم، شامل، قوي', speed: 'fast', category: 'chat' },
        { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'سريع ومتعدد الوسائط — 1M سياق', speed: 'fast', category: 'chat', vision: true },
        { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'أقوى للتفكير — 2M سياق', speed: 'slow', category: 'chat', vision: true },
        { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'OpenAI الرائد — متعدد الوسائط', speed: 'slow', category: 'chat', vision: true },
        { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', desc: 'Anthropic — سريع، خفيف', speed: 'fast', category: 'chat' },
      ],
      images: [
        { id: 'google/gemini-3.1-flash-lite-image', name: 'Nano Banana 2 Lite', desc: 'Gemini 3.1 Flash Lite — توليد صور سريع', speed: 'fast', category: 'images' },
        { id: 'google/gemini-3.1-flash-image', name: 'Nano Banana 2', desc: 'Gemini 3.1 Flash Image — أحدث موديل صور', speed: 'fast', category: 'images' },
        { id: 'google/gemini-3.1-flash-image-preview', name: 'Nano Banana 2 Preview', desc: 'Gemini 3.1 Flash Image Preview', speed: 'fast', category: 'images' },
        { id: 'google/gemini-3-pro-image', name: 'Nano Banana Pro', desc: 'Gemini 3 Pro Image — أعلى جودة', speed: 'slow', category: 'images' },
        { id: 'google/gemini-3-pro-image-preview', name: 'Nano Banana Pro Preview', desc: 'Gemini 3 Pro Image Preview', speed: 'slow', category: 'images' },
        { id: 'google/gemini-2.5-flash-image', name: 'Nano Banana', desc: 'Gemini 2.5 Flash Image — مستقر ومجرب', speed: 'fast', category: 'images' },
        { id: 'openai/gpt-5.4-image-2', name: 'GPT-5.4 Image 2', desc: 'OpenAI — أحدث موديل صور', speed: 'slow', category: 'images' },
        { id: 'openai/gpt-5-image-mini', name: 'GPT-5 Image Mini', desc: 'OpenAI — توليد صور سريع', speed: 'fast', category: 'images' },
        { id: 'openai/gpt-5-image', name: 'GPT-5 Image', desc: 'OpenAI — توليد صور', speed: 'slow', category: 'images' },
      ],
    },
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'AI Tools Hub',
    }),
    buildChatBody: ({ messages, model, jsonMode }) => {
      const body = { model, messages, max_tokens: 16384, temperature: 0.3, top_p: 0.7, stream: false };
      if (jsonMode) body.response_format = { type: 'json_object' };
      return body;
    },
    parseChat: (data) => data.choices?.[0]?.message?.content || '',
    parseJson: (data) => safeParseJson(data.choices?.[0]?.message?.content || '[]'),
  }
};

export const getDefaultProvider = () => AI_PROVIDERS.nvidia;

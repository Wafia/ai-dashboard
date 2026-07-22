import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Image as ImageIcon, Sliders, Settings, Folder, BookOpen,
  Download, Copy, Trash2, Heart, RotateCcw, Maximize2,
  Check, ArrowRight, HelpCircle, Code, Plus, ChevronRight, X,
  Upload, Shuffle, Info, Eye, RefreshCw, Key,
  Moon, Sun, Database, FileText, Columns, AlertTriangle,
  ArrowLeft
} from 'lucide-react';

const STYLE_PRESETS = [
  // ── Product Photography ──
  { id: 'luxury-perfume', name: 'عطر فاخر', desc: 'تصوير منتجات فاخر', icon: '📦', positive: 'Professional commercial product photography of a luxury perfume bottle on a matte stone pedestal, soft diffused studio lighting, elegant shadow, premium minimalist background, sharp focus, realistic glass reflections, high detail, advertising quality' },
  { id: 'wireless-earbuds', name: 'سماعات لاسلكية', desc: 'منتج إلكتروني احترافي', icon: '🎧', positive: 'Premium product shot of wireless earbuds in an open charging case, clean white studio background, softbox lighting, crisp reflections, ultra detailed, modern commercial advertising style, realistic materials' },
  { id: 'smartwatch', name: 'ساعة ذكية', desc: 'إلكترونيات فاخرة', icon: '⌚', positive: 'High-end commercial photography of a black smartwatch floating above a dark reflective surface, cinematic rim lighting, clean premium background, realistic metal and glass textures, sharp focus, luxury tech advertisement' },
  { id: 'sports-shoes', name: 'حذاء رياضي', desc: 'إعلان رياضي احترافي', icon: '👟', positive: 'Professional sports shoe advertising image, dynamic angle, dramatic studio lighting, soft shadow on textured floor, realistic fabric and rubber details, modern brand campaign look, ultra sharp' },
  { id: 'luxury-handbag', name: 'حقيبة نسائية', desc: 'أزياء فاخرة', icon: '👜', positive: 'Luxury handbag product photography on a beige elegant backdrop, soft natural light from the side, refined editorial composition, realistic leather texture, premium fashion campaign aesthetic' },
  // ── Food & Drink ──
  { id: 'gourmet-burger', name: 'برجر شهي', desc: 'تصوير طعام احترافي', icon: '🍔', positive: 'Gourmet burger food photography, fresh ingredients, warm restaurant lighting, shallow depth of field, realistic textures, steam rising, dark moody background, high-end menu advertising style' },
  { id: 'artisan-coffee', name: 'قهوة مختصة', desc: 'مشروبات دافئة', icon: '☕', positive: 'Artisan coffee cup on a wooden table near a window, cinematic morning light, cozy café atmosphere, realistic steam, rich brown tones, editorial lifestyle photography, highly detailed' },
  // ── Portraits ──
  { id: 'pro-portrait', name: 'بورتريه احترافي', desc: 'صورة شخصية احترافية', icon: '👔', positive: 'Ultra realistic professional portrait of a confident young entrepreneur, clean studio background, soft key light, subtle rim light, sharp eyes, natural skin texture, premium editorial photography' },
  { id: 'linkedin-headshot', name: 'LinkedIn', desc: 'بورتريه أعمال رسمي', icon: '💼', positive: 'Professional business headshot on neutral background, soft flattering studio lighting, confident expression, realistic skin detail, polished corporate portrait, premium quality' },
  { id: 'fashion-editorial', name: 'فاشن إديتوريال', desc: 'أزياء عصرية', icon: '👗', positive: 'Editorial fashion portrait of a woman in a modern black outfit, dramatic side lighting, minimalist background, magazine cover composition, sharp focus, premium luxury aesthetic' },
  // ── Content & Social ──
  { id: 'youtube-thumbnail', name: 'ثامبنيل يوتيوب', desc: 'صورة مصغرة احترافية', icon: '▶️', positive: 'Cinematic YouTube thumbnail style portrait of a surprised man pointing at a glowing futuristic screen, high contrast lighting, vibrant but clean background, dramatic composition, ultra detailed, attention-grabbing' },
  // ── Automotive ──
  { id: 'luxury-car', name: 'سيارة فاخرة', desc: 'تصوير سيارات ليلي', icon: '🚗', positive: 'Luxury sports car parked on a wet city street at night, cinematic neon reflections, realistic metallic paint, dramatic atmosphere, sharp focus, high-end automotive photography' },
  // ── Travel ──
  { id: 'travel-scene', name: 'سفر ومناظر', desc: 'تصوير سياحي', icon: '🌅', positive: 'Breathtaking travel photography of a coastal town at sunset, golden light, realistic water reflections, layered composition, detailed buildings, high-end tourism advertisement' },
  // ── Beauty ──
  { id: 'skincare', name: 'عناية بالبشرة', desc: 'منتجات تجميل', icon: '🧴', positive: 'Premium skincare product display with water droplets, clean spa-inspired background, soft white lighting, realistic glass and liquid textures, elegant beauty brand advertisement' },
  // ── Jewelry ──
  { id: 'diamond-ring', name: 'خاتم ألماس', desc: 'تصوير مجوهرات', icon: '💍', positive: 'Luxury diamond ring macro photography, black velvet background, dramatic spotlight, crisp reflections, ultra detailed gemstone sparkle, premium jewelry campaign style' },
  // ── Real Estate ──
  { id: 'luxury-interior', name: 'ديكور داخلي', desc: 'تصوير عقارات', icon: '🏠', positive: 'Luxury modern living room interior design, wide-angle shot, soft daylight entering through large windows, elegant neutral palette, realistic furniture textures, architectural magazine quality' },
  { id: 'storefront', name: 'واجهة متجر', desc: 'تصوير تجاري واجهات', icon: '🏪', positive: 'Stylish storefront exterior of a premium fashion boutique, golden hour lighting, clean urban street, realistic glass reflections, elegant branding space, commercial architectural photography' },
  // ── Mockups & Creative ──
  { id: 'book-mockup', name: 'موكاب كتاب', desc: 'عرض منتج رقمي', icon: '📖', positive: 'Professional mockup of a premium book standing upright on a clean minimal desk, soft natural lighting, elegant shadows, realistic paper texture, commercial branding presentation' },
  { id: 'anime-portrait', name: 'أنمي فاخر', desc: 'رسم أنمي احترافي', icon: '🎨', positive: 'High quality anime-style portrait of a futuristic female character, cinematic lighting, clean composition, detailed hair strands, expressive eyes, polished professional illustration quality' },
  { id: 'cinematic-scene', name: 'مشهد سينمائي', desc: 'تصوير قصصي', icon: '🎬', positive: 'Cinematic scene of a lone traveler walking through a vast desert at sunset, dramatic sky, long shadows, film-like composition, realistic atmosphere, epic visual storytelling' },
];

const PROMPT_TEMPLATES = [
  {
    category: "Product Photography",
    items: [
      { name: "Luxury Perfume Bottle", template: "Studio product photography of {{product}} bottle, styled with {{style}}, placed on a sleek marble surface with {{background}}, illuminated by {{lighting}} lighting, shot on a {{camera}}." },
      { name: "Minimalist Sneaker", template: "High-end product shot of {{brand}} {{product}}, featuring {{style}} style, suspended in mid-air against {{background}} background, with aggressive {{lighting}} lighting, close-up details." }
    ]
  },
  {
    category: "Marketing & Ads",
    items: [
      { name: "Luxury Watch Advertisement", template: "Commercial magazine ad for {{brand}} luxury watch. Aesthetic is {{style}}, showing detailed gears and premium craftsmanship, under {{lighting}} highlights, background is {{background}}." },
      { name: "Gourmet Food Close-up", template: "Delectable close-up shot of {{product}}, gourmet presentation, luxury {{style}} style, set against a cozy {{background}} scene, {{lighting}} natural light, shallow depth of field." }
    ]
  }
];

const OPENROUTER_MODELS = [
  // Per-Image Pricing
  { id: 'black-forest-labs/flux-2-klein-4b', name: 'FLUX.2 Klein 4B', provider: 'Black Forest Labs', price: 0.014, unit: '/megapixel', tier: 'Budget', badge: 'bg-green-500/20 text-green-400' },
  { id: 'sourceful/riverflow-v2.5-fast', name: 'Riverflow V2.5 Fast', provider: 'Sourceful', price: 0.019, unit: '/image', tier: 'Budget', badge: 'bg-green-500/20 text-green-400' },
  { id: 'sourceful/riverflow-v2-fast', name: 'Riverflow V2 Fast', provider: 'Sourceful', price: 0.02, unit: '/image', tier: 'Budget', badge: 'bg-green-500/20 text-green-400' },
  { id: 'recraft-ai/recraft-v4-1-utility', name: 'Recraft V4.1 Utility', provider: 'Recraft', price: 0.035, unit: '/image', tier: 'Standard', badge: 'bg-blue-500/20 text-blue-400' },
  { id: 'recraft-ai/recraft-v4-1', name: 'Recraft V4.1', provider: 'Recraft', price: 0.035, unit: '/image', tier: 'Standard', badge: 'bg-blue-500/20 text-blue-400' },
  { id: 'recraft-ai/recraft-v4', name: 'Recraft V4', provider: 'Recraft', price: 0.04, unit: '/image', tier: 'Standard', badge: 'bg-blue-500/20 text-blue-400' },
  { id: 'recraft-ai/recraft-v3', name: 'Recraft V3', provider: 'Recraft', price: 0.04, unit: '/image', tier: 'Standard', badge: 'bg-blue-500/20 text-blue-400' },
  { id: 'x-ai/grok-imagine', name: 'Grok Imagine', provider: 'xAI', price: 0.05, unit: '/image', tier: 'Standard', badge: 'bg-blue-500/20 text-blue-400' },
  { id: 'recraft-ai/recraft-v4-1-vector', name: 'Recraft V4.1 Vector', provider: 'Recraft', price: 0.08, unit: '/image', tier: 'Pro', badge: 'bg-purple-500/20 text-purple-400' },
  { id: 'recraft-ai/recraft-v4-vector', name: 'Recraft V4 Vector', provider: 'Recraft', price: 0.08, unit: '/image', tier: 'Pro', badge: 'bg-purple-500/20 text-purple-400' },
  { id: 'sourceful/riverflow-v2.5-pro', name: 'Riverflow V2.5 Pro', provider: 'Sourceful', price: 0.13, unit: '/image', tier: 'Pro', badge: 'bg-purple-500/20 text-purple-400' },
  { id: 'sourceful/riverflow-v2-pro', name: 'Riverflow V2 Pro', provider: 'Sourceful', price: 0.15, unit: '/image', tier: 'Pro', badge: 'bg-purple-500/20 text-purple-400' },
  { id: 'recraft-ai/recraft-v4-1-pro', name: 'Recraft V4.1 Pro', provider: 'Recraft', price: 0.21, unit: '/image', tier: 'Premium', badge: 'bg-amber-500/20 text-amber-400' },
  { id: 'recraft-ai/recraft-v4-1-utility-pro', name: 'Recraft V4.1 Utility Pro', provider: 'Recraft', price: 0.21, unit: '/image', tier: 'Premium', badge: 'bg-amber-500/20 text-amber-400' },
  { id: 'recraft-ai/recraft-v4-pro', name: 'Recraft V4 Pro', provider: 'Recraft', price: 0.25, unit: '/image', tier: 'Premium', badge: 'bg-amber-500/20 text-amber-400' },
  { id: 'recraft-ai/recraft-v4-1-pro-vector', name: 'Recraft V4.1 Pro Vector', provider: 'Recraft', price: 0.30, unit: '/image', tier: 'Premium', badge: 'bg-amber-500/20 text-amber-400' },
  { id: 'recraft-ai/recraft-v4-pro-vector', name: 'Recraft V4 Pro Vector', provider: 'Recraft', price: 0.30, unit: '/image', tier: 'Premium', badge: 'bg-amber-500/20 text-amber-400' },
  // Per-Token Pricing
  { id: 'google/gemini-3.1-flash-image', name: 'Gemini 3.1 Flash Image', provider: 'Google', price: 0.50, unit: '/M input', tier: 'Standard', badge: 'bg-blue-500/20 text-blue-400', tokenBased: true },
  { id: 'microsoft/mai-image-2.5', name: 'MAI-Image-2.5', provider: 'Microsoft', price: 5, unit: '/M tokens', tier: 'Pro', badge: 'bg-purple-500/20 text-purple-400', tokenBased: true },
  { id: 'google/gemini-3-pro-image', name: 'Gemini 3 Pro Image', provider: 'Google', price: 2, unit: '/M input', tier: 'Premium', badge: 'bg-amber-500/20 text-amber-400', tokenBased: true },
  { id: 'openai/gpt-image-1-mini', name: 'GPT Image 1 Mini', provider: 'OpenAI', price: 2.50, unit: '/M input', tier: 'Pro', badge: 'bg-purple-500/20 text-purple-400', tokenBased: true },
  { id: 'openai/gpt-image-2', name: 'GPT Image 2', provider: 'OpenAI', price: 8, unit: '/M input', tier: 'Premium', badge: 'bg-amber-500/20 text-amber-400', tokenBased: true },
  { id: 'openai/gpt-image-1', name: 'GPT Image 1', provider: 'OpenAI', price: 10, unit: '/M input', tier: 'Premium', badge: 'bg-amber-500/20 text-amber-400', tokenBased: true },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square', ratio: '1:1', width: 1024, height: 1024, display: 'w-10 h-10' },
  { id: '4:5', name: 'Portrait', ratio: '4:5', width: 819, height: 1024, display: 'w-8 h-10' },
  { id: '16:9', name: 'Landscape', ratio: '16:9', width: 1024, height: 576, display: 'w-12 h-7' }
];

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Cosmetics Campaign 2026',
    createdAt: '2026-07-01',
    prompt: 'Premium organic serum bottle on a wet concrete block, surrounding wild white flowers, luxury minimalist studio style, high-end commercial editorial, soft natural morning rays',
    negativePrompt: 'blurry, cheap, low quality, text, logos, hand, shadows, dark',
    settings: {
      aspectRatio: '4:5',
      quality: 'Ultra',
      outputs: 2,
      creativity: 65,
      promptStrength: 75,
      imageStrength: 50,
      seed: '458192039',
      stylePreset: 'luxury-perfume',
      provider: 'gemini'
    },
    references: [],
    generations: [
      {
        id: 'gen-1-1',
        url: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600',
        prompt: 'Premium organic serum bottle on a wet concrete block, surrounding wild white flowers...',
        timestamp: '2026-07-01 14:22',
        settings: { aspectRatio: '4:5', stylePreset: 'product' },
        favorite: true
      },
      {
        id: 'gen-1-2',
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
        prompt: 'Premium organic serum bottle on a wet concrete block, surrounding wild white flowers...',
        timestamp: '2026-07-01 14:22',
        settings: { aspectRatio: '4:5', stylePreset: 'product' },
        favorite: false
      }
    ]
  },
  {
    id: 'proj-2',
    name: 'Cybernetic Sneaker Design',
    createdAt: '2026-07-04',
    prompt: 'Future running shoe with holographic accents, neon glowing pipes, metallic titanium fibers, hyper-detailed cyberpunk aesthetic, photorealistic',
    negativePrompt: 'vintage, retro, old, drawing, cartoon',
    settings: {
      aspectRatio: '16:9',
      quality: 'Ultra',
      outputs: 1,
      creativity: 80,
      promptStrength: 85,
      imageStrength: 30,
      seed: '77210928',
      stylePreset: 'cinematic-scene',
      provider: 'replicate'
    },
    references: [],
    generations: [
      {
        id: 'gen-2-1',
        url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600',
        prompt: 'Future running shoe with holographic accents, neon glowing pipes...',
        timestamp: '2026-07-04 09:12',
        settings: { aspectRatio: '16:9', stylePreset: 'cinematic' },
        favorite: false
      }
    ]
  }
];

export default function ImageGenerator() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('workspace');
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState('proj-1');
  
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];
  const [prompt, setPrompt] = useState(currentProject.prompt);
  const [negativePrompt, setNegativePrompt] = useState(currentProject.negativePrompt);
  const [aspectRatio, setAspectRatio] = useState(currentProject.settings.aspectRatio);
  const [quality, setQuality] = useState(currentProject.settings.quality);
  const [outputs, setOutputs] = useState(currentProject.settings.outputs);
  const [creativity, setCreativity] = useState(currentProject.settings.creativity);
  const [promptStrength, setPromptStrength] = useState(currentProject.settings.promptStrength);
  const [imageStrength, setImageStrength] = useState(currentProject.settings.imageStrength);
  const [seed, setSeed] = useState(currentProject.settings.seed);
  const [stylePreset, setStylePreset] = useState(currentProject.settings.stylePreset);
  const [selectedProvider, setSelectedProvider] = useState(currentProject.settings.provider);

  const [referenceImages, setReferenceImages] = useState([]);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('free');
  const [selectedORModel, setSelectedORModel] = useState(OPENROUTER_MODELS[0].id);
  const [orApiKey, setOrApiKey] = useState(() => localStorage.getItem('imagegen_or_key') || '');
  const [pollinationsKey, setPollinationsKey] = useState('');
  const [apiErrorDetails, setApiErrorDetails] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(12);

  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [beforeAfterCompare, setBeforeAfterCompare] = useState(null);
  const [compareSliderPosition, setCompareSliderPosition] = useState(50);

  const [activeTemplate, setActiveTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({
    product: 'Luxury Hydration Mist',
    brand: 'Aetheria',
    style: 'Modern Luxury',
    background: 'minimalist light sand blocks',
    lighting: 'warm high-contrast side lighting',
    camera: 'Phase One 150MP Camera'
  });

  useEffect(() => {
    if (currentProject) {
      setPrompt(currentProject.prompt);
      setNegativePrompt(currentProject.negativePrompt);
      setAspectRatio(currentProject.settings.aspectRatio);
      setQuality(currentProject.settings.quality);
      setOutputs(currentProject.settings.outputs);
      setCreativity(currentProject.settings.creativity);
      setPromptStrength(currentProject.settings.promptStrength);
      setImageStrength(currentProject.settings.imageStrength);
      setSeed(currentProject.settings.seed);
      setStylePreset(currentProject.settings.stylePreset);
      setSelectedProvider(currentProject.settings.provider);
      setReferenceImages(currentProject.references || []);
    }
  }, [currentProjectId]);

  useEffect(() => {
    setProjects(prev => prev.map(proj => {
      if (proj.id === currentProjectId) {
        return {
          ...proj,
          prompt,
          negativePrompt,
          references: referenceImages,
          settings: {
            ...proj.settings,
            aspectRatio,
            quality,
            outputs,
            creativity,
            promptStrength,
            imageStrength,
            seed,
            stylePreset,
            provider: selectedProvider
          }
        };
      }
      return proj;
    }));
  }, [prompt, negativePrompt, referenceImages, aspectRatio, quality, outputs, creativity, promptStrength, imageStrength, seed, stylePreset, selectedProvider]);

  // نظام إعادة المحاولة الذكي مع التأخير الأسي (Exponential Backoff)
  const fetchWithRetry = async (url, options, retries = 5, delay = 1000) => {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status >= 500) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
      }
      return res;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  const handleReferenceUpload = (e) => {
    const files = Array.from(e.target.files);
    if (referenceImages.length + files.length > 10) {
      showToast("Maximum of 10 reference images allowed.", "error");
      return;
    }

    setIsUploadingRef(true);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages(prev => [
          ...prev, 
          {
            id: 'ref-' + Date.now() + Math.random().toString(36).substr(2, 5),
            url: reader.result,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          }
        ]);
        setIsUploadingRef(false);
        showToast(`Uploaded ${file.name} successfully.`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (referenceImages.length + files.length > 10) {
      showToast("Maximum of 10 reference images allowed.", "error");
      return;
    }
    setIsUploadingRef(true);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages(prev => [
          ...prev,
          {
            id: 'ref-' + Date.now() + Math.random().toString(36).substr(2, 5),
            url: reader.result,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          }
        ]);
        setIsUploadingRef(false);
        showToast(`Dropped ${file.name} successfully.`);
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteReference = (id) => {
    setReferenceImages(prev => prev.filter(img => img.id !== id));
    showToast("Reference image removed.");
  };

  const triggerGeneration = async () => {
    if (!prompt.trim()) {
      showToast("يرجى إدخال النص الوصفي أولاً.", "error");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    setApiErrorDetails(null);

    try {
      const presetData = STYLE_PRESETS.find(s => s.id === stylePreset);

      let enhancedPrompt;
      if (referenceImages.length > 0 && pollinationsKey) {
        setGenerationProgress(20);
        try {
          const firstRef = referenceImages[0];
          const parts = firstRef.url.split(',');
          const base64Data = parts[1] || '';
          const mimeMatch = parts[0]?.match(/data:(.*?);/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

          setGenerationProgress(35);
          const visionRes = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${pollinationsKey}`
            },
            body: JSON.stringify({
              model: 'qwen-vision',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert image analyst. Describe the image style concisely for recreating it in AI image generation.'
                },
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: 'Analyze the visual style of this reference image. Describe ONLY: colors, lighting, composition, mood, texture, camera angle. Return a short comma-separated description under 50 words.' },
                    { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
                  ]
                }
              ],
              max_tokens: 200
            })
          });

          if (!visionRes.ok) throw new Error(`Pollinations API error: ${visionRes.status}`);

          const visionData = await visionRes.json();
          const analysis = visionData.choices?.[0]?.message?.content || '';

          const cleanAnalysis = analysis.trim().replace(/^["']+|["']+$/g, '');
          enhancedPrompt = cleanAnalysis
            ? `${prompt}, ${presetData?.positive || ''}. Style reference: ${cleanAnalysis}`
            : (presetData ? `${prompt}, ${presetData.positive}` : prompt);
        } catch (e) {
          console.warn('Vision analysis via Pollinations skipped:', e.message);
          if (e.message?.includes('402')) {
            showToast('تحليل الصور يحتاج رصيد Pollen — أضف رصيد من enter.pollinations.ai أو أنجز المهام للحصول على رصيد مجاني', 'error');
          } else {
            showToast('تعذر تحليل الصورة المرجعية — تم التوليد باستخدام النص الوصفي فقط', 'error');
          }
          enhancedPrompt = presetData ? `${prompt}, ${presetData.positive}` : prompt;
        }
      } else {
        setGenerationProgress(25);
        try {
          const enhancePrompt = presetData
            ? `Enhance this AI image generation prompt by blending the user's idea with the style preset. Return ONLY the enhanced prompt, no explanation.\n\nUser prompt: ${prompt}\nStyle preset: ${presetData.positive}`
            : `Enhance this AI image generation prompt with more detail and quality keywords. Return ONLY the enhanced prompt, no explanation.\n\nUser prompt: ${prompt}`;
          const enhanceRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(enhancePrompt)}?model=openai`);
          if (enhanceRes.ok) {
            const enhancedText = await enhanceRes.text();
            enhancedPrompt = enhancedText.trim() || `${prompt}, ${presetData?.positive || ''}`;
          } else {
            enhancedPrompt = presetData ? `${prompt}, ${presetData.positive}` : prompt;
          }
        } catch (e) {
          enhancedPrompt = presetData ? `${prompt}, ${presetData.positive}` : prompt;
        }
      }

      // Step 2: Generate multiple images based on outputs count
      const [w, h] = (aspectRatio === '1:1' ? [1024, 1024]
        : aspectRatio === '4:5' ? [832, 1088]
        : aspectRatio === '16:9' ? [1216, 832]
        : aspectRatio === '9:16' ? [832, 1216]
        : aspectRatio === '3:2' ? [1216, 832]
        : [1024, 1024]);

      const numOutputs = Math.max(1, Math.min(4, parseInt(outputs) || 1));
      const newGenerations = [];

      if (mode === 'pro') {
        setGenerationProgress(50);
        if (!orApiKey) throw new Error('أدخل مفتاح OpenRouter API في الحقل أعلاه');
        const orRes = await fetch('https://openrouter.ai/api/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${orApiKey}`,
            'Content-Type': 'application/json',
            'X-Title': 'AI Tools Hub'
          },
          body: JSON.stringify({
            model: selectedORModel,
            prompt: enhancedPrompt,
            n: numOutputs,
            size: `${w}x${h}`
          })
        });
        if (!orRes.ok) {
          const errBody = await orRes.json().catch(() => ({}));
          throw new Error(`OpenRouter (${orRes.status}): ${errBody?.error?.message || orRes.statusText}`);
        }
        const orData = await orRes.json();
        const urls = (orData.data || []).map(d => d.url).filter(Boolean);
        urls.forEach((url, i) => {
          newGenerations.push({
            id: 'gen-' + Date.now() + '-' + i,
            url,
            prompt,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            settings: { aspectRatio, stylePreset, quality, creativity },
            favorite: false
          });
        });
        if (newGenerations.length === 0) throw new Error('OpenRouter لم يُرجع أي صور.');
      } else {
        for (let i = 0; i < numOutputs; i++) {
          setGenerationProgress(40 + Math.round((i / numOutputs) * 45));

          const imgSeed = Math.floor(Math.random() * 1000000);
          const safePrompt = encodeURIComponent(enhancedPrompt).slice(0, 1800);
          const safeNegative = negativePrompt ? `&negative=${encodeURIComponent(negativePrompt).slice(0, 400)}` : '';

          let imgUrl;
          if (pollinationsKey) {
            imgUrl = `https://gen.pollinations.ai/image/${safePrompt}?model=flux&key=${pollinationsKey}&width=${w}&height=${h}&seed=${imgSeed}&nologo=true${safeNegative}`;
          } else {
            imgUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=${w}&height=${h}&seed=${imgSeed}&nologo=true&enhance=true${safeNegative}`;
          }

          newGenerations.push({
            id: 'gen-' + Date.now() + '-' + i,
            url: imgUrl,
            prompt: prompt,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            settings: { aspectRatio, stylePreset, quality, creativity },
            favorite: false
          });
        }
      }

      setGenerationProgress(90);

      setProjects(prev => prev.map(proj => {
        if (proj.id === currentProjectId) {
          return { ...proj, generations: [...newGenerations, ...proj.generations] };
        }
        return proj;
      }));

      setGenerationProgress(100);
      showToast(`تم توليد ${numOutputs} صورة بنجاح!`);

    } catch (err) {
      setApiErrorDetails({
        provider: 'pollinations',
        message: err.message || "حدث خطأ أثناء التوليد.",
        timestamp: new Date().toLocaleTimeString()
      });
      showToast("فشلت عملية التوليد.", "error");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const toggleFavorite = (genId) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id === currentProjectId) {
        return {
          ...proj,
          generations: proj.generations.map(gen => 
            gen.id === genId ? { ...gen, favorite: !gen.favorite } : gen
          )
        };
      }
      return proj;
    }));
    showToast("Gallery updated successfully.");
  };

  const deleteGeneration = (genId) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id === currentProjectId) {
        return {
          ...proj,
          generations: proj.generations.filter(gen => gen.id !== genId)
        };
      }
      return proj;
    }));
    showToast("Generation permanently removed.");
  };

  const createNewProject = () => {
    const newId = 'proj-' + Date.now();
    const newProj = {
      id: newId,
      name: `Studio Concept #${projects.length + 1}`,
      createdAt: new Date().toISOString().substring(0, 10),
      prompt: 'Clean professional layout of luxurious skincare products on minimalist glass pillars',
      negativePrompt: 'noisy, text, watermark, bad lighting',
      settings: {
        aspectRatio: '1:1',
        quality: 'Standard',
        outputs: 1,
        creativity: 50,
        promptStrength: 75,
        imageStrength: 40,
        seed: Math.floor(Math.random() * 99999999).toString(),
        stylePreset: 'photorealistic',
        provider: 'gemini'
      },
      references: [],
      generations: []
    };
    setProjects([newProj, ...projects]);
    setCurrentProjectId(newId);
    showToast("Created new workspace environment.");
  };

  const applyTemplate = () => {
    let replaced = activeTemplate.template;
    Object.keys(templateVariables).forEach(key => {
      replaced = replaced.replace(new RegExp(`{{${key}}}`, 'g'), templateVariables[key]);
    });
    setPrompt(replaced);
    setActiveTemplate(null);
    showToast("Applied design prompt template!");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied content to clipboard!");
  };

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-[#0b0c10] text-[#f4f5f7]' : 'bg-[#f7f9fc] text-[#1a1f2c]'}`}>
      
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded-xl shadow-xl flex items-center justify-between border backdrop-blur-md transition-all animate-bounce ${
              t.type === 'error' 
                ? 'bg-rose-500/25 border-rose-500 text-rose-100' 
                : 'bg-emerald-500/25 border-emerald-500 text-emerald-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{t.message}</span>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="ml-3 hover:opacity-85 text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <header className={`sticky top-0 z-40 px-6 py-4 border-b backdrop-blur-md flex items-center justify-between ${theme === 'dark' ? 'bg-[#0f111a]/85 border-[#1f2335]' : 'bg-white/85 border-[#e2e8f0]'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 p-2.5 rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">IMAGINE STUDIO</h1>
              <span className="text-[10px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO AI</span>
            </div>
            <p className="text-xs text-gray-400">Enterprise Image Generation Engine</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-gray-950/40 p-1.5 rounded-xl border border-gray-800/60">
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'workspace' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Sliders className="w-4 h-4" />
            Workspace
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'projects' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Folder className="w-4 h-4" />
            Projects ({projects.length})
          </button>
          <button 
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'prompts' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <BookOpen className="w-4 h-4" />
            Prompt Library
          </button>
          <button 
            onClick={() => setActiveTab('developer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'developer' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Code className="w-4 h-4" />
            Developer Hub
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] text-gray-400">CURRENT PROJECT</span>
            <span className="text-sm font-semibold text-indigo-400">{currentProject.name}</span>
          </div>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl border border-gray-800 hover:bg-gray-800/40 text-gray-300 transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-2.5 rounded-xl border transition-all ${activeTab === 'settings' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-800 hover:bg-gray-800/40 text-gray-300'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        
        <div className="flex lg:hidden items-center justify-around bg-gray-950/40 p-1.5 rounded-xl border border-gray-800/60 mb-6">
          <button onClick={() => setActiveTab('workspace')} className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${activeTab === 'workspace' ? 'text-indigo-400' : 'text-gray-400'}`}>
            <Sliders className="w-4 h-4" />
            <span>Workspace</span>
          </button>
          <button onClick={() => setActiveTab('projects')} className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${activeTab === 'projects' ? 'text-indigo-400' : 'text-gray-400'}`}>
            <Folder className="w-4 h-4" />
            <span>Projects</span>
          </button>
          <button onClick={() => setActiveTab('prompts')} className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${activeTab === 'prompts' ? 'text-indigo-400' : 'text-gray-400'}`}>
            <BookOpen className="w-4 h-4" />
            <span>Library</span>
          </button>
          <button onClick={() => setActiveTab('developer')} className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${activeTab === 'developer' ? 'text-indigo-400' : 'text-gray-400'}`}>
            <Code className="w-4 h-4" />
            <span>Dev Hub</span>
          </button>
        </div>

        {activeTab === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-[#121420] border border-gray-800 p-1 rounded-2xl flex">
                <button
                  onClick={() => setMode('free')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'free' ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  🆓 مجاني (Pollinations)
                </button>
                <button
                  onClick={() => setMode('pro')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'pro' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  💎 OpenRouter
                </button>
              </div>

              {mode === 'pro' && (
                <div className="bg-[#121420] border border-gray-800 p-4 rounded-2xl space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1.5">🔑 مفتاح OpenRouter API</label>
                    <input
                      type="password"
                      value={orApiKey}
                      onChange={(e) => { setOrApiKey(e.target.value); localStorage.setItem('imagegen_or_key', e.target.value); }}
                      placeholder="sk-or-v1-..."
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <label className="text-xs font-semibold text-gray-400 block">اختر الموديل</label>
                  <select
                    value={selectedORModel}
                    onChange={(e) => setSelectedORModel(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {OPENROUTER_MODELS.map(m => (
                      <option key={m.id} value={m.id} className="bg-gray-950">
                        {m.provider} — {m.name} (${m.price}{m.unit})
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const mdl = OPENROUTER_MODELS.find(m => m.id === selectedORModel);
                    if (!mdl) return null;
                    const num = parseInt(outputs) || 1;
                    const total = mdl.price * num;
                    return (
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${mdl.badge}`}>{mdl.tier}</span>
                        <span className="text-gray-400">
                          {mdl.tokenBased
                            ? `~$${total.toFixed(2)} (تقديري)`
                            : `$${total.toFixed(2)} لـ ${num} صور`}
                        </span>
                      </div>
                    );
                  })()}
                  {!orApiKey && (
                    <p className="text-[10px] text-amber-400 mt-1">أدخل مفتاح OpenRouter API أعلاه</p>
                  )}
                </div>
              )}

              <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 p-2 rounded-lg">
                    <Folder className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xs text-gray-400">ACTIVE PROJECT BOARD</h3>
                    <select 
                      value={currentProjectId} 
                      onChange={(e) => setCurrentProjectId(e.target.value)}
                      className="bg-transparent border-none text-sm font-semibold text-white focus:ring-0 p-0 cursor-pointer hover:text-indigo-300"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#121421] text-white">{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={createNewProject}
                  className="bg-indigo-600/30 border border-indigo-500/30 hover:bg-indigo-600 text-indigo-200 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </button>
              </div>

              <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#121420] border-[#1e2335]' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-semibold">Describe Your Visual Scene</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setPrompt(''); showToast("Cleared prompt input."); }}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                    <button 
                      onClick={() => handleCopyToClipboard(prompt)}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                      title="Copy Prompt"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: Raw extreme macro close-up of luxurious moisturizing cream textures, dripping on smooth wet basalt stones, cinematic bright lighting, minimal, 8k..."
                  rows={4}
                  className={`w-full text-sm p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme === 'dark' ? 'bg-[#0f111a] border-gray-800 text-white placeholder-gray-500' : 'bg-[#f8fafc] border-gray-300 text-gray-800 placeholder-gray-400'}`}
                />

                <div className="flex items-center justify-between mt-2.5 text-xs text-gray-400">
                  <span>Supports: English, French, Arabic</span>
                  <span>{prompt.length} characters</span>
                </div>

                <div className="mt-5">
                  <span className="text-xs font-semibold text-gray-400 block mb-2">STYLE PRESETS</span>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {STYLE_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => { setStylePreset(preset.id); showToast(`Applied preset style: ${preset.name}`); }}
                        className={`p-2 rounded-xl text-left border transition-all text-xs flex items-center gap-2 ${
                          stylePreset === preset.id 
                            ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                            : 'border-gray-800 hover:border-gray-700 bg-gray-900/35 text-gray-400'
                        }`}
                      >
                        <span className="text-base">{preset.icon}</span>
                        <div className="truncate">
                          <p className="font-medium truncate">{preset.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#121420] border-[#1e2335]' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold">Visual References ({referenceImages.length}/10)</span>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Image-to-Image Engine</span>
                </div>

                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-800 rounded-xl p-5 text-center cursor-pointer hover:border-emerald-500/60 transition-all bg-gray-950/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    multiple 
                    onChange={handleReferenceUpload}
                    className="hidden" 
                    accept="image/*"
                  />
                  <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-300 font-medium">Drag & drop or click to upload references</p>
                  <p className="text-[10px] text-gray-500 mt-1">Supports JPG, PNG, WEBP (Max 10 images, automatic optimization)</p>
                </div>

                {referenceImages.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {referenceImages.map((img, idx) => (
                      <div key={img.id} className="p-2 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate">
                          <img src={img.url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="ref" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-white truncate">{img.name}</p>
                            <p className="text-[10px] text-gray-500">Ref #{idx+1} • {img.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setActivePreviewImage(img.url)}
                            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
                            title="Preview Ref"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => deleteReference(img.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#121420] border-[#1e2335]' : 'bg-white border-gray-200'} space-y-5`}>
                <div className="flex items-center justify-between pb-2 border-b border-gray-800/40">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold">Generation Settings</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-2">ASPECT RATIO / DIMENSION</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map(ratio => (
                      <button
                        key={ratio.id}
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`p-3 rounded-xl border transition-all text-xs flex flex-col items-center justify-center gap-2 ${
                          aspectRatio === ratio.id 
                            ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                            : 'border-gray-800 hover:border-gray-700 bg-gray-900/35 text-gray-400'
                        }`}
                      >
                        <div className={`${ratio.display} rounded border-2 border-current opacity-70`}></div>
                        <span>{ratio.name} ({ratio.ratio})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-400">CREATIVITY SLIDER</span>
                      <span className="text-indigo-400">{creativity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={creativity} onChange={(e) => setCreativity(e.target.value)} className="w-full accent-indigo-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-400">PROMPT STRENGTH (CFG)</span>
                      <span className="text-purple-400">{promptStrength}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={promptStrength} onChange={(e) => setPromptStrength(e.target.value)} className="w-full accent-purple-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  {referenceImages.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-gray-400 flex items-center gap-1">REFERENCE INFLUENCE <HelpCircle className="w-3 h-3" /></span>
                        <span className="text-emerald-400">{imageStrength}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={imageStrength} onChange={(e) => setImageStrength(e.target.value)} className="w-full accent-emerald-500 bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-800/40 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 tracking-wider block mb-2 uppercase">المزوّد النشط</label>
                    <div className="p-3 rounded-xl border border-gray-800 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${mode === 'pro' ? 'bg-purple-400' : 'bg-emerald-400'}`}></div>
                      <span className="text-sm font-semibold text-white">{mode === 'pro' ? '💎 OpenRouter' : '🆓 Pollinations (مجاني)'}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">غيّر من الأعلى: 🆓 مجاني / 💎 OpenRouter</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">POLLINATIONS API KEY (للتحليل البصري)</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={pollinationsKey}
                        onChange={(e) => setPollinationsKey(e.target.value)}
                        placeholder="sk_..."
                        className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 flex-grow font-mono"
                      />
                      <button
                        onClick={() => setPollinationsKey('sk_7aJWTZGZ19kX4b8WHNaMCcLGBVnsjtMr')}
                        className="px-3 py-1.5 bg-emerald-600/30 border border-emerald-500/30 hover:bg-emerald-600 text-emerald-200 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap"
                        title="Use saved key"
                      >
                        <Key className="w-3 h-3 inline mr-1" />Auto-fill
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">مطلوب لتحليل الصور المرجعية. احصل عليه من enter.pollinations.ai</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/40 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">OPTIONAL SEED INPUT</label>
                    <div className="flex gap-2">
                      <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Random Seed (e.g. 192801)" className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 flex-grow" />
                      <button onClick={() => { const s = Math.floor(Math.random() * 999999999).toString(); setSeed(s); showToast(`Generated Seed: ${s}`); }} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-semibold text-gray-300">
                        <Shuffle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">NEGATIVE PROMPT (THINGS TO AVOID)</label>
                    <textarea value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="blurry, deformed, ugly, logo, text overlay, extra limbs, bad lighting..." rows={2} className="w-full text-xs p-3 rounded-lg bg-gray-950 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <button
                onClick={triggerGeneration}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-bold rounded-2xl shadow-xl hover:shadow-indigo-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Rendering Frame ({generationProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-indigo-200" />
                    <span>Ignite Image Generator</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {isGenerating && (
                <div className="bg-[#121420] border border-indigo-500/40 p-6 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-4 w-4 rounded-full bg-indigo-400 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Synthesizing Creative Canvas</h3>
                        <p className="text-xs text-gray-400">Processing noise vectors via {selectedProvider.toUpperCase()} model</p>
                      </div>
                    </div>
                    <button onClick={() => { setIsGenerating(false); showToast("Generation workflow canceled.", "error"); }} className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg hover:bg-rose-500/40 transition-all">Cancel Frame</button>
                  </div>
                  <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden border border-gray-800">
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Estimated Remaining Time: ~{estimatedTime}s</span>
                    <span>Status: High-fidelity upscale phase</span>
                  </div>
                </div>
              )}

              <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#121420] border-[#1e2335]' : 'bg-white border-gray-200'} min-h-[500px] flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800/40">
                    <div>
                      <h2 className="text-base font-semibold text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-pink-400" />
                        Generations Gallery
                      </h2>
                      <p className="text-xs text-gray-400">Output history for active project workspace</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentProject)); const downloadAnchor = document.createElement('a'); downloadAnchor.setAttribute("href", dataStr); downloadAnchor.setAttribute("download", `${currentProject.name}-export.json`); document.body.appendChild(downloadAnchor); downloadAnchor.click(); downloadAnchor.remove(); showToast("Exported project dataset JSON."); }} className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg text-xs font-medium text-gray-300 flex items-center gap-1.5" title="Export prompt & image metadata JSON">
                        <Download className="w-3.5 h-3.5" /> Export Data
                      </button>
                    </div>
                  </div>

                  {currentProject.generations.length === 0 ? (
                    <div className="text-center py-24 space-y-4">
                      <div className="bg-gray-950/40 border border-gray-800 inline-flex p-6 rounded-full text-indigo-400 mb-2">
                        <Sparkles className="w-10 h-10" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200">Your Creative Canvas is Blank</h3>
                      <p className="text-sm text-gray-400 max-w-sm mx-auto">Input your description parameters, adjust style parameters on the left, and let the AI compile custom design pieces for you.</p>
                      <div className="pt-2">
                        <button onClick={() => { setPrompt("Raw realistic professional commercial shot of futuristic watch lying inside illuminated blue pool of crystal water, hyperdetailed, 8k resolution"); setStylePreset("luxury-perfume"); showToast("Applied quick starter prompt!"); }} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline">
                          ✨ Load a high-converting sample prompt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentProject.generations.map(gen => (
                        <div key={gen.id} className="group relative rounded-xl overflow-hidden bg-gray-950 border border-gray-800 hover:border-indigo-500/50 transition-all duration-300">
                          <div className="aspect-square w-full overflow-hidden relative bg-black">
                            <img src={gen.url} alt="Generation" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col justify-between">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => toggleFavorite(gen.id)} className={`p-2 rounded-lg backdrop-blur-md border border-white/10 text-white ${gen.favorite ? 'bg-pink-500 text-white' : 'bg-black/40 hover:bg-black/60'}`} title="Add to Favorites">
                                  <Heart className={`w-4 h-4 ${gen.favorite ? 'fill-current' : ''}`} />
                                </button>
                                <button onClick={() => handleCopyToClipboard(gen.prompt)} className="p-2 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white" title="Copy Prompt Parameters">
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[11px] text-gray-200 line-clamp-2 italic">"{gen.prompt}"</p>
                                <div className="flex items-center justify-between text-[10px] text-gray-400">
                                  <span>Ratio: {gen.settings.aspectRatio}</span>
                                  <span>{gen.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-[#0e1017] border-t border-gray-800/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{gen.settings.stylePreset || 'Style'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {referenceImages.length > 0 && (
                                <button onClick={() => setBeforeAfterCompare({ reference: referenceImages[0].url, generated: gen.url })} className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-[10px] transition-all flex items-center gap-1" title="Compare outputs alongside your loaded reference image">
                                  <Columns className="w-3 h-3" /> Compare
                                </button>
                              )}
                              <button onClick={() => setActivePreviewImage(gen.url)} className="p-1 text-gray-400 hover:text-white" title="Expand View">
                                <Maximize2 className="w-4 h-4" />
                              </button>
                              <a href={gen.url} download={`ImagineStudio-${gen.id}.png`} className="p-1 text-gray-400 hover:text-white" title="Download PNG">
                                <Download className="w-4 h-4" />
                              </a>
                              <button onClick={() => deleteGeneration(gen.id)} className="p-1 text-gray-400 hover:text-rose-400" title="Delete Frame">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {currentProject.generations.length > 0 && (
                  <div className="pt-6 border-t border-gray-800/40 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>Generated on platform: {currentProject.generations.length} images this session</span>
                    <button onClick={() => { setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, generations: [] } : p)); showToast("Cleared project gallery."); }} className="text-rose-400 hover:text-rose-300 font-medium">Clear active project gallery</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Your Workspace Boards & Projects</h2>
                <p className="text-sm text-gray-400">Isolated creative environments with self-contained reference sets and settings presets</p>
              </div>
              <button onClick={createNewProject} className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-lg">
                <Plus className="w-4 h-4" /> Create New Workspace
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(proj => (
                <div key={proj.id} className={`p-6 rounded-2xl border transition-all duration-300 ${currentProjectId === proj.id ? 'border-indigo-500 bg-[#121420] ring-1 ring-indigo-500/20' : 'border-gray-800 bg-[#0e1017] hover:border-gray-700'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{proj.name}</h3>
                        <p className="text-xs text-gray-500">Created on {proj.createdAt}</p>
                      </div>
                    </div>
                    {currentProjectId === proj.id && (
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-3 italic mb-4">"{proj.prompt}"</p>
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-800/40 text-xs text-gray-400 mb-4">
                    <div><span className="block text-[10px] text-gray-500">SETTINGS</span><span>{proj.settings.aspectRatio} • CFG {proj.settings.promptStrength}</span></div>
                    <div><span className="block text-[10px] text-gray-500">GENERATIONS</span><span className="text-white font-medium">{proj.generations.length} total images</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setCurrentProjectId(proj.id); setActiveTab('workspace'); showToast(`Switched into workspace: ${proj.name}`); }} className="flex-grow py-2 bg-indigo-600/25 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                      Open Workspace Board <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (projects.length <= 1) { showToast("Cannot delete the last remaining project.", "error"); return; } setProjects(prev => prev.filter(p => p.id !== proj.id)); if (currentProjectId === proj.id) { setCurrentProjectId(projects.find(p => p.id !== proj.id).id); } showToast(`Deleted ${proj.name}`); }} className="p-2 border border-gray-800 hover:bg-rose-500/20 hover:border-rose-500/30 rounded-xl text-gray-400 hover:text-rose-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Advanced Prompt Template Engine</h2>
              <p className="text-sm text-gray-400">Select parameterized templates with variables ready to compile highly predictable product & marketing outputs</p>
            </div>
            <div className="space-y-8">
              {PROMPT_TEMPLATES.map(cat => (
                <div key={cat.category} className="space-y-4">
                  <h3 className="text-sm font-bold text-indigo-400 tracking-wider uppercase">{cat.category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.items.map(item => (
                      <div key={item.name} className="p-5 rounded-2xl bg-[#121420] border border-gray-800 space-y-4 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-white mb-2">{item.name}</h4>
                          <p className="text-xs text-gray-400 leading-relaxed italic">"{item.template}"</p>
                        </div>
                        <button onClick={() => { setActiveTemplate(item); showToast(`Configuring variables for ${item.name}`); }} className="w-full py-2 bg-indigo-600/35 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Customize Variables & Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#121420] border border-[#1f2335] space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Studio Customizations</h2>
              <p className="text-xs text-gray-400">Fine-tune system features and secure your private API keys</p>
            </div>
            <div className="space-y-4 pb-6 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">مفتاح API</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-indigo-400">🆓 مجاني (Pollinations):</strong> ما يحتاج مفتاح — اكتب وصف وضغط Generate.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">
                <strong className="text-purple-400">💎 OpenRouter:</strong> أدخل مفتاح OpenRouter API في الواجهة الرئيسية.
              </p>
              <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-4 flex items-start gap-3">
                <Key className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white mb-1">مفتاح OpenRouter</p>
                  <p className="text-[11px] text-gray-400">
                    احصل على مفتاح API من <strong className="text-indigo-400">openrouter.ai/keys</strong>، اشترِ رصيدك هناك، والصق المفتاح في حقل "🔑 مفتاح OpenRouter API" في الأعلى.
                  </p>
                </div>
              </div>
              {orApiKey ? (
                <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300">مفتاح OpenRouter موجود — جاهز للتوليد.</span>
                </div>
              ) : (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-300">لم يتم إدخال مفتاح OpenRouter بعد — الـ Free mode شغال بدون مفتاح.</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">إعدادات المعرض والعرض</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">لغة الواجهة</label>
                  <select className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"><option>العربية (Arabic)</option><option>English (US)</option><option>Français</option></select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">الحد الأقصى لسجل الصور</label>
                  <select className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"><option>50 صورة</option><option>100 صورة</option><option>غير محدود</option></select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#121420] border border-indigo-900/40">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Database Schema & PostgreSQL Migration Scripts</h2>
              </div>
              <p className="text-xs text-gray-400">Enterprise migration scripts designed for your Supabase PostgreSQL stack.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-xl bg-gray-950 border border-gray-800">
                  <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" /> Production Directory Structure
                  </h3>
                  <pre className="text-[10.5px] leading-relaxed text-indigo-300 font-mono overflow-x-auto">
{`imagine-studio-app/
├── prisma/
│   └── schema.prisma
├── supabase/
│   ├── migrations/
│   └── config.toml
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   └── projects/
│   │   │       └── route.ts
│   │   ├── dashboard/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── PromptInput.tsx
│   │   ├── RefUploader.tsx
│   │   └── ResultGallery.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   └── providers/
│   │       ├── gemini-adapter.ts
│   │       └── replicate-adapter.ts
└── package.json`}
                  </pre>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-xl bg-gray-950 border border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-amber-400" /> migration.sql (Supabase DDL Script)
                    </h3>
                    <button onClick={() => handleCopyToClipboard(`-- Migration script for PostgreSQL / Supabase schema ...`)} className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold">Copy SQL</button>
                  </div>
                  <pre className="text-xs text-emerald-400 font-mono overflow-x-auto p-4 rounded bg-black/50 leading-relaxed max-h-[420px] overflow-y-auto">
{`-- Create user profile matching Supabase Authentication uuid
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(120),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Project entities grouping generations
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Image generation configs
CREATE TABLE IF NOT EXISTS project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  aspect_ratio VARCHAR(12) DEFAULT '1:1',
  quality VARCHAR(24) DEFAULT 'Standard',
  provider VARCHAR(60) DEFAULT 'gemini',
  creativity INTEGER DEFAULT 50,
  prompt_strength INTEGER DEFAULT 75,
  image_strength INTEGER DEFAULT 40,
  seed VARCHAR(255)
);

-- Reference image schemas (Image-to-image inputs)
CREATE TABLE IF NOT EXISTS reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size VARCHAR(120),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Generated historical artifact images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  seed VARCHAR(255),
  is_favorite BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {activePreviewImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button onClick={() => setActivePreviewImage(null)} className="absolute top-5 right-5 p-3 rounded-full bg-gray-900/60 hover:bg-gray-800 text-white"><X className="w-6 h-6" /></button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-gray-800">
            <img src={activePreviewImage} className="w-full h-auto max-h-[85vh] object-contain mx-auto" alt="Preview Expanded" />
          </div>
        </div>
      )}

      {beforeAfterCompare && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <button onClick={() => setBeforeAfterCompare(null)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-900/60 hover:bg-gray-800 text-white z-10"><X className="w-5 h-5" /></button>
            <h3 className="text-sm font-semibold text-white mb-1">Visual Reference Comparison</h3>
            <p className="text-xs text-gray-400 mb-4">Compare source reference alignment against final synthesized output frame</p>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden select-none bg-black">
              <img src={beforeAfterCompare.generated} className="absolute inset-0 w-full h-full object-cover" alt="Generated" />
              <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${compareSliderPosition}%` }}>
                <img src={beforeAfterCompare.reference} className="absolute inset-y-0 left-0 w-full h-full object-cover" style={{ width: '100%', maxWidth: 'none', height: '100%' }} alt="Reference" />
              </div>
              <div className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center" style={{ left: `${compareSliderPosition}%` }}>
                <div className="w-8 h-8 rounded-full bg-white text-black shadow-lg flex items-center justify-center font-bold text-sm pointer-events-none select-none">↔</div>
              </div>
              <input type="range" min="0" max="100" value={compareSliderPosition} onChange={(e) => setCompareSliderPosition(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" />
              <span className="absolute bottom-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold rounded">Reference Input</span>
              <span className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold rounded">AI Synthesized Output</span>
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">Drag your cursor left or right across the image canvas to interactively view composition changes</div>
          </div>
        </div>
      )}

      {/* نافذة تشخيص الأخطاء التفصيلية للـ API */}
      {apiErrorDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121420] border-2 border-rose-500 p-6 rounded-2xl space-y-6 shadow-2xl shadow-rose-500/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/15 rounded-xl text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">فشل الاتصال بالمزود السحابي</h3>
                  <p className="text-xs text-gray-400">{apiErrorDetails.timestamp}</p>
                </div>
              </div>
              <button onClick={() => setApiErrorDetails(null)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-black/40 rounded-xl border border-gray-800">
                <span className="text-[10px] text-gray-500 block uppercase font-bold mb-1">تفاصيل الخطأ من {apiErrorDetails.provider.toUpperCase()}</span>
                <p className="text-xs font-mono text-rose-300 leading-relaxed break-words">{apiErrorDetails.message}</p>
              </div>
              <div className="space-y-2 text-xs text-gray-400">
                <p className="font-semibold text-gray-200">الحلول المقترحة:</p>
                <ul className="list-disc pr-4 space-y-1">
                  <li>اختر موديلاً مخصصاً لتوليد الصور من قائمة الموديلات (مثلاً: FLUX، Nano Banana، GPT Image)</li>
                  <li>تحقق من صحة مفتاح API في شريط الأدوات العلوي</li>
                  <li>تأكد من رصيد كافٍ في حساب المزوّد</li>
                  <li>حجم الصورة المرجعية قد يتجاوز الحد المسموح (حاول استخدام صورة أصغر)</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setApiErrorDetails(null); triggerGeneration(); }} className="flex-grow py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all">
                إعادة المحاولة
              </button>
              <button onClick={() => setApiErrorDetails(null)} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-all">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTemplate && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121420] border border-gray-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Setup Template Variables</h3>
                <p className="text-xs text-gray-400">Fill standard brand specifications to customize prompt outputs</p>
              </div>
              <button onClick={() => setActiveTemplate(null)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {['product', 'brand', 'style', 'background', 'lighting', 'camera'].map(variable => (
                <div key={variable}>
                  <label className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">{variable}</label>
                  <input type="text" value={templateVariables[variable] || ''} onChange={(e) => setTemplateVariables(prev => ({ ...prev, [variable]: e.target.value }))} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder={`e.g. ${variable}`} />
                </div>
              ))}
            </div>
            <button onClick={applyTemplate} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all">Compile & Inject into Prompt Box</button>
          </div>
        </div>
      )}

      <footer className="text-center py-10 text-xs text-gray-500 space-y-1">
        <p>© 2026 Imagine Studio. Built with React — Pollinations (🆓) + OpenRouter (💎).</p>
        <p>Enterprise layout. Fully compliant with SOLID clean architecture guidelines.</p>
      </footer>
    </div>
  );
}
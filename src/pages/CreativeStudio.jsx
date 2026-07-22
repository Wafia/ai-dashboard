import { useState } from 'react';
import { Upload, Sparkles, Copy, Check, Camera, User, Loader2, Zap, Layout, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchAI } from '../utils/ai';

const STYLES = [
  { id: 'luxury', label: 'Luxury', icon: Sparkles, color: 'amber', desc: 'إعلان فاخر بإضاءة دافئة وخلفية غنية' },
  { id: 'realistic', label: 'Realistic', icon: Camera, color: 'blue', desc: 'تصوير طبيعي واقعي بإضاءة نهارية ناعمة' },
  { id: 'commercial', label: 'Commercial', icon: Zap, color: 'emerald', desc: 'تصوير تجاري احترافي بخلفية نظيفة' },
  { id: 'lifestyle', label: 'Lifestyle', icon: User, color: 'rose', desc: 'إعلان بأسلوب حياة طبيعي وجذاب' },
  { id: 'minimal', label: 'Minimal', icon: Layout, color: 'purple', desc: 'تصوير مينيمالي بتركيز على التفاصيل' },
  { id: 'cinematic', label: 'Cinematic', icon: ImageIcon, color: 'indigo', desc: 'إعلان سينمائي بأجواء درامية' },
];

const COLOR_MAP = {
  amber: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-500', btn: 'bg-amber-100 hover:bg-amber-200 text-amber-700' },
  blue: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-500', btn: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
  emerald: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-500', btn: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' },
  rose: { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-500', btn: 'bg-rose-100 hover:bg-rose-200 text-rose-700' },
  purple: { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-500', btn: 'bg-purple-100 hover:bg-purple-200 text-purple-700' },
  indigo: { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-500', btn: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' },
};

export default function CreativeStudio({ apiKey, model, customEndpoint, providerId }) {
  const [productImg, setProductImg] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);
  const [productDesc, setProductDesc] = useState('');
  const [avatarDesc, setAvatarDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const compressImage = (dataUrl, maxW, quality) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const w = Math.min(img.width, maxW);
        const h = img.height * (w / img.width);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result, 800, 0.7);
      const img = { base64: compressed.split(',')[1], mimeType: 'image/jpeg', preview: reader.result };
      if (type === 'product') setProductImg(img);
      else setAvatarImg(img);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!productImg || !avatarImg) return;
    setError(null);
    setLoading(true);
    setResults(null);

    const sys = `[ROLE]
You are a world-class Creative Director and professional photographer. You specialize in creating ultra-realistic AI image prompts that produce images indistinguishable from professional photography.

[ARCHITECTURE - EXECUTE ALL LAYERS]

=== LAYER 1: VISUAL FORENSICS ===
Analyze the product image:
- Product type, exact shape, silhouette, proportions
- Exact colors, materials (leather/metal/fabric/rubber/plastic/glass/wood), finish (matte/gloss/brushed/polished/textured)
- Surface details: engravings, stitching, patterns, logos, texture
- Scale and dimensions
- ABSOLUTE PRODUCT LOCK: preserve all details, no redesign, no new elements, no removed elements

Analyze the avatar image:
- Face structure, body shape, skin tone, hair color and style
- Age range, gender, fashion style, pose, expression
- Occupation signals, lifestyle signals

=== LAYER 2: PRODUCT + AVATAR INTEGRATION ===
- Correct scale of product relative to avatar's body
- Correct placement and contact points
- Correct perspective matching
- Correct shadow and reflection matching
- Seamless, natural integration (not superimposed)

=== LAYER 3: PROMPT ARCHITECTURE ===
For each of the 6 styles below, build a complete prompt with:
[SCENE] environment and atmosphere
[SUBJECT] avatar (appearance, pose, expression, styling)
[PRODUCT] product placed naturally on/near the avatar
[COMPOSITION] precise camera angle, height, focal length, aperture, lens
[LIGHTING] exact lighting setup with modifiers and positioning
[MATERIALS] surface qualities with technical precision
[COLOR] color grade and palette
[STYLE VIBE] the specific mood of this style
[QUALITY] Ultra realistic, 8K, high detail, professional photography, soft shadows, volumetric
[INSTRUCTION] do not redesign the product, keep original details, match lighting, shadows, perspective and scale perfectly

THE 6 STYLES:
1. LUXURY: Warm rim lighting, opulent interior, mahogany/marble, status-focused
2. REALISTIC: Overcast natural daylight, modern city sidewalk/office, authentic
3. COMMERCIAL: High-key studio lighting, neutral grey gradient background, sales-focused
4. LIFESTYLE: Golden hour sunlight, upscale cafe terrace or living space, aspirational
5. MINIMAL: Dramatic side lighting (chiaroscuro), dark textured matte surface, geometry-focused
6. CINEMATIC: Blue hour atmospheric with neon accents, rainy metropolitan street, narrative-driven

Output ONLY valid JSON with this exact structure (NO markdown, NO code fences):
{"productAnalysis":"","avatarAnalysis":"","luxuryPrompt":"","realisticPrompt":"","commercialPrompt":"","lifestylePrompt":"","minimalPrompt":"","cinematicPrompt":""}`;

    const usr = `I give you two images: PRODUCT IMAGE and AVATAR IMAGE (a person).

Product Description (for reference): ${productDesc || 'Analyze from the image'}
Avatar Description (for reference): ${avatarDesc || 'Analyze from the image'}

Execute the 3-layer analysis and generate 6 professional prompts. Output ONLY valid JSON.`;

    try {
      const raw = await fetchAI({
        apiKey, provider: providerId || 'nvidia', model: model || 'deepseek-ai/deepseek-v4-flash', customEndpoint,
        prompt: usr,
        images: [productImg, avatarImg],
        expectJsonArray: false,
        systemPrompt: sys
      });

      const cleaned = raw
        .replace(/^🤔\s*\*التفكير:\*[\s\S]*?\n---\s*\n\s*/i, '')
        .replace(/^[\s\S]*?```(?:json)?\s*/i, '')
        .replace(/```[\s\S]*$/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      const json = start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;
      let parsed;
      try {
        parsed = JSON.parse(json);
      } catch (e) {
        try {
          const fixed = json.replace(/,\s*([}\]])/g, '$1').replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
          parsed = JSON.parse(fixed);
        } catch (e2) {
          throw new Error(`JSON parse failed. Raw:\n${raw.slice(0, 500)}`);
        }
      }
      setResults(parsed);
    } catch (err) {
      setError('حدث خطأ أثناء التحليل');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50" dir="rtl">
      <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center">
        <Camera className="w-6 h-6 text-rose-600 ml-3" />
        <div>
          <h2 className="text-xl font-bold text-rose-900">Creative Studio</h2>
          <p className="text-xs text-rose-600 mt-0.5">تحليل منتج + شخص وتوليد 6 برومبتات احترافية</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadSlot id="prod" title="صورة المنتج" subtitle="المنتج المراد تصويره" image={productImg?.preview} onChange={(e) => handleImageUpload(e, 'product')} />
          <UploadSlot id="av" title="صورة الشخص (Avatar)" subtitle="الشخص الذي سيظهر في الصورة" image={avatarImg?.preview} onChange={(e) => handleImageUpload(e, 'avatar')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-white" placeholder="وصف المنتج (اختياري)" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} />
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-white" placeholder="وصف الشخص (اختياري)" value={avatarDesc} onChange={(e) => setAvatarDesc(e.target.value)} />
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        )}

        <button onClick={analyze} disabled={loading || !productImg || !avatarImg} className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-lg">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {loading ? 'جاري التحليل والتوليد...' : 'تحليل وتوليد 6 برومبتات'}
        </button>

        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">تم التحليل بنجاح</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-sm text-rose-600 mb-2">تحليل المنتج</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{results.productAnalysis || '...'}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-sm text-rose-600 mb-2">تحليل الشخص</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{results.avatarAnalysis || '...'}</p>
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-800 pt-4">البرومبتات المولدة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STYLES.map(s => {
                const key = s.id + 'Prompt';
                const val = results[key];
                const c = COLOR_MAP[s.color];
                if (!val) return null;
                return (
                  <div key={s.id} className={`bg-white border ${c.border} rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col`}>
                    <div className={`flex items-center justify-between p-4 ${c.bg}`}>
                      <div className={`flex items-center gap-2 font-bold text-sm ${c.text}`}>
                        <s.icon className="w-4 h-4" />
                        {s.label}
                      </div>
                      <button onClick={() => copyText(val, s.id)} className={`p-2 rounded-lg transition-colors ${c.btn}`}>
                        {copiedId === s.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="p-4 flex-grow">
                      <p className="text-xs text-gray-600 leading-relaxed italic whitespace-pre-wrap">{val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadSlot({ id, title, subtitle, image, onChange }) {
  return (
    <div onClick={() => document.getElementById(id)?.click()} className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-64 overflow-hidden ${image ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-rose-400 bg-white'}`}>
      <input id={id} type="file" className="hidden" onChange={onChange} accept="image/*" />
      {image ? <img src={image} className="max-h-full rounded-lg shadow-md relative z-10" alt="" />
      : <div className="text-center">
          <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-4 mx-auto text-rose-500"><Upload className="w-6 h-6" /></div>
          <p className="font-bold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>}
    </div>
  );
}

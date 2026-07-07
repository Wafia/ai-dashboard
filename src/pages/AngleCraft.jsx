import { useState } from 'react';
import { Upload, Sparkles, Copy, Check, Camera, Box, Loader2, Zap, AlertCircle, CheckCircle2, Monitor, Smartphone, Eye, ShieldCheck, LayoutGrid, Target, Fingerprint, ShoppingBag } from 'lucide-react';
import { fetchAI } from '../utils/ai';
import { AI_PROVIDERS } from '../data/providers';

const PRODUCT_TYPES = [
  { value: 'watch', label: 'ساعة يد', wearing: 'wrist' },
  { value: 'glasses', label: 'نظارة', wearing: 'face' },
  { value: 'ring', label: 'خاتم', wearing: 'finger' },
  { value: 'necklace', label: 'قلادة', wearing: 'neck' },
  { value: 'earrings', label: 'أقراط', wearing: 'ears' },
  { value: 'bracelet', label: 'سوار', wearing: 'wrist' },
  { value: 'hat', label: 'قبعة', wearing: 'head' },
  { value: 'shoe', label: 'حذاء', wearing: 'feet' },
];

const STUDIO_STYLES = [
  { id: 'luxury', label: 'فاخر', bg: 'رخام ذهبي', lighting: 'إضاءة دافئة ناعمة' },
  { id: 'minimal', label: 'بسيط', bg: 'أبيض نقي', lighting: 'إضاءة متساوية' },
  { id: 'dark', label: 'غامض', bg: 'داكن سينمائي', lighting: 'إضاءة درامية' },
  { id: 'nature', label: 'طبيعي', bg: 'خلفية عضوية', lighting: 'ضوء شمس طبيعي' },
];

const ANGLE_LABELS = [
  { id: 'hero', label: 'Hero Shot', icon: Camera },
  { id: 'threequarter', label: 'Three-Quarter', icon: Eye },
  { id: 'profile', label: 'Side Profile', icon: Monitor },
  { id: 'macro', label: 'Macro Detail', icon: Target },
  { id: 'lifestyle', label: 'Lifestyle', icon: ShoppingBag },
  { id: 'premium', label: 'Premium Editorial', icon: Sparkles },
];

export default function AngleCraft({ apiKey, model, customEndpoint, providerId }) {
  const [productImg, setProductImg] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('watch');
  const [studioStyle, setStudioStyle] = useState('luxury');
  const [withAvatar, setWithAvatar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const isVisionModel = true;

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

  const handleFileUpload = async (e, type) => {
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

  const startAnalysis = async () => {
    if (!productImg) return;
    setError(null);
    if (!model) { setError('الرجاء اختيار موديل من القائمة أعلاه'); return; }
    if (!isVisionModel) { setError('هذا الموديل لا يقرأ الصور. اختر موديل رؤية (📷)'); return; }
    setLoading(true);

    const typeInfo = PRODUCT_TYPES.find(t => t.value === productType);
    const styleInfo = STUDIO_STYLES.find(s => s.id === studioStyle);

    const sys = `أنت AngleCraft AI — خبير تصوير منتجات تجاري ومخرج فني متخصص في توليد 6 زوايا تصوير احترافية.

## ════════════════════════════════════════════
## القواعد الأساسية
## ════════════════════════════════════════════

### Identity Lock (قفل الهوية)
- شكل المنتج: exact_match — لا تغيير
- اللون: exact_match — نفس اللون تماماً
- المادة: exact_match — نفس الملمس
- الشعار والملصقات: exact_match — لا تعديل
- الأبعاد: exact_match — نفس المقاييس
- ممنوع: إعادة تصميم، تحسين، تغيير لون، إضافة عناصر وهمية

### Consumer Psychology
- المنتجات الفاخرة → prestige, exclusivity, craftsmanship
- المنتجات التقنية → innovation, intelligence, performance  
- منتجات الموضة → style, attractiveness, confidence

## ════════════════════════════════════════════
## الزوايا الـ 6 المطلوبة
## ════════════════════════════════════════════

يجب توليد 6 زوايا مختلفة تماماً (ممنوع التكرار):

1. **Hero Shot** — أمامي مباشر، مستوى العين، مركز. يبرز هوية المنتج والانطباع الأول.
2. **Three-Quarter** — زاوية 45 درجة. يبرز العمق والبعد الثلاثي الأبعاد.
3. **Side Profile** — زاوية 90 درجة جانبية. يبرز السُمك والخطوط الجانبية.
4. **Macro Detail** — لقطة قريبة جداً. يبرز المواد والنسيج والحرفية.
5. **Lifestyle** — المنتج يُستخدم طبيعياً على ${typeInfo?.wearing || 'الجسم'}. يساعد العميل على تخيّل الامتلاك.
6. **Premium Editorial** — تكوين فني فاخر (ظلال درامية، rim light، تركيبة إبداعية). يخلق الطموح.

## ════════════════════════════════════════════
## معايير الإضاءة الفاخرة
## ════════════════════════════════════════════
1. Soft key light (إضاءة رئيسية ناعمة)
2. Rim light (إضاءة حافية)
3. Fill light (إضاءة مالئة)
4. Subtle shadow retention (ظلال خفيفة)
تجنب: overexposure, flat lighting, harsh reflections

## ════════════════════════════════════════════
## إعدادات الاستوديو الحالية
## ════════════════════════════════════════════
النمط: ${styleInfo?.label} (خلفية: ${styleInfo?.bg}، إضاءة: ${styleInfo?.lighting})

## ════════════════════════════════════════════
## هيكل الإخراج (Output Structure)
## ════════════════════════════════════════════

أخرج ONLY JSON صالح بهذا الهيكل:
{
  "productAnalysis": "تحليل المنتج: النوع، الميزات، المواد...",
  "featureAnalysis": "الميزات الثلاث الأهم من صورة المنتج...",
  "psychologyProfile": "الملف النفسي للمستهلك والعواطف المستهدفة...",
  "angles": [
    {
      "name": "Hero Shot",
      "description": "وصف الزاوية...",
      "cameraPosition": "مستوى العين، أمامي مباشر...",
      "focusArea": "وجه المنتج بالكامل...",
      "highlightedFeatures": "الميزات التي تبرزها هذه الزاوية...",
      "marketingObjective": "صورة أساسية للتجارة الإلكترونية...",
      "psychologicalImpact": "الثقة والانطباع الأول...",
      "prompt": "برومبت كامل لتوليد هذه الزاوية..."
    }
  ],
  "midjourneyVersion": "Midjourney prompt for all 6 angles...",
  "dalleVersion": "DALL-E 3 prompt...",
  "fluxVersion": "Flux prompt...",
  "negativePrompt": "no distortion, no redesign, exact product match...",
  "qualityChecklist": "✓ 6 angles ✓ No repeated perspectives ✓ Identity Lock active"
}`;

    const usr = `I provide a PRODUCT IMAGE${withAvatar && avatarImg ? ' and an AVATAR IMAGE' : ''}.

Product: ${productName || 'Analyze from image'}
Type: ${typeInfo?.label}
Wearing on: ${typeInfo?.wearing}
Studio Style: ${styleInfo?.label} (${styleInfo?.bg}, ${styleInfo?.lighting})
${withAvatar && avatarImg ? 'Mode: Avatar wearing the product' : 'Mode: Product-only studio photography'}

Analyze the product image. Identify its top 3 features. Generate 6 diverse photography angles following strict Identity Lock (100% product preservation). Output ONLY valid JSON.`;

    try {
      const images = withAvatar && avatarImg ? [productImg, avatarImg] : [productImg];
      const raw = await fetchAI({
        apiKey, provider: providerId || 'nvidia', model: model || 'deepseek-ai/deepseek-v4-flash', customEndpoint,
        prompt: usr,
        images,
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
      if (!parsed.angles || !parsed.angles.length) throw new Error('Response missing angles array');
      setResult(parsed);
    } catch (err) {
      setError(err.message || 'Analysis failed');
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
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center">
        <Camera className="w-6 h-6 text-blue-600 ml-3" />
        <div>
          <h2 className="text-xl font-bold text-blue-900">AngleCraft</h2>
          <p className="text-xs text-blue-600 mt-0.5">توليد 6 زوايا تصوير احترافية للمنتجات — مع قفل الهوية 100%</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadSlot id="prod" title="صورة المنتج" subtitle="مطلوب" icon={Box} image={productImg?.preview} onChange={(e) => handleFileUpload(e, 'product')} required />
          <UploadSlot id="av" title="صورة الأفاتار (اختياري)" subtitle={withAvatar ? 'الشخص الذي يرتدي المنتج' : 'معطل'} icon={Camera} image={avatarImg?.preview} onChange={(e) => handleFileUpload(e, 'avatar')} dim={!withAvatar} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="اسم المنتج" value={productName} onChange={(e) => setProductName(e.target.value)} />
          <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={studioStyle} onChange={(e) => setStudioStyle(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            {STUDIO_STYLES.map(s => <option key={s.id} value={s.id}>{s.label} — {s.bg}</option>)}
          </select>
          <button onClick={() => setWithAvatar(!withAvatar)} className={`p-3 rounded-xl border text-sm font-bold transition-all ${withAvatar ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
            {withAvatar ? 'مع أفاتار ✓' : 'منتج فقط'}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        )}

        <button onClick={startAnalysis} disabled={loading || !productImg} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-lg">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LayoutGrid className="w-6 h-6" />}
          {loading ? 'جاري تحليل المنتج وتوليد الزوايا...' : 'توليد 6 زوايا احترافية'}
        </button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">تم التحليل — 6 زوايا جاهزة</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-blue-600 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" /> تحليل المنتج
                  </h3>
                  <Block label="التحليل" val={result.productAnalysis} />
                  <Block label="الميزات الرئيسية" val={result.featureAnalysis} />
                  <Block label="الملف النفسي" val={result.psychologyProfile} />
                </div>

                {result.qualityChecklist && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <h3 className="font-bold text-sm text-green-600 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Quality Checklist
                    </h3>
                    <p className="text-xs text-green-800 whitespace-pre-wrap leading-relaxed">{result.qualityChecklist}</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-blue-600 mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" /> الزوايا الـ 6
                  </h3>
                  <div className="space-y-6">
                    {result.angles?.map((angle, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow">{i + 1}</div>
                            <div>
                              <span className="text-sm font-bold text-gray-800 block">{angle.name}</span>
                              <span className="text-[10px] text-gray-400">{angle.cameraPosition}</span>
                            </div>
                          </div>
                          <button onClick={() => copyText(angle.prompt, `angle_${i}`)} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 transition-all text-xs font-bold flex items-center gap-1.5">
                            {copiedId === `angle_${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} نسخ
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="text-xs text-gray-500"><span className="font-bold text-gray-700">التركيز:</span> {angle.focusArea}</div>
                          <div className="text-xs text-gray-500"><span className="font-bold text-gray-700">الميزات:</span> {angle.highlightedFeatures}</div>
                        </div>
                        <div className="text-xs text-gray-500 mb-3"><span className="font-bold text-gray-700">الهدف التسويقي:</span> {angle.marketingObjective}</div>
                        <div className="text-xs text-gray-500 mb-3"><span className="font-bold text-gray-700">التأثير النفسي:</span> {angle.psychologicalImpact}</div>
                        <p className="text-xs text-gray-600 font-mono bg-white p-3 rounded-lg border border-gray-100 leading-relaxed select-all">{angle.prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.midjourneyVersion && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm text-indigo-600">🎨 Midjourney</h4>
                        <button onClick={() => copyText(result.midjourneyVersion, 'mj')} className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 transition-all text-xs font-bold">{copiedId === 'mj' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}</button>
                      </div>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{result.midjourneyVersion}</p>
                    </div>
                  )}
                  {result.dalleVersion && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm text-emerald-600">🤖 DALL-E 3</h4>
                        <button onClick={() => copyText(result.dalleVersion, 'de')} className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-700 transition-all text-xs font-bold">{copiedId === 'de' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}</button>
                      </div>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{result.dalleVersion}</p>
                    </div>
                  )}
                  {result.fluxVersion && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm text-orange-600">⚡ Flux</h4>
                        <button onClick={() => copyText(result.fluxVersion, 'fx')} className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 rounded-lg text-orange-700 transition-all text-xs font-bold">{copiedId === 'fx' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}</button>
                      </div>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{result.fluxVersion}</p>
                    </div>
                  )}
                </div>

                {result.negativePrompt && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-rose-500">Negative Prompt</span>
                      <button onClick={() => copyText(result.negativePrompt, 'neg')} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg text-rose-700 transition-all text-xs font-bold flex items-center gap-1.5">
                        {copiedId === 'neg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} نسخ
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 font-mono bg-white p-3 rounded-lg border border-rose-100">{result.negativePrompt}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadSlot({ id, title, subtitle, icon: Icon, image, onChange, required, dim }) {
  return (
    <div onClick={() => document.getElementById(id)?.click()} className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-64 overflow-hidden ${image ? 'border-blue-500 bg-blue-50' : dim ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}>
      <input id={id} type="file" className="hidden" onChange={onChange} accept="image/*" disabled={dim} />
      {image ? <img src={image} className="max-h-full rounded-lg shadow-md relative z-10" alt="" />
      : <div className="text-center">
          <div className={`w-14 h-14 ${dim ? 'bg-gray-100 text-gray-300' : 'bg-blue-100 text-blue-500'} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
            <Icon className="w-6 h-6" />
          </div>
          <p className="font-bold text-gray-800">{title} {required && <span className="text-red-500">*</span>}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>}
    </div>
  );
}

function Block({ label, val }) {
  return <div><span className="text-xs font-bold text-gray-500 block mb-1">{label}</span><p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{val || '...'}</p></div>;
}

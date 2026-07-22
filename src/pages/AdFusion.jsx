import { useState } from 'react';
import { Upload, Sparkles, Copy, Check, Palette, Camera, Box, Loader2, Zap, AlertCircle, CheckCircle2, ShieldCheck, Eye } from 'lucide-react';
import { fetchAI } from '../utils/ai';
import { AI_PROVIDERS } from '../data/providers';

const MODES = [
  { id: 'standard', label: 'قياسي', icon: Palette, color: 'indigo', desc: 'توازن لوني ذكي للحفاظ على هوية التصميم' },
  { id: 'luxury', label: 'فاخر (Luxury)', icon: Eye, color: 'amber', desc: 'انعكاسات محسّنة، هايلايت ذهبي، فخامة عالية' },
  { id: 'performance', label: 'أداء تسويقي', icon: Zap, color: 'rose', desc: 'تباين بصري عالي لزيادة CTR الإعلانات' },
];

const MODE_COLORS = {
  indigo: { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-500', btn: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700', light: 'bg-indigo-50', dark: 'bg-indigo-600' },
  amber: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-500', btn: 'bg-amber-100 hover:bg-amber-200 text-amber-700', light: 'bg-amber-50', dark: 'bg-amber-600' },
  rose: { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-500', btn: 'bg-rose-100 hover:bg-rose-200 text-rose-700', light: 'bg-rose-50', dark: 'bg-rose-600' },
};

export default function AdFusion({ apiKey, model, customEndpoint, providerId }) {
  const [productImg, setProductImg] = useState(null);
  const [referenceImg, setReferenceImg] = useState(null);
  const [productDesc, setProductDesc] = useState('');
  const [brandName, setBrandName] = useState('');
  const [mode, setMode] = useState('standard');
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
      else setReferenceImg(img);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!productImg || !referenceImg) return;
    setError(null);
    if (!model) { setError('الرجاء اختيار موديل من القائمة أعلاه'); return; }
    if (!isVisionModel) { setError('هذا الموديل لا يقرأ الصور. اختر موديل رؤية (📷) مثل Llama 3.2 11B Vision'); return; }
    setLoading(true);

    const modeData = MODES.find(m => m.id === mode);
    const modeName = modeData?.label || 'قياسي';
    const modeColor = MODE_COLORS[modeData?.color || 'indigo'];

    const modeInstructions = {
      standard: 'حافظ على توازن لوني طبيعي. استخدم Harmony Engine (Analogous + Complementary) بذكاء. نسبة تأثير لوني منخفضة (adaptive_low).',
      luxury: 'فعّل Luxury Mode: تحسين الانعكاسات والهايلايت. أضف تدرجات ذهبية/فضية ناعمة. استخدم إضاءة دافئة (2700K-3500K). خلفيات غنية (رخام، خشب ماهوجني، مخمل).',
      performance: 'فعّل Performance Marketing Mode: تحسين التباين البصري (High Contrast). ألوان جريئة ومحفزة. تحسين وضوح النص وCTA. نسبة تأثير لوني أعلى (adaptive_medium).',
    }[mode] || '';

    const sys = `أنت Smart Color Adapt AI — محرك دمج منتجات ذكي للإعلانات التجارية. مهمتك: تحليل صورة المنتج وصورة البوست المرجعي، وتوليد تعليمات دقيقة لدمج المنتج في التصميم مع الحفاظ على هوية التصميم الأصلية.

## ════════════════════════════════════════════
## 1.  محرك التحليل (Analysis Engine) — 3 مراحل
## ════════════════════════════════════════════

### المرحلة 1: تحليل المنتج (Product Analysis)
استخرج من صورة المنتج:
- primary_color — اللون الأساسي
- secondary_color — اللون الثانوي
- accent_color — لون التمييز
- material_type — نوع المادة (metal/glass/plastic/matte/glossy/liquid/fabric/leather/wood)
- surface_reflectivity — انعكاسية السطح (high/medium/low/matte)
- texture — نسيج السطح (smooth/rough/brushed/polished/patterned)
- packaging_style — نمط التغليف (minimal/luxury/vibrant/classic/modern)
- branding_elements — عناصر العلامة التجارية (logo/pattern/shape/color_block)

### المرحلة 2: تحليل المرجع (Reference Analysis)
استخرج من صورة البوست المرجعي:
- dominant_colors — الألوان السائدة
- secondary_palette — اللوحة الثانوية
- lighting_temperature — درجة حرارة الإضاءة (warm/cool/neutral/mixed)
- visual_mood — المزاج البصري (luxury/energetic/calm/modern/minimalist/elegant/futuristic)
- design_style — نمط التصميم (flat/photographic/illustration/minimal/maximal/corporate)
- typography_style — نمط الخطوط (serif/sans-serif/script/display/modern)
- composition_structure — هيكل التكوين (centered/asymmetric/grid/rule-of-thirds/hero)
- focal_hierarchy — التسلسل الهرمي البصري (product-first/text-first/balanced)

### المرحلة 3: رسم علاقات التكامل (Relationship Mapping)
حدد:
- color_conflicts — تعارضات لونية بين المنتج والمرجع
- color_harmony_score — درجة الانسجام اللوني (0-100%)
- lighting_compatibility — توافق الإضاءة (متوافق/تحتاج تعديل/غير متوافق)
- mood_alignment — توافق المزاج (متوافق/قريب/مختلف)
- visual_balance — التوازن البصري (ممتاز/جيد/ضعيف)

## ════════════════════════════════════════════
## 2.  قفل التصميم (Design Lock)
## ════════════════════════════════════════════

هذه العناصر ممنوع تغييرها تماماً:
- ❌ layout_structure — هيكل التخطيط
- ❌ object_locations — مواقع العناصر
- ❌ model_pose — وضعية الشخص/النموذج
- ❌ camera_perspective — زاوية الكاميرا
- ❌ brand_logo_position — موضع الشعار
- ❌ typography_alignment — محاذاة الخطوط
- ❌ graphic_shapes — الأشكال الجرافيكية

هذه العناصر يُسمح بتعديلها:
- ✅ lighting — الإضاءة (كثافة، لون)
- ✅ shadows — الظلال (درجة اللون)
- ✅ highlights — الهايلايت
- ✅ reflections — الانعكاسات
- ✅ color_temperature — درجة حرارة اللون
- ✅ decorative_accents — اللمسات الزخرفية
- ✅ background_tint — صبغة الخلفية (خفيفة)
- ✅ text_containers — حاويات النص (لون الخلفية فقط)

## ════════════════════════════════════════════
## 3.  محرك التكيف اللوني (Color Adaptation Engine)
## ════════════════════════════════════════════

الوضع الحالي: ${modeName}
${modeInstructions}

### Brand DNA Protection
- حماية ألوان العلامة التجارية الأساسية
- عدم تغيير هوية المنتج البصرية
- الحفاظ على وضوح الشعار والنصوص

### Color Psychology
- عند استخدام ألوان محفزة: أزرق = ثقة، أحمر = طاقة، أخضر = طبيعة، ذهبي = فخامة
- اختر الألوان المتوافقة مع شخصية العلامة التجارية
- تجنب الألوان المتضاربة التي تقلل من قابلية القراءة

### قواعد التكيف:
- allowed_targets: background_tint, ambient_lighting, reflections, highlights, shadow_tones, decorative_shapes, particles, glow_effects, text_containers (fill only), gradient_overlays
- forbidden_targets: main_background_replacement, people_clothing, skin_tones, primary_design_objects, logos, typography_content
- intensity: low (للمنتجات ذات الألوان البارزة)، medium (للمنتجات المحايدة)
- الهدف: أن يبدو المنتج وكأنه مصمم أصلاً للعمل الفني

## ════════════════════════════════════════════
## 4.  تقييم الجودة (Quality Score)
## ════════════════════════════════════════════

احسب Creative Consistency Score (0-100):
- 90-100: دمج مثالي — المنتج يبدو أصلياً في التصميم
- 75-89: دمج جيد جداً — يحتاج تحسينات بسيطة
- 50-74: دمج مقبول — يحتاج تحسينات في الإضاءة أو الألوان
- <50: دمج ضعيف — يُوصى بتجربة منتج آخر أو تعديل التصميم

معايير التقييم:
- layout_preserved (20 نقطة) — تم الحفاظ على التخطيط
- color_harmony (25 نقطة) — انسجام لوني
- logo_visibility (10 نقاط) — وضوح الشعار
- product_visibility (15 نقطة) — وضوح المنتج
- typography_readability (10 نقاط) — قراءة النصوص
- lighting_consistency (10 نقاط) — اتساق الإضاءة
- commercial_realism (10 نقاط) — واقعية تجارية

## ════════════════════════════════════════════
## 5.  هيكل الإخراج (Output Structure)
## ════════════════════════════════════════════

أخرج ONLY JSON صالح (بدون Markdown، بدون نص إضافي) بهذا الهيكل بالضبط:
{
  "productAnalysis": "تحليل المنتج: الألوان، المواد، الملمس، التغليف...",
  "referenceAnalysis": "تحليل المرجع: الألوان، الإضاءة، المزاج، التركيب...",
  "relationshipMapping": "تحليل علاقات التكامل: التوافق اللوني، الإضاءة، المزاج...",
  "colorHarmonyScore": "85%",
  "creativeConsistencyScore": "92/100",
  "masterPrompt": "برومبت رئيسي لدمج المنتج في التصميم...",
  "metaAdsPrompt": "برومبت مخصص لإعلانات ميتا (فيسبوك/إنستغرام)...",
  "ecommercePrompt": "برومبت مخصص للمتاجر الإلكترونية (أمازون/شوبيفاي)...",
  "printPrompt": "برومبت مخصص للطباعة والإعلانات الخارجية...",
  "negativePrompt": "نفي: يشيل التشويه فقط...",
  "adaptationNotes": "ملاحظات التكيف: ما تم تعديله ولماذا",
  "designLockVerification": "تأكيد الحفاظ على جميع عناصر التصميم الأصلية"
}`;

    const usr = `I provide two images: a PRODUCT IMAGE and a REFERENCE POST IMAGE (ad design with text).

Product: ${productDesc || 'Analyze from the image'}
Brand: ${brandName || 'Unspecified brand'}
Mode: ${modeName}

Analyze both images through the 3-stage engine. Generate precise adaptation instructions and platform-specific prompts. The goal is to make the product appear naturally designed for the reference artwork. Output ONLY valid JSON.`;

    try {
      const raw = await fetchAI({
        apiKey, provider: providerId || 'nvidia', model: model || 'deepseek-ai/deepseek-v4-flash', customEndpoint,
        prompt: usr,
        images: [productImg, referenceImg],
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
      if (!parsed.masterPrompt) throw new Error('Response missing masterPrompt');
      setResult(parsed);
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

  const modeColor = MODE_COLORS[MODES.find(m => m.id === mode)?.color || 'indigo'];

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50" dir="rtl">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center">
        <Palette className="w-6 h-6 text-indigo-600 ml-3" />
        <div>
          <h2 className="text-xl font-bold text-indigo-900">AdFusion</h2>
          <p className="text-xs text-indigo-600 mt-0.5">دمج ذكي للمنتجات في التصاميم الإعلانية — تحليل وتكيف لوني احترافي</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadSlot id="prod" title="صورة المنتج" subtitle="المنتج المراد دمجه" icon={Box} color="indigo" image={productImg?.preview} onChange={(e) => handleFileUpload(e, 'product')} />
          <UploadSlot id="ref" title="البوست المرجعي" subtitle="التصميم الإعلاني الحالي" icon={Camera} color="indigo" image={referenceImg?.preview} onChange={(e) => handleFileUpload(e, 'reference')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="وصف المنتج (اختياري)" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} />
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="اسم العلامة التجارية (اختياري)" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl">
          <h3 className="text-sm font-bold text-indigo-600 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> وضع التكيف
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`p-4 rounded-xl border text-center transition-all ${mode === m.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300'}`}>
                <m.icon className={`w-5 h-5 mx-auto mb-2 ${mode === m.id ? 'text-white' : 'text-indigo-500'}`} />
                <div className="text-xs font-bold">{m.label}</div>
                <div className="text-[10px] opacity-70 mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        )}

        <button onClick={startAnalysis} disabled={loading || !productImg || !referenceImg} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-lg">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {loading ? 'جاري التحليل والتكيف...' : 'تحليل ودمج ذكي'}
        </button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">تم التحليل — جاهز للتوليد</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-indigo-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> تحليل 3 مراحل
                  </h3>
                  <Block label="المرحلة 1 — تحليل المنتج" val={result.productAnalysis} />
                  <Block label="المرحلة 2 — تحليل المرجع" val={result.referenceAnalysis} />
                  <Block label="المرحلة 3 — علاقات التكامل" val={result.relationshipMapping} />
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-sm text-indigo-600">📊 تقييم الجودة</h3>
                  <QBar label="الانسجام اللوني" val={result.colorHarmonyScore} />
                  <QBar label="Creative Consistency" val={result.creativeConsistencyScore} highlight />
                  {result.designLockVerification && (
                    <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{result.designLockVerification}</span>
                    </div>
                  )}
                </div>

                {result.adaptationNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <h3 className="font-bold text-sm text-amber-600 mb-2">📝 ملاحظات التكيف</h3>
                    <p className="text-xs text-amber-800 leading-relaxed">{result.adaptationNotes}</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-indigo-600 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> البرومبتات المولدة
                  </h3>
                  <div className="space-y-4">
                    <PBlock title="Master Prompt" val={result.masterPrompt} onCopy={() => copyText(result.masterPrompt, 'master')} copiedId={copiedId} id="master" />
                    {result.metaAdsPrompt && <PBlock title="📱 Meta Ads" val={result.metaAdsPrompt} onCopy={() => copyText(result.metaAdsPrompt, 'meta')} copiedId={copiedId} id="meta" />}
                    {result.ecommercePrompt && <PBlock title="🛒 E-commerce" val={result.ecommercePrompt} onCopy={() => copyText(result.ecommercePrompt, 'eco')} copiedId={copiedId} id="eco" />}
                    {result.printPrompt && <PBlock title="🖨️ Print" val={result.printPrompt} onCopy={() => copyText(result.printPrompt, 'print')} copiedId={copiedId} id="print" />}
                    {result.negativePrompt && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-rose-500">Negative Prompt</span>
                          <button onClick={() => copyText(result.negativePrompt, 'neg')} className={`px-3 py-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg text-rose-700 transition-all text-xs font-bold flex items-center gap-1.5`}>
                            {copiedId === 'neg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} نسخ
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 font-mono bg-white p-3 rounded-lg border border-rose-100">{result.negativePrompt}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadSlot({ id, title, subtitle, icon: Icon, color, image, onChange }) {
  return (
    <div onClick={() => document.getElementById(id)?.click()} className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-64 overflow-hidden ${image ? `border-${color}-500 bg-${color}-50` : 'border-gray-300 hover:border-indigo-400 bg-white'}`}>
      <input id={id} type="file" className="hidden" onChange={onChange} accept="image/*" />
      {image ? <img src={image} className="max-h-full rounded-lg shadow-md relative z-10" alt="" />
      : <div className="text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto text-indigo-500">
            <Icon className="w-6 h-6" />
          </div>
          <p className="font-bold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>}
    </div>
  );
}

function Block({ label, val }) {
  return <div><span className="text-xs font-bold text-gray-500 block mb-1">{label}</span><p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{val || '...'}</p></div>;
}

function QBar({ label, val, highlight }) {
  const num = val ? parseInt(val) : 0;
  const pct = !isNaN(num) ? (val?.includes('/') ? (num / 100) * 100 : num) : 0;
  const color = !isNaN(num) ? (pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-indigo-400';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        <span className={`text-xs font-bold ${highlight ? 'text-indigo-600' : 'text-gray-400'}`}>{val || '—'}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

function PBlock({ title, val, onCopy, copiedId, id }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-gray-500">{title}</span>
        <button onClick={onCopy} className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 transition-all text-xs font-bold flex items-center gap-1.5">
          {copiedId === id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} نسخ
        </button>
      </div>
      <p className="text-xs text-gray-600 font-mono leading-relaxed select-all bg-white p-4 rounded-lg border border-gray-100">{val || '...'}</p>
    </div>
  );
}

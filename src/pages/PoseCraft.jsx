import { useState } from 'react';
import { Upload, Sparkles, Copy, Check, Camera, Box, Hand, Loader2, Zap, AlertCircle, CheckCircle2, Monitor, Smartphone, Eye, ShieldCheck } from 'lucide-react';
import { fetchAI } from '../utils/ai';
import { AI_PROVIDERS } from '../data/providers';

const PRODUCT_TYPES = [
  { id: 'auto', label: 'تلقائي', desc: 'يكتشف النموذج النوع' },
  { id: 'bottle', label: 'زجاجة', desc: 'إمساك حول الجسم الأسطواني' },
  { id: 'box', label: 'صندوق', desc: 'دعم من الأسفل + تثبيت جانبي' },
  { id: 'phone', label: 'هاتف', desc: 'إمساك من الحافة، الشاشة للكاميرا' },
  { id: 'cosmetic', label: 'مستحضر تجميل', desc: 'قبضة تقديمية، الماركة للأمام' },
  { id: 'food', label: 'عبوة طعام', desc: 'الملصق الأمامي مرئي، المنتج في الوسط' },
  { id: 'tool', label: 'أداة', desc: 'إمساك من المقبض، توازن وزني' },
  { id: 'luxury', label: 'فاخر', desc: 'وضعية أنيقة، أصابع لا تحجب المنتج' },
];

export default function PoseCraft({ apiKey, model, customEndpoint, providerId }) {
  const [avatarImg, setAvatarImg] = useState(null);
  const [productImg, setProductImg] = useState(null);
  const [productDesc, setProductDesc] = useState('');
  const [productType, setProductType] = useState('auto');
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
      if (type === 'avatar') setAvatarImg(img);
      else setProductImg(img);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!avatarImg || !productImg) return;
    setError(null);
    if (!model) { setError('الرجاء اختيار موديل من القائمة أعلاه'); return; }
    if (!isVisionModel) { setError('هذا الموديل لا يقرأ الصور. اختر موديل رؤية (📷)'); return; }
    setLoading(true);

    const sys = `أنت PoseCraft AI — خبير دمج المنتجات مع الأفاتار (شخصيات) لإعلانات تجارية احترافية.

## ════════════════════════════════════════════
## 1.  Product Integrity Preservation (الحفاظ على المنتج)
## ════════════════════════════════════════════

### واجب الحفظ (DO NOT MODIFY):
- الشكل الهندسي (Geometry) — دون تغيير
- الأبعاد (Dimensions) — نفس المقاييس
- الملصقات (Labels) — نصها وخطها
- الشعار (Logo) — موضعه وحجمه
- الخطوط (Typography) — نفس الخط
- هيكل التغليف (Packaging) — دون تعديل
- المواد (Materials) — نفس الملمس
- الانعكاسات (Reflections) — نفس البريق
- تفاصيل التصنيع — دون إضافة أو حذف

### ممنوع تماماً:
- إعادة تصميم المنتج ❌
- تغيير الشكل ❌
- إعادة توليد الملصقات ❌
- إعادة تفسير الألوان ❌
- تنميق أو إضافة عناصر وهمية ❌
- تغيير العلامة التجارية ❌

## ════════════════════════════════════════════
## 2.  Deep Analysis Pipeline (5 مراحل)
## ════════════════════════════════════════════

### المرحلة 1 — Visual Analysis (التحليل البصري)
حلل بالتفصيل:
- Avatar Anatomy: شكل الجسم، وضعية اليد، الأصابع، الرسغ
- Hand Visibility: هل اليد ظاهرة؟ في أي وضع؟
- Product Geometry: الشكل، الحجم، مركز الثقل، نقاط الإمساك
- Lighting: اتجاه الإضاءة وشدتها

### المرحلة 2 — Interaction Mapping (رسم التفاعل)
حدد:
- Finger Placement: أماكن الأصابع بالضبط
- Thumb Placement: وضعية الإبهام
- Pressure Points: نقاط الضغط
- Support Zones: مناطق الدعم
- يجب ألا يطفو المنتج، ولا يتقاطع مع الأصابع، والأصابع تلتف طبيعياً

### المرحلة 3 — Fusion Process (الدمج)
- حافظ على المنتج完全相同 (مطابق 100%)
- حافظ على ملامح الوجه والأفاتار
- occlusion: عندما تتغطى الأصابع بالمنتج — اختراق واقعي مع وضوح الحواف

### المرحلة 4 — Environmental Harmonization (المواءمة البيئية)
طابق:
- Brightness — السطوع
- Contrast — التباين
- White Balance — توازن اللون الأبيض
- Reflection Intensity — كثافة الانعكاس
- Ambient Light — الإضاءة المحيطة
- أنشئ Contact Shadows + Micro Shadows

### المرحلة 5 — Commercial Refinement (تحسين تجاري)
- جودة إعلانية
- وضوح المنتج والماركة
- التواصل البصري (العين للكاميرا)
- Product:Face balance (60% منتج : 40% وجه)

## ════════════════════════════════════════════
## 3.  Product Grip Intelligence (ذكاء القبضة)
## ════════════════════════════════════════════

بناءً على تصنيف المنتج:
- Bottle: إمساك حول الجسم الأسطواني، إبهام يثبت الجانب الآخر
- Box: دعم من الأسفل + تثبيت جانبي
- Phone: إمساك من الحافة، الشاشة للكاميرا
- Cosmetic: قبضة تقديمية، الماركة للأمام
- Food: الملصق الأمامي مرئي
- Tool: إمساك من المقبض، توازن وزني
- Luxury: وضعية أنيقة، أصابع لا تحجب المنتج

## ════════════════════════════════════════════
## 4.  هيكل الإخراج (Output Structure)
## ════════════════════════════════════════════

أخرج ONLY JSON صالح بهذا الهيكل:
{
  "productAnalysis": "تحليل المنتج: الشكل، المواد، الأبعاد، نقاط الإمساك...",
  "avatarAnalysis": "تحليل الأفاتار: وضعية اليد، تشريح الأصابع...",
  "gripInstructions": "تعليمات دقيقة للإمساك بالمنتج...",
  "verticalPrompt": "برومبت للنسخة العمودية (9:16، كامل الجسم)...",
  "horizontalPrompt": "برومبت للنسخة الأفقية (16:9، سينمائي عريض)...",
  "midjourneyVersion": "Midjourney --ar 9:16 --style raw --v 6.1",
  "dalleVersion": "DALL-E 3 vertical prompt...",
  "fluxVersion": "Flux vertical prompt...",
  "negativePrompt": "no distorted hands, no extra fingers...",
  "qualityAssessment": "95/100 - توافق المنتج ممتاز، تشريح طبيعي"
}`;

    const typeLabel = PRODUCT_TYPES.find(t => t.id === productType)?.label || 'تلقائي';
    const usr = `I provide two images: AVATAR IMAGE (a person) and PRODUCT IMAGE.

Product Description: ${productDesc || 'Analyze from the image'}
Product Type: ${typeLabel}

Execute the 5-stage analysis pipeline. Generate grip instructions and two orientation prompts (vertical + horizontal). Output ONLY valid JSON.`;

    try {
      const raw = await fetchAI({
        apiKey, provider: providerId || 'nvidia', model: model || 'deepseek-ai/deepseek-v4-flash', customEndpoint,
        prompt: usr,
        images: [avatarImg, productImg],
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
      if (!parsed.verticalPrompt) throw new Error('Response missing verticalPrompt');
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
        <Hand className="w-6 h-6 text-blue-600 ml-3" />
        <div>
          <h2 className="text-xl font-bold text-blue-900">PoseCraft</h2>
          <p className="text-xs text-blue-600 mt-0.5">دمج المنتجات مع الأفاتار — تشكيل الوضعية المثالية للإمساك بالمنتج</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadSlot id="av" title="صورة الأفاتار (الشخص)" subtitle="الشخص الذي سيمسك المنتج" icon={Camera} image={avatarImg?.preview} onChange={(e) => handleFileUpload(e, 'avatar')} />
          <UploadSlot id="prod" title="صورة المنتج" subtitle="المنتج الذي سيوضع في اليد" icon={Box} image={productImg?.preview} onChange={(e) => handleFileUpload(e, 'product')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="وصف المنتج (اختياري)" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} />
          <div className="relative">
            <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer">
              {PRODUCT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        )}

        <button onClick={startAnalysis} disabled={loading || !avatarImg || !productImg} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-lg">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {loading ? 'جاري التحليل الذكي...' : 'تحليل وتوليد برومبتات'}
        </button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">تم التحليل — جاهز لتوليد الصور</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-blue-600 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> تحليل 5 مراحل
                  </h3>
                  <Block label="المرحلة 1 — تحليل المنتج" val={result.productAnalysis} />
                  <Block label="المرحلة 2 — تحليل الأفاتار" val={result.avatarAnalysis} />
                  <Block label="تعليمات القبضة" val={result.gripInstructions} />
                </div>

                {result.qualityAssessment && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-sm text-blue-600 mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> تقييم الجودة
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{result.qualityAssessment}</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-blue-600 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> البرومبتات المولدة
                  </h3>
                  <div className="space-y-4">
                    <PBlock title={<><Smartphone className="w-4 h-4" /> عمودي (Portrait 9:16)</>} val={result.verticalPrompt} onCopy={() => copyText(result.verticalPrompt, 'vert')} copiedId={copiedId} id="vert" />
                    <PBlock title={<><Monitor className="w-4 h-4" /> أفقي (Landscape 16:9)</>} val={result.horizontalPrompt} onCopy={() => copyText(result.horizontalPrompt, 'horiz')} copiedId={copiedId} id="horiz" />
                    {result.midjourneyVersion && <PBlock title="🎨 Midjourney" val={result.midjourneyVersion} onCopy={() => copyText(result.midjourneyVersion, 'mj')} copiedId={copiedId} id="mj" />}
                    {result.dalleVersion && <PBlock title="🤖 DALL-E 3" val={result.dalleVersion} onCopy={() => copyText(result.dalleVersion, 'de')} copiedId={copiedId} id="de" />}
                    {result.fluxVersion && <PBlock title="⚡ Flux" val={result.fluxVersion} onCopy={() => copyText(result.fluxVersion, 'fx')} copiedId={copiedId} id="fx" />}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadSlot({ id, title, subtitle, icon: Icon, image, onChange }) {
  return (
    <div onClick={() => document.getElementById(id)?.click()} className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-64 overflow-hidden ${image ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}>
      <input id={id} type="file" className="hidden" onChange={onChange} accept="image/*" />
      {image ? <img src={image} className="max-h-full rounded-lg shadow-md relative z-10" alt="" />
      : <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto text-blue-500"><Icon className="w-6 h-6" /></div>
          <p className="font-bold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>}
    </div>
  );
}

function Block({ label, val }) {
  return <div><span className="text-xs font-bold text-gray-500 block mb-1">{label}</span><p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{val || '...'}</p></div>;
}

function PBlock({ title, val, onCopy, copiedId, id }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">{title}</span>
        <button onClick={onCopy} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 transition-all text-xs font-bold flex items-center gap-1.5">
          {copiedId === id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} نسخ
        </button>
      </div>
      <p className="text-xs text-gray-600 font-mono leading-relaxed select-all bg-white p-4 rounded-lg border border-gray-100">{val || '...'}</p>
    </div>
  );
}

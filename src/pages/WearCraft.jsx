import { useState } from 'react';
import { Upload, Sparkles, Copy, Check, Camera, Box, Loader2, AlertCircle, CheckCircle2, ShieldCheck, LayoutGrid, Target, Fingerprint, ShoppingBag, User } from 'lucide-react';
import { fetchAI } from '../utils/ai';
import { AI_PROVIDERS } from '../data/providers';

const PRODUCT_TYPES = [
  { value: 'watch', label: 'ساعة يد', wearing: 'wrist' },
  { value: 'bracelet', label: 'سوار', wearing: 'wrist' },
  { value: 'ring', label: 'خاتم', wearing: 'finger' },
  { value: 'glasses', label: 'نظارة', wearing: 'eyes and face' },
  { value: 'necklace', label: 'قلادة', wearing: 'neck' },
  { value: 'earrings', label: 'أقراط', wearing: 'ears' },
  { value: 'hat', label: 'قبعة', wearing: 'head' },
  { value: 'shoe', label: 'حذاء', wearing: 'feet' },
];

const ANGLES = [
  { id: 'hero', label: 'Hero Front', desc: 'أمامي مباشر — المنتج واضح بالكامل على الأفاتار' },
  { id: 'threequarter', label: 'Three Quarter', desc: 'زاوية 45° — عمق وأبعاد' },
  { id: 'profile', label: 'Side Profile', desc: 'جانبي 90° — السُمك والخطوط' },
  { id: 'low', label: 'Low Angle', desc: 'من الأسفل للأعلى — قوة وهيبة' },
  { id: 'top', label: 'Top Angle', desc: 'علوي — تفاصيل السطح' },
  { id: 'opposite', label: 'Opposite Perspective', desc: 'زاوية مقابلية — منظور مختلف كلياً' },
];

export default function WearCraft({ apiKey, model, customEndpoint, providerId }) {
  const [productImg, setProductImg] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('watch');
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
    if (!productImg || !avatarImg) return;
    setError(null);
    if (!model) { setError('الرجاء اختيار موديل من القائمة أعلاه'); return; }
    if (!isVisionModel) { setError('هذا الموديل لا يقرأ الصور. اختر موديل رؤية (📷)'); return; }
    setLoading(true);

    const typeInfo = PRODUCT_TYPES.find(t => t.value === productType);

    const sys = `أنت WearCraft AI — Avatar Product Placement Engine. هذه الأداة ليست لتوليد صور منتجات. هدفها الأساسي هو تثبيت المنتج من الصورة المرجعية 1 على الأفاتار من الصورة المرجعية 2.

## ════════════════════════════════════════════
## ترتيب الأولوية المطلق
## ════════════════════════════════════════════

يجب اتباع هذا الترتيب بدقة:

الخطوة 1: تحليل المنتج — الشكل، الأبعاد، نقاط الارتداء
الخطوة 2: تحديد مكان الارتداء — أين يوضع المنتج على الجسم
الخطوة 3: تثبيت المنتج على الأفاتار — دمج واقعي
الخطوة 4: التحقق من التثبيت — هل هو واقعي؟ 
الخطوة 5: بعد التثبيت الناجح فقط — التقاط زوايا التصوير

الفشل في الخطوات 2-4 يعني أن المخرجات غير صالحة.

## ════════════════════════════════════════════
## قواعد تثبيت المنتج
## ════════════════════════════════════════════

${typeInfo?.value} → ${typeInfo?.wearing}

يجب أن:
- يبدو المنتج مرتدياً فعلياً على الأفاتار
- لا تُولّد صورة المنتج بمفرده
- لا يُوضع المنتج طافياً في الفضاء
- لا تُهمل الأفاتار — الأفاتار إلزامي

## ════════════════════════════════════════════
## Identity Lock (قفل هوية المنتج)
## ════════════════════════════════════════════

المنتج من الصورة المرجعية 1 هو مصدر الحقيقة.

احفظ تماماً:
- الشكل (shape) — exact match
- الأبعاد (dimensions) — exact match
- المواد (materials) — exact match
- الألوان (colors) — exact match
- العلامة التجارية (branding) — exact match
- الشعارات (logos) — exact match
- النقوش (engravings) — exact match
- القصة (gemstones) — exact match
- النسيج (textures) — exact match

ممنوع: إعادة تصميم، تبسيط، تفسير إبداعي

## ════════════════════════════════════════════
## Avatar Preservation (الحفاظ على الأفاتار)
## ════════════════════════════════════════════

الأفاتار من الصورة المرجعية 2 مقفل أيضاً.

احفظ تماماً:
- الوجه (face)
- تسريحة الشعر (hairstyle)
- شكل الجسم (body shape)
- لون البشرة (skin tone)
- الوضعية (pose)
- الملابس (clothing)

ممنوع: استبدال الأفاتار، توليد شخص آخر، تغيير الهوية

## ════════════════════════════════════════════
## التحقق من التثبيت (Placement Verification)
## ════════════════════════════════════════════

قبل توليد الصورة النهائية تحقق:
1. هل المنتج مرئي؟
2. هل المنتج ملتصق بجزء الجسم الصحيح؟
3. هل يلمس المنتج الأفاتار فعلياً؟
4. هل المقياس واقعي؟
5. هل يمكن ارتداء المنتج في الواقع؟

إذا كانت أي إجابة "لا": ⟳ أعد التوليد.

## ════════════════════════════════════════════
## قاعدة الكاميرا
## ════════════════════════════════════════════

الكاميرا تدور حول نظام الأفاتار-المنتج.
المنتج لا يغادر الأفاتار أبداً.
الأفاتار والمنتج يتصرفان كجسم واحد.

❌ خطأ: منتج بمفرده
❌ خطأ: منتج طافٍ
❌ خطأ: منتج منفصل عن الأفاتار
✓ صحيح: أفاتار يرتدي المنتج طبيعياً

## ════════════════════════════════════════════
## الزوايا الـ 6
## ════════════════════════════════════════════

بعد التثبيت الناجح، التقط 6 زوايا:

1. Hero Front — أمامي مباشر، الأفاتار يرتدي المنتج
2. Three Quarter — زاوية 45°، عمق وأبعاد
3. Side Profile — جانبي 90°، السُمك
4. Low Angle — من الأسفل للأعلى
5. Top Angle — من الأعلى للأسفل
6. Opposite Perspective — زاوية مقابلية

في جميع الزوايا: الأفاتار يجب أن يرتدي المنتج، والمنتج يجب أن يبقى ملتصقاً ومرئياً بوضوح.

## ════════════════════════════════════════════
## حالات الفشل
## ════════════════════════════════════════════

تعتبر الصورة فاشلة تلقائياً إذا:
- المنتج ظهر بمفرده
- الأفاتار اختفى
- المنتج طافٍ
- المنتج منفصل
- تغير تصميم المنتج
- تثبيت على مكان خاطئ في الجسم
- المنتج مقطوع
- المنتج أصبح إكسسواراً في الخلفية

هذه المخرجات غير صالحة ويجب إعادة توليدها.

## ════════════════════════════════════════════
## الهدف النهائي
## ════════════════════════════════════════════

توليد صور تجارية عالية الجودة حيث المنتج من المرجع 1 يُرتدى واقعياً على الأفاتار من المرجع 2. يجب أن يفهم المشاهد فوراً: "هذا الأفاتار يرتدي هذا المنتج بالضبط".

## ════════════════════════════════════════════
## قاعدة حاسمة — كل زاوية = برومبت واحد = صورة واحدة
## ════════════════════════════════════════════

🚨 هذه القاعدة ثانية لا تقل أهمية:

**كل زاوية من الزوايا الـ 6 يجب أن يكون لها برومبت مستقل ينتج صورة واحدة فقط.**

ممنوع تماماً:
- ❌ برومبت واحد ينتج صورة تحتوي على 6 زوايا (collage/grid/multi-view)
- ❌ صورة واحدة مقسمة إلى 6 أقسام
- ❌ split-screen أو compilation images
- ❌ عرض المنتج من زوايا متعددة في صورة واحدة

مطلوب:
- ✓ كل زاوية → برومبت منفصل → صورة واحدة
- ✓ 6 زوايا = 6 برومبتات = 6 صور منفصلة
- ✓ كل صورة تظهر الأفاتار يرتدي المنتج من زاوية واحدة فقط

مثال خطأ (ممنوع): "A grid of 6 angles showing the product from front, side, top..."
مثال صحيح (مطلوب): "The avatar wears the product, front view..."

## ════════════════════════════════════════════
## قاعدة حاسمة — الأفاتار في كل زاوية
## ════════════════════════════════════════════

🚨 هذه القاعدة هي الأهم في النظام بأكمله:

**كل برومبت من البرومبتات الـ 6 التالية يجب أن يذكر الأفاتار صراحةً.**

ممنوع أن يصف أي برومبت المنتج بمفرده.

مثال خطأ (ممنوع):
"High-resolution studio photo of a BENYAR watch, blue dial..."
هذا برومبت لمنتج بمفرده — مرفوض.

مثال صحيح (مطلوب):
"The avatar from Ref 2 wears the BENYAR watch on their wrist, front view, the watch product from Ref 1 is identical..."
هذا برومبت لأفاتار يرتدي المنتج — مقبول.

في كل زاوية من الزوايا الـ 6:

- اذكر الأفاتار في أول الجملة
- اذكر أن المنتج مرتدى على الأفاتار
- لا تصف المنتج كقطعة منفصلة
- الأفاتار والمنتج = جسم واحد

## ════════════════════════════════════════════
## هيكل الإخراج
## ════════════════════════════════════════════

أخرج ONLY JSON صالح. تذكير حاسم: 6 زوايا = 6 برومبتات منفصلة = 6 صور. كل برومبت يصف زاوية واحدة فقط — ممنوع collage/grid/multi-view. كل برومبت يجب أن يذكر الأفاتار والمنتج معاً.
{
  "productAnalysis": "تحليل المنتج من المرجع 1...",
  "avatarAnalysis": "تحليل الأفاتار من المرجع 2...",
  "placementInstructions": "تعليمات تثبيت المنتج على ${typeInfo?.wearing}...",
  "placementVerification": "✓ المنتج ملتصق بالجزء الصحيح ✓ المقياس واقعي",
  "angles": [
    {
      "name": "Hero Front",
      "cameraPosition": "أمامي، مستوى العين",
      "focusArea": "المنتج على الأفاتار بالكامل",
      "prompt": "The avatar from Ref 2 wears the product from Ref 1 on their ${typeInfo?.wearing}, front view, ONE angle only, identical product preservation, soft key light, portrait orientation...",
      "marketingObjective": "صورة رئيسية للتجارة الإلكترونية",
      "psychologicalImpact": "ثقة فورية"
    }
  ],
  "failureCheck": "✓ كل زاوية برومبت منفصل ✓ لا يوجد collage ✓ الأفاتار في كل البرومبتات",
  "midjourneyVersion": "The avatar from Ref 2 wearing the product from Ref 1, hero front shot --ar 3:4 --style raw --v 6.1",
  "dalleVersion": "Portrait of the avatar wearing the product, front view, single image, no grid...",
  "negativePrompt": "collage, multi-view, grid, split-screen, compilation, standalone product, floating product, product redesign..."
}`;

    const usr = `I provide two images: PRODUCT (Ref 1) and AVATAR (Ref 2).

Product: ${productName || 'Analyze from image'}
Type: ${typeInfo?.label}
Wears on: ${typeInfo?.wearing}

IMPORTANT - READ CAREFULLY:
1. The avatar is MANDATORY in ALL 6 output prompts.
2. Do NOT generate a standalone product photo in any prompt.
3. Every prompt MUST describe the avatar wearing the product.
4. The product and avatar are ONE UNIT - the camera rotates around both.
5. First attach, then photograph. Never separate.
6. EACH angle = ONE separate prompt = ONE image. No collage, no grid, no multi-view.

Output ONLY valid JSON.`;

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
      if (!parsed.angles || !parsed.angles.length) throw new Error('Response missing angles');
      const hasStandalone = parsed.angles.some(a => a.prompt && !/avatar/i.test(a.prompt));
      if (hasStandalone) {
        throw new Error('بعض البرومبتات لا تذكر الأفاتار — كل الزوايا يجب أن تظهر المنتج مرتدياً على الأفاتار. حاول مرة أخرى.');
      }
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

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50" dir="rtl">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center">
        <User className="w-6 h-6 text-indigo-600 ml-3" />
        <div>
          <h2 className="text-xl font-bold text-indigo-900">WearCraft</h2>
          <p className="text-xs text-indigo-600 mt-0.5">Avatar Product Placement Engine — تثبيت المنتج على الأفاتار + 6 زوايا</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadSlot id="prod" title="صورة المنتج (Ref 1)" subtitle="مصدر الحقيقة — هوية المنتج" icon={Box} image={productImg?.preview} onChange={(e) => handleFileUpload(e, 'product')} required />
          <UploadSlot id="av" title="صورة الأفاتار (Ref 2)" subtitle="الأفاتار إلزامي — لا يمكن توليد منتج بدونه" icon={Camera} image={avatarImg?.preview} onChange={(e) => handleFileUpload(e, 'avatar')} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="اسم المنتج" value={productName} onChange={(e) => setProductName(e.target.value)} />
          <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
            {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} ← {t.wearing}</option>)}
          </select>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        )}

        <button onClick={startAnalysis} disabled={loading || !productImg || !avatarImg} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-lg">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <User className="w-6 h-6" />}
          {loading ? 'جاري تحليل وتثبيت المنتج...' : 'تثبيت المنتج + توليد 6 زوايا'}
        </button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">تم تثبيت المنتج على الأفاتار — 6 زوايا جاهزة</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-indigo-600 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" /> تحليل التثبيت
                  </h3>
                  <Block label="المنتج (Ref 1)" val={result.productAnalysis} />
                  <Block label="الأفاتار (Ref 2)" val={result.avatarAnalysis} />
                  <Block label="تعليمات التثبيت" val={result.placementInstructions} />
                </div>

                {result.placementVerification && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <h3 className="font-bold text-sm text-emerald-600 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> التحقق من التثبيت
                    </h3>
                    <p className="text-xs text-emerald-800 leading-relaxed">{result.placementVerification}</p>
                  </div>
                )}

                {result.failureCheck && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <h3 className="font-bold text-sm text-amber-600 mb-2">⚠️ فحص حالات الفشل</h3>
                    <p className="text-xs text-amber-800 leading-relaxed">{result.failureCheck}</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-indigo-600 mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" /> الزوايا الـ 6
                  </h3>
                  <div className="space-y-4">
                    {result.angles?.map((angle, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow">{i + 1}</div>
                            <span className="text-sm font-bold text-gray-800">{angle.name}</span>
                          </div>
                          <button onClick={() => copyText(angle.prompt, `a${i}`)} className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 transition-all text-xs font-bold flex items-center gap-1.5">
                            {copiedId === `a${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} نسخ
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <span className="text-xs text-gray-500"><span className="font-bold">الكاميرا:</span> {angle.cameraPosition}</span>
                          <span className="text-xs text-gray-500"><span className="font-bold">التركيز:</span> {angle.focusArea}</span>
                        </div>
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
                  {result.negativePrompt && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm text-rose-600">🚫 Negative</h4>
                        <button onClick={() => copyText(result.negativePrompt, 'neg')} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg text-rose-700 transition-all text-xs font-bold">{copiedId === 'neg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}</button>
                      </div>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100">{result.negativePrompt}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadSlot({ id, title, subtitle, icon: Icon, image, onChange, required }) {
  return (
    <div onClick={() => document.getElementById(id)?.click()} className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-64 overflow-hidden ${image ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}>
      <input id={id} type="file" className="hidden" onChange={onChange} accept="image/*" />
      {image ? <img src={image} className="max-h-full rounded-lg shadow-md relative z-10" alt="" />
      : <div className="text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto text-indigo-500"><Icon className="w-6 h-6" /></div>
          <p className="font-bold text-gray-800">{title} {required && <span className="text-red-500">*</span>}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>}
    </div>
  );
}

function Block({ label, val }) {
  return <div><span className="text-xs font-bold text-gray-500 block mb-1">{label}</span><p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{val || '...'}</p></div>;
}

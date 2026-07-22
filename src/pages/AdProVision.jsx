import { useState } from 'react';
import { Upload, Sparkles, Copy, ChevronRight, Loader2, Zap, Type, Camera, AlertCircle } from 'lucide-react';
import { fetchAI } from '../utils/ai';
import { AI_PROVIDERS } from '../data/providers';

export default function AdProVision({ apiKey, model, customEndpoint, providerId }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [refImage, setRefImage] = useState(null);
  const [prodImage, setProdImage] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ productDescription: '', mainText: '', var1Text: '', var2Text: '' });
  const [advancedMode, setAdvancedMode] = useState('cinematic');

  const modes = [
    { id: 'cinematic', label: '🎬 سينمائي', desc: 'لغة سينمائية، عدسات anamorphic، عمق ميدان درامي' },
    { id: 'luxury', label: '💎 فاخر', desc: 'فخامة عالية، بساطة، مواد ثمينة' },
    { id: 'social', label: '📱 سوشيال ميديا', desc: 'محسّن للمنصة، تفاعلي، عصري' },
    { id: 'ecommerce', label: '🛍️ متجر إلكتروني', desc: 'مركز على المنتج، نظيف، يركز على التحويل' },
    { id: 'billboard', label: '🪧 لوحة إعلانية', desc: 'حجم كبير، جريء، عالي التأثير' },
  ];

  const isVisionModel = true;

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result, 800, 0.7).then(compressed => {
        const img = { base64: compressed.split(',')[1], mimeType: 'image/jpeg', preview: reader.result };
        if (type === 'ref') setRefImage(img);
        else setProdImage(img);
      });
    };
    reader.readAsDataURL(file);
  };

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

  const startAnalysis = async () => {
    if (!refImage || !prodImage) return;
    setError(null);
    if (!isVisionModel) { setError('هذا الموديل لا يقرأ الصور.'); return; }
    setLoading(true);

    const modeName = modes.find(m => m.id === advancedMode)?.label || 'سينمائي';
    const modeInstructions = {
      cinematic: 'استخدم لغة سينمائية: عدسات anamorphic (2.35:1)، عمق ميدان ضحل (T2.8)، grading سينمائي (Teal/Orange)، إضاءة درامية. أضف تأثيرات ضبابية (Vignette, Grain, Chromatic Aberration).',
      luxury: 'استخدم لغة الفخامة: إضاءة ناعمة عالية التباين، خلفيات نظيفة minimalist، مواد ثمينة (ذهب، زجاج، رخام، حرير)، ألوان هادئة (أسود، ذهبي، أبيض، كحلي)، تركيز على الملمس والتفاصيل.',
      social: 'محسّن للسوشيال ميديا: تنسيق مربع/عمودي، إضاءة مشرقة، ألوان نابضة، مؤثرات بصرية جذابة (Gradients, Glows, Bokeh)، تركيز على التفاعل والمشاركة.',
      ecommerce: 'محسّن للمتاجر الإلكترونية: تركيز كامل على المنتج، خلفية بيضاء/نظيفة، إضاءة 360°، ألوان صادقة، وضوح تام للتفاصيل والنسيج، نسبة 1:1 أو 4:5.',
      billboard: 'تصميم للوحات الإعلانية الكبيرة: تباين عالٍ جداً، ألوان جريئة (primary colors)، طباعة واضحة وكبيرة، بساطة في التكوين، تأثير عالي من مسافة بعيدة.',
    }[advancedMode] || '';
    const sys = `أنت AdPro Vision AI — خبير تحليل الصور الإعلانية ومهندس البرومبتات البصرية. مهمتك: تحليل الصورة المرجعية (إعلان بنص) وصورة المنتج، ثم توليد برومبتات احترافية لتوليد الصور بالذكاء الاصطناعي.

## ════════════════════════════════════════════
## 1.  التحليل البصري العميق (Deep Visual Analysis)
## ════════════════════════════════════════════

افحص الصورة المرجعية بتفصيل دقيق في هذه المجالات:

🔦 **الإضاءة (Lighting):**
- النوع (Key/Fill/Rim/Backlight/Natural/Studio)
- الاتجاه (علوي/جانبي/خلفي/45°)
- الجودة (ناعمة/قاسية/منتشرة/مركزة)
- المعدّلات (Softbox/Umbrella/Octabox/Beauty Dish/Grid)
- النسبة (Key:Fill ratio)
- درجة الحرارة (دافئ/باريد/نهاري/طبيعي)

📐 **التركيب (Composition):**
- موضع العناصر (مركز/قاعدة/يسار/يمين)
- التوازن (متناظر/غير متناظر/لوني/شكلي)
- المساحة السلبية وتوزيع الفراغ
- قاعدة الأثلاث وخطوط التوجيه
- العمق (مقدمة/وسط/خلفية)
- النسبة (16:9 / 4:5 / 1:1 / 9:16)

🎥 **الكاميرا والعدسة (Camera & Lens):**
- الزاوية (عين الطائر/عالية/مستوية/منخفضة/عين الدودة)
- الارتفاع (نسبة للعين/المنتج)
- البُعد البؤري (14mm واسع / 35mm تقريبي / 85mm بورتريه / 200mm تليفوتو)
- فتحة العدسة (f/1.4 ضحلة / f/8 حادة / f/16 عميقة)
- نوع العدسة (Prime/Zoom/Macro/Tilt-Shift/Anamorphic)

🎨 **علم الألوان (Color Science):**
- اللوحة السائدة (Complementary/Analogous/Monochromatic/Triad)
- التشبّع (حيوي/مكتوم/أسود وأبيض/انتقائي)
- التباين (عالي/Soft/لوني/درامي)
- درجة الحرارة (دافئ بدرجة كلفن / باريد / مختلط / Neutrals)
- Grading (Teal & Orange / Bleach Bypass / Cross Processing / Vintage / LUTs)

🔤 **الطباعة (Typography):**
- نوع الخط (Serif / Sans-Serif / Script / Display / Custom)
- الحجم والموضع (علوي/وسط/سفلي/شيفرون)
- اللون والتأثيرات (تظليل/حدود/تدرج/شفافية/Glow)
- التسلسل الهرمي (عنوان / subtitle / CTA)
- التكامل مع الصورة (Mask / Blend / Overlay)
- المسافة (Tracking / Leading / Kerning)

## ════════════════════════════════════════════
## 2.  محرك دمج المنتج (Product Integration Engine)
## ════════════════════════════════════════════

عند دمج المنتج في سيناريو الصورة المرجعية:
- طابق إضاءة المنتج تماماً مع الإضاءة الأصلية (الاتجاه، الكثافة، درجة الحرارة)
- حافظ على تركيب الصورة المرجعية (نفس توزيع العناصر)
- حافظ على تناغم الألوان (استخدم نفس اللوحة والتدرج)
- ادمج النص الجديد بسلاسة (نفس نمط الخط، الموضع، التأثيرات)
- تأكد من تناسب حجم المنتج مع السيناريو (Scale / Perspective / Shadows)

## ════════════════════════════════════════════
## 3.  إطار توليد البرومبتات (Prompt Generation Framework)
## ════════════════════════════════════════════

قم بإنشاء 3 برومبتات (Master + Variation A + Variation B):

**Master Prompt:** برومبت كامل وشامل — أسلوب المصور + وصف المشهد + إضاءة + كاميرا + ألوان + مزاج + المنتج بنفس أسلوب المرجع + النص الإعلاني المطلوب + معدّلات الجودة.

**Variation A:** تكوين أو زاوية بديلة — حافظ على نفس نمط الإضاءة والألوان والمزاج ولكن غيّر زاوية الكاميرا أو وضعية المنتج أو البعد البؤري.

**Variation B:** مزاج أو ألوان بديلة — حافظ على نفس التركيب ولكن غيّر المزاج العام أو تدرج الألوان (مثلاً نسخة دافئة/باريدة/درامية).

كل برومبت يجب أن يتضمن:
- مصطلح تصوير فوتوغرافي محدد (نوع الكاميرا، العدسة، f-stop)
- مصطلحات الجودة (hyper-realistic, subsurface scattering, volumetric, 8K, detailed textures)
- لغة إعلانية (مقنعة، عاطفية، موجهة للتحويل)
- النص الإعلاني مدمج في التصميم بنفس أسلوب المرجع

## ════════════════════════════════════════════
## 4.  معايير الجودة (Quality Standards)
## ════════════════════════════════════════════

قيّم كل برومبت بناءً على:
- **التوافق مع المرجع (30%):** مدى دقة محاكاة الإضاءة والتركيب والألوان
- **الدقة البصرية (25%):** واقعية الإضاءة، الظلال، الانعكاسات، الدمج
- **اتساق العلامة التجارية (20%):** توافق النمط مع هوية المنتج
- **تكامل النص (15%):** دمج النص بسلاسة في التصميم
- **الجودة الشاملة (10%):} القوة الإقناعية والإبداعية للبرومبت

## ════════════════════════════════════════════
## 5.  الوضع المتقدم: ${modeName}
## ════════════════════════════════════════════

${modeInstructions}

## ════════════════════════════════════════════
## 6.  هيكل الإخراج (Output Structure)
## ════════════════════════════════════════════

أخرج ONLY JSON صالح (بدون Markdown، بدون نص إضافي) بهذا الهيكل بالضبط:
{
  "deepAnalysis": {
    "lighting": "تحليل دقيق للإضاءة...",
    "composition": "تحليل التركيب...",
    "cameraAngle": "تحليل زاوية الكاميرا والعدسة...",
    "background": "تحليل الخلفية...",
    "colors": "تحليل الألوان...",
    "mood": "تحليل المزاج...",
    "effects": "تحليل التأثيرات...",
    "typography": "تحليل الخطوط والطباعة...",
    "marketingPsychology": "تحليل سيكولوجية التسويق..."
  },
  "masterPrompt": "البرومبت الرئيسي الكامل...",
  "variationA": "البديل A (تكوين/زاوية مختلفة)...",
  "variationB": "البديل B (مزاج/ألوان مختلفة)...",
  "midjourneyVersion": "Midjourney prompt --ar 16:9 --style raw --v 6.1",
  "dalleVersion": "DALL-E 3 prompt...",
  "fluxVersion": "Flux prompt...",
  "negativePrompt": "نفي: يشيل التشويه فقط، لا يشيل النص",
  "qualityReport": {
    "alignmentScore": "85% - توافق ممتاز مع المرجع في الإضاءة والتركيب",
    "visualFidelity": "90% - دقة بصرية عالية مع دمج واقعي",
    "brandConsistency": "80% - اتساق جيد مع هوية المنتج",
    "textIntegration": "75% - النص مدمج بسلاسة مع التصميم",
    "overall": "85% - برومبت قوي واحترافي"
  }
}`;

    const usr = `I provide two images: a Reference Image (social media ad with text) and a Product Image.

Product: ${formData.productDescription || 'A commercial product'}
Main Text: "${formData.mainText}"
Variation 1: "${formData.var1Text}"
Variation 2: "${formData.var2Text}"
Advanced Mode: ${modeName}

Analyze the reference image deeply. Generate professional prompts that place my product in the same scene with identical style, lighting, composition, colors and mood. The generated image MUST include the text "${formData.mainText}" styled like the reference ad's typography. Apply the "${modeName}" advanced mode rules. Output ONLY valid JSON.`;

    try {
      const raw = await fetchAI({
        apiKey, provider: providerId || 'nvidia', model: model || 'deepseek-ai/deepseek-v4-flash', customEndpoint,
        prompt: usr,
        images: [refImage, prodImage],
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
          throw new Error(`الرد ليس JSON صحيح. الرد الأصلي:\n${raw.slice(0, 500)}`);
        }
      }
      if (!parsed.masterPrompt) throw new Error('Response missing masterPrompt');
      setResult(parsed);
      setStep(2);
    } catch (err) {
      setError('حدث خطأ أثناء التحليل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50" dir="rtl">
      {step === 1 ? (
        <div className="p-6 space-y-8">
          <div className="bg-violet-50 px-6 py-4 border-b border-violet-100 flex items-center">
            <Camera className="w-6 h-6 text-violet-600 ml-3" />
            <h2 className="text-xl font-bold text-violet-900">AdPro Vision - تحليل الصور الإعلانية</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadSlot id="ref" title="الصورة المرجعية (Style)" subtitle="لتحليل الإضاءة والتكوين" image={refImage?.preview} onChange={(e) => handleFileUpload(e, 'ref')} />
            <UploadSlot id="prod" title="صورة المنتج" subtitle="لاستخراج التفاصيل" image={prodImage?.preview} onChange={(e) => handleFileUpload(e, 'prod')} />
          </div>
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{error}</span>
            </div>
          )}
          <div className="bg-white border border-gray-200 p-6 rounded-xl">
            <h3 className="text-sm font-bold text-violet-600 mb-4 flex items-center gap-2">
              <Type className="w-4 h-4" /> إعدادات النص
            </h3>
            <div className="space-y-4">
              <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-gray-50" rows="2" placeholder="وصف المنتج..." value={formData.productDescription} onChange={(e) => setFormData({...formData, productDescription: e.target.value})} />
              <div className="grid grid-cols-3 gap-4">
                <input type="text" className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-gray-50" placeholder="النص الرئيسي" value={formData.mainText} onChange={(e) => setFormData({...formData, mainText: e.target.value})} />
                <input type="text" className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-gray-50" placeholder="نص بديل 1" value={formData.var1Text} onChange={(e) => setFormData({...formData, var1Text: e.target.value})} />
                <input type="text" className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-gray-50" placeholder="نص بديل 2" value={formData.var2Text} onChange={(e) => setFormData({...formData, var2Text: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-xl">
            <h3 className="text-sm font-bold text-violet-600 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> الوضع المتقدم
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {modes.map(m => (
                <button key={m.id} onClick={() => setAdvancedMode(m.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${advancedMode === m.id ? 'bg-violet-600 text-white border-violet-600 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-violet-300'}`}>
                  <div className="text-lg mb-1">{m.label.split(' ')[0]}</div>
                  <div className="text-xs font-bold">{m.label.split(' ').slice(1).join(' ')}</div>
                  <div className="text-[10px] opacity-70 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={startAnalysis} disabled={loading || !refImage || !prodImage} className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-lg">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
            {loading ? 'جاري التحليل...' : 'بدء التحليل البصري'}
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <button onClick={() => setStep(1)} className="flex items-center gap-2 text-violet-600 font-bold text-sm hover:bg-violet-50 px-4 py-2 rounded-lg transition-all w-fit border border-violet-200">
            <ChevronRight className="w-4 h-4" /> تعديل المدخلات
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-violet-600">تحليل الصورة</h3>
                <Block label="الإضاءة" val={result?.deepAnalysis?.lighting} />
                <Block label="التركيب" val={result?.deepAnalysis?.composition} />
                <Block label="زاوية الكاميرا" val={result?.deepAnalysis?.cameraAngle} />
                <Block label="الخلفية" val={result?.deepAnalysis?.background} />
                <Block label="الألوان" val={result?.deepAnalysis?.colors} />
                <Block label="المزاج" val={result?.deepAnalysis?.mood} />
                <Block label="التأثيرات" val={result?.deepAnalysis?.effects} />
                <Block label="الطباعة (Typography)" val={result?.deepAnalysis?.typography} />
                <Block label="سيكولوجية التسويق" val={result?.deepAnalysis?.marketingPsychology} />
              </div>
              {result?.textAnalysis?.font && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-amber-600">تحليل النصوص</h3>
                  <Block label="الخط" val={result.textAnalysis.font} />
                  <Block label="الحجم والموضع" val={result.textAnalysis.sizeAndPlacement} />
                  <Block label="الألوان والتأثيرات" val={result.textAnalysis.colorAndEffects} />
                  <Block label="النمط" val={result.textAnalysis.style} />
                </div>
              )}
              {(result?.qualityReport) && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-emerald-600">📊 تقرير الجودة</h3>
                  {result.qualityReport.alignmentScore && <QBar label="التوافق مع المرجع" val={result.qualityReport.alignmentScore} />}
                  {result.qualityReport.visualFidelity && <QBar label="الدقة البصرية" val={result.qualityReport.visualFidelity} />}
                  {result.qualityReport.brandConsistency && <QBar label="اتساق العلامة" val={result.qualityReport.brandConsistency} />}
                  {result.qualityReport.textIntegration && <QBar label="تكامل النص" val={result.qualityReport.textIntegration} />}
                  {result.qualityReport.overall && <QBar label="الجودة الشاملة" val={result.qualityReport.overall} highlight />}
                </div>
              )}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-violet-600 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> البرومبتات الاحترافية
                </h3>
                <div className="space-y-4">
                  <PBlock title="Master Prompt" val={result?.masterPrompt || result?.mainPrompt} onCopy={() => copyText(result?.masterPrompt || result?.mainPrompt)} />
                  <PBlock title="Variation A" val={result?.variationA || result?.variation1} onCopy={() => copyText(result?.variationA || result?.variation1)} />
                  <PBlock title="Variation B" val={result?.variationB || result?.variation2} onCopy={() => copyText(result?.variationB || result?.variation2)} />
                  {result?.negativePrompt && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-rose-500">Negative Prompt</span>
                        <button onClick={() => copyText(result.negativePrompt)} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg text-rose-700 transition-all text-xs font-bold">نسخ</button>
                      </div>
                      <p className="text-xs text-gray-600 font-mono bg-white p-3 rounded-lg border border-rose-100">{result.negativePrompt}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result?.midjourneyVersion && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm text-indigo-600">🎨 Midjourney</h4>
                      <button onClick={() => copyText(result.midjourneyVersion)} className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 transition-all text-xs font-bold">نسخ</button>
                    </div>
                    <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{result.midjourneyVersion}</p>
                  </div>
                )}
                {result?.dalleVersion && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm text-emerald-600">🤖 DALL·E 3</h4>
                      <button onClick={() => copyText(result.dalleVersion)} className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-700 transition-all text-xs font-bold">نسخ</button>
                    </div>
                    <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{result.dalleVersion}</p>
                  </div>
                )}
                {result?.fluxVersion && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm text-orange-600">⚡ Flux</h4>
                      <button onClick={() => copyText(result.fluxVersion)} className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 rounded-lg text-orange-700 transition-all text-xs font-bold">نسخ</button>
                    </div>
                    <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{result.fluxVersion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function copyText(t) { if (t) navigator.clipboard.writeText(t); }

function combineImages(img1, img2) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(), 8000);
    const c = document.createElement('canvas');
    const x = c.getContext('2d');
    const a = new Image(), b = new Image();
    let n = 0;
    const go = () => { n++; if (n === 2) {
      clearTimeout(t);
      const gap = 16;
      const w1 = a.naturalWidth || a.width, h1 = a.naturalHeight || a.height;
      const w2 = b.naturalWidth || b.width, h2 = b.naturalHeight || b.height;
      if (!w1||!h1||!w2||!h2) { reject(); return; }
      const mh = Math.max(h1, h2);
      c.width = w1 + gap + w2; c.height = mh;
      x.fillStyle = '#fff'; x.fillRect(0,0,c.width,c.height);
      x.drawImage(a,0,(mh-h1)/2,w1,h1);
      x.drawImage(b,w1+gap,(mh-h2)/2,w2,h2);
      const url = c.toDataURL('image/jpeg',0.92);
      resolve({ base64: url.split(',')[1], mimeType: 'image/jpeg', preview: url });
    }};
    a.onload = go; a.onerror = () => { clearTimeout(t); reject(); };
    b.onload = go; b.onerror = () => { clearTimeout(t); reject(); };
    a.src = img1.preview; b.src = img2.preview;
  });
}

function UploadSlot({ id, title, subtitle, image, onChange }) {
  return (
    <div onClick={() => document.getElementById(id)?.click()} className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-64 overflow-hidden ${image ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400 bg-white'}`}>
      <input id={id} type="file" className="hidden" onChange={onChange} accept="image/*" />
      {image ? <img src={image} className="max-h-full rounded-lg shadow-md relative z-10" alt="" />
      : <div className="text-center">
          <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-4 mx-auto text-violet-500"><Upload className="w-6 h-6" /></div>
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
  const pct = parseInt(val);
  const color = !isNaN(pct) ? (pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-violet-400';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        <span className={`text-xs font-bold ${highlight ? 'text-emerald-600' : 'text-gray-400'}`}>{val?.split('-')[0]?.trim() || val}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(isNaN(pct) ? 80 : pct, 100)}%` }} />
      </div>
      {val?.includes('-') && <p className="text-[10px] text-gray-400 mt-0.5">{val.split('-').slice(1).join('-').trim()}</p>}
    </div>
  );
}

function PBlock({ title, val, onCopy }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-gray-500">{title}</span>
        <button onClick={onCopy} className="px-3 py-1.5 bg-violet-100 hover:bg-violet-200 rounded-lg text-violet-700 transition-all text-xs font-bold flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> نسخ</button>
      </div>
      <p className="text-xs text-gray-600 font-mono leading-relaxed select-all bg-white p-4 rounded-lg border border-gray-100">{val || '...'}</p>
    </div>
  );
}

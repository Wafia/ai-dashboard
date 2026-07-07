import { useState, useEffect, useRef } from 'react';
import { Sparkles, Mic, Target, Copy, CheckCircle, AlertTriangle, Play, RefreshCw, Download, Volume2, User, Info, Activity, XOctagon, ChevronDown, Star, TrendingUp, MessageCircle, Bookmark, Clock, Pen } from 'lucide-react';
import { fetchAI } from '../utils/ai';

const VOICES = [
  { id: 'v1', name: 'طارق', gender: '👨', type: 'صوت عميق وفخم', desc: 'مثالي للإعلانات الرسمية والعقارات', color: 'from-blue-600 to-blue-800' },
  { id: 'v2', name: 'سارة', gender: '👩', type: 'عفوي وطبيعي', desc: 'ممتاز لفيديوهات الـ UGC والتيك توك', color: 'from-pink-500 to-rose-600' },
  { id: 'v3', name: 'سفيان', gender: '👨', type: 'حماسي وسريع', desc: 'يخطف الانتباه في أول ثانية', color: 'from-orange-500 to-red-600' },
  { id: 'v4', name: 'فاطمة', gender: '👩', type: 'دافئ وهادئ', desc: 'للقصص، الشروحات، وبناء الثقة', color: 'from-emerald-500 to-teal-600' },
  { id: 'v5', name: 'رياض', gender: '👨', type: 'درامي ومشوق', desc: 'يخلق حالة من الغموض والترقب', color: 'from-purple-600 to-indigo-800' },
  { id: 'v6', name: 'ياسمين', gender: '👩', type: 'نشيط ومرح', desc: 'للمنتجات الشبابية والجمال', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'v7', name: 'كريم', gender: '👨', type: 'موثوق واحترافي', desc: 'لخدمات الـ B2B والشركات', color: 'from-slate-600 to-slate-800' },
  { id: 'v8', name: 'أمينة', gender: '👩', type: 'عاطفي وحنون', desc: 'للمنتجات العائلية والأطفال', color: 'from-sky-400 to-blue-500' },
  { id: 'v9', name: 'نبيل', gender: '👨', type: 'تفاعلي ويوتيوبر', desc: 'شرح منتجات التقنية والريفيوهات', color: 'from-yellow-500 to-orange-600' },
  { id: 'v10', name: 'ليلى', gender: '👩', type: 'فخم وناعم', desc: 'للعطور، المجوهرات، والأناقة', color: 'from-violet-500 to-purple-700' },
];

const PRODUCT_CATEGORIES = [
  { id: 'fashion', label: '👕 ملابس وأزياء' },
  { id: 'perfume', label: '🌹 عطور' },
  { id: 'watch', label: '⌚ ساعات ومجوهرات' },
  { id: 'cosmetics', label: '💄 مكياج وكريمات' },
  { id: 'electronics', label: '📱 أجهزة وهواتف' },
  { id: 'food', label: '🍽️ مطاعم وأكل' },
  { id: 'service', label: '📚 خدمات ودورات' },
  { id: 'accessories', label: '👜 إكسسوارات' },
  { id: 'cleaning', label: '🧹 تنظيف وترتيب' },
  { id: 'furniture', label: '🪑 أثاث وديكور' },
  { id: 'sports', label: '🏋️ رياضة ولياقة' },
  { id: 'other', label: '🔹 أخرى' },
];

const PRICE_RANGES = [
  { id: '', label: '— اختر (اختياري) —' },
  { id: 'cheap', label: 'رخيص (أقل من 2000 دج)' },
  { id: 'medium', label: 'متوسط (2000 - 10000 دج)' },
  { id: 'expensive', label: 'غالي (10000 - 50000 دج)' },
  { id: 'luxury', label: 'فاخر (أكثر من 50000 دج)' },
];

const MARKET_TYPES = [
  { id: 'new', label: '🆕 جديد - السوق ما زال ناشئ' },
  { id: 'moderate', label: '⚖️ منافسة متوسطة' },
  { id: 'saturated', label: '🔥 مشبع - منافسة عالية' },
];

const TONES = {
  'حماسي': { desc: 'طاقة عالية، يرفع مستوى الحماس ويدفع لاتخاذ قرار سريع.', example: 'يا جماعة، لقيتلكم واحد العفسة هبااال!' },
  'عفوي (طبيعي)': { desc: 'كأنه يتحدث مع صديق، بدون تكلف أو تصنع، يبني ثقة فورية.', example: 'والله غير منتج مليح، جربتو و راني نهضرك من لخر.' },
  'هادئ وشرح': { desc: 'يبني الثقة ويشرح المشكلة والحل بهدوء وعقلانية.', example: 'بشوية برك، نفهمك كيفاش تخدم بيها خطوة بخطوة.' },
  'درامي مشوق': { desc: 'يجذب الانتباه بالغموض، ويجعل المشاهد ينتظر النهاية.', example: 'تخيل معايا... في دقيقة وحدة، كلش يتبدل!' },
  'فخم ورسمي': { desc: 'يستهدف الطبقة الراقية والمنتجات عالية السعر.', example: 'لأنك تستاهل غير الحاجة الشابة، جبنالك الأفضل.' },
  'استعجالي': { desc: 'يخلق شعوراً بالخوف من ضياع الفرصة (FOMO).', example: 'ما تضيعش الفرصة! الكمية راهي محدودة بزاف.' },
};

const ENGINE_SYSTEM_PROMPT = `أنت كاتب سكربتات إعلانية محترف متخصص في السوق الجزائري. تكتب بالدارجة الجزائرية الحقيقية — ليس المصرية ولا الفصحى ولا الخليجية. كل سكربت: Hook + Body + CTA.

## وضع العمل
إذا أول كلمة في طلب المستخدم "عدّل" ← أنت في وضع التعديل. غيّر السكربت الحالي. يجب أن يختلف في جملة واحدة على الأقل. لا تخرجه كما هو.
إذا أول كلمة "اكتب" ← أنت في وضع الكتابة.

## 🟡 القاعدة الذهبية: LIFE SITUATION ENGINE
"Never start from the product. Always start from the moment in which the customer realizes they need the product."

لا تبدأ بالمنتجات. ابدأ من **المناسبة** — اللحظة اللي يقرر فيها العميل "أحتاج هذا".
إذا أول جملة تذكر المنتج → أعد كتابتها.

## 🔵 الخطوة الإجبارية قبل الكتابة: MICRO-DETAIL ENGINE
⚠️ هذه أهم خطوة. السكربتات المتوقعة تفشل. السكربتات اللي فيها **تفصيل صغير** هي اللي تنجح.

قبل كتابة أي حرف، اتبع هذا التسلسل:

1. **اختر مناسبة** (خرجة، عزومة، دوام، عيد، حفلة...)
2. **ابحث عن تفصيل صغير واحد** يعيشه العميل في هاد المناسبة.
   - "تفتحي الدولاب"
   - "تنحي الصباط"
   - "تفتحي Ads Manager"
   - "تسمعي الجرس"
   - "تشوفي الإشعار"
   - "تطلعي الدروج"
   - "تقفي قدام المراية"
3. **ابنِ الـHook من التفصيل الصغير** موش من المشكلة الكبيرة.
4. **خلّي المشاعر تظهر** بعد التفصيل.
5. **دخل المنتج بشكل طبيعي** (متل ما يدخل في الحياة الحقيقية).
6. **الفائدة** — شكون يتغير بعد المنتج.
7. **CTA** — خطوة واحدة واضحة.

### الفرق بين السكربت العادي والسكربت اللي فيه تفصيل صغير:
- ❌ "عندك عزومة وتحسي محتاجة شيء راقي" ← عام، متوقع
- ✅ "عندك عزومة ضهرية... تفتحي الدولاب... وكل عباية تشوفيها تقولي: لا، هادي ثقيلة على هاد السخانة" ← تفصيل صغير، يحسس المشاهد "هاد أنا"
- ❌ "تتعب في الخدمة وتحتاج حذاء مريح" ← عام
- ✅ "آخر الحصة... الجرس رن... الطلبة خرجوا... وأنت ناوي تنحي الصباط" ← تفصيل صغير

### التسلسل الصحيح للسكربت:
1. مشهد (تفصيل صغير)
2. الإحساس اللي يجي مع التفصيل
3. المنتج يدخل بشكل طبيعي
4. الفائدة
5. CTA

## قواعد الكتابة
- الجمل قصيرة ومباشرة
- الـHook يشد الانتباه في ثاني واحد
- تخاطب المشكلة اللي يعيشها الجمهور فعلاً
- CTA واحد وواضح في الآخر
- تجنب الكلام الفارغ والمدح الزائد
- لا تستعمل كلمات "رائع، مذهل، استثنائي، ثوري، ممتاز"
- تكلم بلسان عميل حقيقي — ليس بلسان بائع
- ❌ "هل تعاني من؟ نقدم لكم يتيح لك لا تفوت الغرصة"
- ❌ "غير حياتك الحل الثوري المستوى التالي من الصفر للقمة"
- ❌ "ديال (مغربي) شنو آش خلاص كده"
- ✅ استعمل: "برك، بزاف، شويا، دوك، هكا، واش، راه، غير، دابا"

## ⏱️ المدة
15 ث = 35-45 كلمة | 20 ث = 45-65 | 25 ث = 65-85

═══════════════════════════════
📌 أمثلة مرجعية — اكتب بنفس الأسلوب والإيقاع
═══════════════════════════════

───────────────
مثال 1 — عباية / تفصيل صغير
───────────────
المنتج: عباية صيفية خفيفة | الجمهور: نساء 25-45
Hook: الساعة زوج... عندك خرجة... وأنتِ مازلتِ قدام الدولاب...
Body: الحر راهي طالعة... والعبايات لي عندك كامل تقيلة وتعرّق. أنا كان عندي نفس المشكل... حتى جبت هاد العباية. خفيفة، واسعة، مريحة، وباردة. تلبسيها وتخرجي مرتاحة من الصباح للعشية.
CTA: شوفيها من الرابط قبل ما تخلص الكمية.

───────────────
مثال 2 — عطر رجالي / تفصيل صغير
───────────────
المنتج: عطر يدوم طويل | الجمهور: رجال 20-40
Hook: راجل دخل... وكل الناس داروا يشوفوه. مش بسبب وجهه...
Body: كان ريحته. عطر ما يزيدش... ما ينقصش... يبقى معك من الصباح للليل. جربت بزاف عطور — يروحوا في ساعتين. هاد الواحد مرة جاتني مرأة وقالتلي "واش هاد الريحة؟"
CTA: الرابط في البيو. جرب وحكيلنا.

───────────────
مثال 3 — سماعة / FOMO
───────────────
المنتج: سماعة لاسلكية | الجمهور: شباب 18-35
Hook: كل واحد في الدار يسمعك تسمع الموسيقى... وأنت تتعذب معاه؟
Body: راك تدفع على ضوضاء، على سلك يتقطع، وعلى صوت يصنط. هاد السماعة — بلوتوث، صوت نقي، تدوم 24 ساعة. الكمية باقيت 12 حبة بس.
CTA: اضغط على الرابط دابا قبل ما تخلص.

───────────────
مثال 4 — مطعم بيتزا / يومي
───────────────
المنتج: مطعم بيتزا توصيل | الجمهور: عائلات وشباب
Hook: كل يوم جمعة نفس السؤال: "واش ناكلو اليوم؟"
Body: يتحاكموا... كل واحد يحب شيء... وفي الأخير ما تتفقوا. حل واحد يرضي الكل: بيتزا كبيرة تجي لعندكم في 30 دقيقة. طازجة، ساخنة، وبأسعار ما تندمش.
CTA: اطلبوا دابا — رابط الطلب في البيو.

───────────────
مثال 5 — دورة تسويق / سلطة
───────────────
المنتج: دورة تسويق رقمي | الجمهور: أصحاب مشاريع صغيرة
Hook: علاش إعلاناتك ما تعطيش نتائج؟
Body: مش بسبب المنتج... ولا بسبب الصور... المشكلة في الطريقة. أنا خدمت مع 200 صاحب مشروع في الجزائر — وكلهم كانوا يغلطوا في نفس الشيء. في هاد الدورة نوريك خطوة بخطوة كيفاش تدير إعلان يبيع فعلاً.
CTA: التسجيل مفتوح حتى الأحد. الرابط قدامك.

───────────────
مثال 7 — خلاط عصائر محمول / يومي (عام)
───────────────
المنتج: خلاط عصائر محمول قابل للشحن | الجمهور: موظفون وطلاب | الزاوية: Relatable
Hook: الصباح مستعجل... ما عندكش وقت حتى تفطر.
Body: كل مرة تقول: "غدوة نبدا ناكل صحي"... وبسبب الوقت تخرج بلا فطور. مع هاد الخلاط، دير الفواكه لي تحبها، اضغط زر واحد، وأقل من دقيقة يكون العصير جاهز. صغير، يتشحن بـ USB، وتديه معاك للخدمة، للجامعة، ولا حتى للجيم.
CTA: إذا حاب تاكل صحي بلا ما تضيع وقت، الرابط راه تحت.

───────────────
مثال 8 — خلاط عصائر / جيم
───────────────
المنتج: خلاط عصائر محمول | الجمهور: رياضيون | الزاوية: Convenience
Hook: كملت التمرين... ودرت لفة على كامل المحلات باش تلقى عصير مليح.
Body: وفي الأخير، تلقى غير عصائر عامرين سكر. مع هاد الخلاط، دير المكونات لي تحبها، واخلطهم وين ما كنت. بروتين، فواكه، سموذي... كلش في دقيقة، وبلا كهرباء، وبلا صداع.
CTA: إذا راك تهتم بصحتك، هذا الجهاز راح يرافقك كل نهار.

───────────────
مثال 9 — خلاط عصائر / مكتب
───────────────
المنتج: خلاط عصائر محمول | الجمهور: موظفون | الزاوية: Problem-Solution
Hook: الساعة عشرة... حسيت بالجوع... وما لقيتش غير ماكينة القهوة.
Body: بدل كل مرة تشري سناك ما يفيدكش، حضر عصيرك بنفسك. الخلاط صغير، يدخل في الشنطة، يتشحن بسهولة، ويخليك ديما عندك مشروب صحي وين ما تكون.
CTA: اطلبه اليوم، وخلي العصير الصحي ديما معاك.

───────────────
مثال 6 — كريم / قبل وبعد
───────────────
المنتج: كريم تبييض طبيعي | الجمهور: نساء 20-45
Hook: قبل: وجه متعب وبقع. بعد 3 أسابيع: ناس يسقسوك "واش دارتي؟"
Body: مش سحر. مش كيمياء. مكونات طبيعية 100٪ — بدون بيلنج، بدون احتراق. تستعمليه في الليل — وتفيقي وجهك ناعم وضاهر.
CTA: جربيه لـ 21 يوم — وإلا نرجعولك الفلوس. الرابط في البيو.

## 🚪 CRITIC GATES — كلها PASS قبل الإخراج
إذا أي FAIL → أعد الكتابة:
1. 🔵 تفصيل صغير: هل في السكربت تفصيل صغير واحد يعيشه العميل؟ (تفتحي الدولاب، تنحي الصباط، تسمعي الجرس). إذا لا → FAIL
2. 🟡 مناسبة: أول جملة = مناسبة. لا تذكر المنتج
3. 📝 إيقاع: نفس إيقاع الأمثلة — جمل قصيرة، بدون حشو
4. 🗣️ دارجة: جزائرية حقيقية. ❌ فصحى ❌ مصرية ❌ مغربية ❌ مترجمة
5. ❌ كليشيهات: "رائع، مذهل، استثنائي، ثوري، غيّر حياتك، لا تفوت الفرصة"
6. 🧠 تخصّص: كل جملة تخص هذا المنتج فقط. لا تصلح لغيره
7. 📞 CTA: واحد، واضح، فيه سبب للتحرك الآن
8. ⏱️ مدة: 15-25 ثانية. جمل >12 كلمة = FAIL

## ✅ كواليتي غيت — تحقق قبل الإخراج
إذا أي جواب "لا" → أعد الكتابة:
1. يبدو كأنه جزائري حقيقي يتكلم؟
2. فيه تفصيل صغير يخليني أقول "هاد أنا"؟
3. المنتج دخل بشكل طبيعي (موش مفروض بالقوة)؟
4. الخطاف = مناسبة + تفصيل (موش وصف منتج)؟
5. CTA مباشر وفيه سبب للتحرك؟

## 📤 صيغة الإخراج
أخرج ONLY كائن JSON:
{"hook":"...","body":"...","cta":"...","scores":{"hook":10,"visual":10,"emotion":10,"curiosity":10,"darija":10,"retention":10,"cta":10,"rewrite":10}}`;

export default function AdScriptStudio({ apiKey, model: modelProp, customEndpoint, providerId }) {
  const EXPIRED_MODELS = ['z-ai/glm-5.1'];
  const model = EXPIRED_MODELS.includes(modelProp) ? 'deepseek-ai/deepseek-v4-flash' : modelProp;
  const [formData, setFormData] = useState({
    productName: '', description: '', audience: '', goal: 'بيع مباشر',
    tone: 'عفوي (طبيعي)', dialect: 'جزائرية (دارجة)',
    voiceId: 'v2', angle: 'auto',
    emotion: '[calm]', excludedWords: ['', '', '', ''],
    category: 'other', price: '', marketType: 'moderate',
    hookCount: 1
  });
  const [generatedScript, setScript] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scriptHistory, setScriptHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [generationStyles, setGenerationStyles] = useState([]);
  const [scriptRating, setScriptRating] = useState(0);
  const [referenceText, setReferenceText] = useState(localStorage.getItem('ads-reference-text') || '');
  const [savedScripts, setSavedScripts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ads-saved-scripts')) || []; } catch { return []; }
  });
  const [editingSection, setEditingSection] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showReferenceInput, setShowReferenceInput] = useState(true);
  const [toneExamples, setToneExamples] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ads-tone-examples')) || {}; } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('ads-reference-text', referenceText);
  }, [referenceText]);

  useEffect(() => {
    localStorage.setItem('ads-tone-examples', JSON.stringify(toneExamples));
  }, [toneExamples]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateScript = async () => {
    if (!apiKey) { setScript({ hook: '⚠️ الرجاء إدخال مفتاح Google Gemini API أعلاه', body: '', cta: '', voiceName: '', voiceDesc: '', normalizationText: '', scores: null }); return; }
    setIsGenerating(true);
    setScript(null);

    const voiceObj = VOICES.find(v => v.id === formData.voiceId);
    const catLabel = PRODUCT_CATEGORIES.find(c => c.id === formData.category)?.label || '';
    const priceLabel = PRICE_RANGES.find(p => p.id === formData.price)?.label || '';
    const marketLabel = MARKET_TYPES.find(m => m.id === formData.marketType)?.label || '';

    const sys = ENGINE_SYSTEM_PROMPT;

    const angleRule = formData.angle === 'auto'
      ? 'قرر أنت الزاوية الأنسب حسب تحليلك للمنتج والسوق'
      : `الزاوية المطلوبة: ${formData.angle}`;

    const hookCountStr = formData.hookCount > 1 ? `(${formData.hookCount} سكربتات مختلفة)` : '';
    const stylesChosen = generationStyles.filter(s => quickActionMap[s]);

    const usr = `اكتب سكربت إعلاني ${hookCountStr} بالدارجة الجزائرية. مهم: ابدأ ب Life Situation (المناسبة/الموقف اليومي)، لا تبدأ بالمنتج ولا بالألم. ثم اختار تفصيل صغير واحد (تفتحي الدولاب، تنحي الصباط، تسمعي الجرس...).

## معلومات المنتج
- الاسم: ${formData.productName || 'منتج'}
- الفئة: ${catLabel}
${formData.price ? `- السعر: ${priceLabel}` : ''}
- السوق: ${marketLabel}
- المشكلة/الوصف: ${formData.description || 'مشكلة'}
- الجمهور المستهدف: ${formData.audience || 'عام'}

## تفضيلات المستخدم
- الزاوية التسويقية: ${angleRule}
- النبرة المفضلة: ${formData.tone} (استعملها كدليل، لكن إذا رأيت نبرة أنسب غيرها)
${toneExamples[formData.tone]?.trim() ? `- مثال على النبرة المطلوبة: "${toneExamples[formData.tone].trim()}"\n` : `- مثال على النبرة المطلوبة: "${TONES[formData.tone]?.example}"\n`}
- اللهجة: ${formData.dialect}
- الهدف الإعلاني: ${formData.goal}
- المعلق الصوتي: ${voiceObj?.name} (${voiceObj?.type}) — طابق النبرة مع شخصية هذا الصوت
- العاطفة الصوتية: ${formData.emotion}

## الكلمات المستبعدة
${formData.excludedWords.filter(w => w).length ? `استبدل هذه الكلمات بكلمات مناسبة: ${formData.excludedWords.filter(w => w).join(', ')}` : 'لا توجد كلمات مستبعدة.'}

${referenceText.trim() ? `## نص مرجعي (تعلم الأسلوب والكلمات منه)\n${referenceText.trim()}\n` : ''}${stylesChosen.length ? `## التنسيقات المطلوبة\n${stylesChosen.map(s => `- ${quickActionMap[s]}`).join('\n')}\n` : ''}## تعليمات إضافية
- اكتب سكربت واحد متكامل
- ابدأ ب Life Situation (المناسبة)، موش بالمنتج.
- امسح السكربت بكل بوابات النقاد (CRITIC GATES + Life Situation Gate) قبل الإخراج
- أخرج ONLY JSON.`;

    try {
      const raw = await fetchAI({
        apiKey, provider: providerId || 'nvidia', model: modelProp || 'deepseek-ai/deepseek-v4-flash', customEndpoint,
        prompt: usr, images: [], expectJsonArray: false, systemPrompt: sys
      });

      const cleaned = raw.replace(/^[\s\S]*?```(?:json)?\s*/i, '').replace(/```[\s\S]*$/g, '').trim();

      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      let jsonStr = start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        const fixed = jsonStr.replace(/,\s*([}\]])/g, '$1').replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
        try {
          parsed = JSON.parse(fixed);
        } catch {
          const inner = jsonStr.match(/,\s*"scores"\s*:\s*\{[^}]*\}\s*$/);
          if (inner) {
            const outer = jsonStr.replace(/,\s*"scores"\s*:\s*\{[^}]*\}/, '');
            try { parsed = JSON.parse(outer); } catch { throw new Error('لم يتم استخراج سكربت صحيح من رد AI'); }
          } else {
            throw new Error('لم يتم استخراج سكربت صحيح من رد AI');
          }
        }
      }

      if (!parsed.hook && !parsed.body && !parsed.cta) {
        throw new Error('لم يتم استخراج سكربت صحيح من رد AI');
      }
      const script = {
        hook: typeof parsed.hook === 'string' ? parsed.hook : '',
        body: typeof parsed.body === 'string' ? parsed.body : '',
        cta: typeof parsed.cta === 'string' ? parsed.cta : '',
        scores: parsed.scores || null,
        voiceName: voiceObj?.name || '',
        voiceDesc: voiceObj?.type || '',
        normalizationText: `Life Situation + Micro-Detail + Critic Gates + Quality Gate`
      };
      setScript(script);
      setScriptHistory(prev => [...prev.slice(0, historyIndex + 1), script]);
      setHistoryIndex(prev => prev + 1);
    } catch (err) {
      setScript({ hook: `❌ خطأ: ${err.message}`, body: '', cta: '', voiceName: '', voiceDesc: '', normalizationText: 'حاول مرة أخرى بتغيير الموديل أو التحقق من المفتاح.', scores: null });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedScript) return;
    const text = `${generatedScript.hook}\n\n${generatedScript.body}\n\n${generatedScript.cta}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const goHistory = (index) => {
    if (index < 0 || index >= scriptHistory.length) return;
    setHistoryIndex(index);
    setScript(scriptHistory[index]);
  };

  const saveScriptToFav = () => {
    if (!generatedScript) return;
    const entry = {
      id: Date.now(),
      product: formData.productName || 'منتج',
      date: new Date().toISOString(),
      hook: generatedScript.hook,
      body: generatedScript.body,
      cta: generatedScript.cta,
      rating: scriptRating,
      category: formData.category,
      tone: formData.tone,
      dialect: formData.dialect
    };
    const updated = [...savedScripts, entry];
    setSavedScripts(updated);
    localStorage.setItem('ads-saved-scripts', JSON.stringify(updated));
  };

  const startInlineEdit = (section, content) => {
    setEditingSection(section);
    setEditContent(content);
  };

  const saveInlineEdit = (section) => {
    if (!generatedScript || editingSection !== section) return;
    setScript(prev => ({ ...prev, [section]: editContent }));
    setEditingSection(null);
    setEditContent('');
  };

  const cancelInlineEdit = () => {
    setEditingSection(null);
    setEditContent('');
  };

  const quickActionMap = {
    curiosity: 'خلي الهوك يبدأ بسؤال يخلي المشاهد يكمل.',
    emotion: 'زِد مشاعر في البودي: تعب، أمل، راحة.',
    story: 'اكتب السكربت على شكل قصة مصغرة.',
    darija: 'استعمل دارجة جزائرية 100% في السكربت كامل.',
    shorten: 'السكربت يكون قصير — كل جملة أقل من 9 كلمات.',
    funny: 'السكربت كله بمزاح.',
    formal: 'السكربت كله بلغة رسمية.',
    expert: 'السكربت كله بصوت خبير واثق.',
    young: 'السكربت كله بصوت شبابي.',
    female: 'السكربت كله بصوت امرأة.',
  };
  const generationStyleKeys = Object.keys(quickActionMap);

  const downloadScript = () => {
    if (!generatedScript) return;
    const text = `صوت المعلق: ${generatedScript.voiceName} (${generatedScript.voiceDesc})\n\n---\n\n${generatedScript.hook}\n\n${generatedScript.body}\n\n${generatedScript.cta}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Script_${formData.productName || 'New'}.txt`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-6 rounded-2xl overflow-hidden" dir="rtl">
      <style>{`
        .cs::-webkit-scrollbar { height: 8px; width: 6px; }
        .cs::-webkit-scrollbar-track { background: #1E293B; border-radius: 8px; }
        .cs::-webkit-scrollbar-thumb { background: #6366F1; border-radius: 8px; }
        .af { animation: af 0.4s ease-out forwards; }
        @keyframes af { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center md:text-right flex flex-col md:flex-row items-center justify-between bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2 flex items-center gap-3 justify-center md:justify-start">
              <Sparkles className="text-purple-400" size={32} /> AdScript Studio
            </h1>
            <p className="text-slate-400 text-sm md:text-base">Product Intelligence + Semantic Validation + Shot Architecture + DZ Vocabulary</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <span className="px-4 py-2 bg-indigo-900/40 text-indigo-300 rounded-lg text-sm font-semibold border border-indigo-700/50 flex items-center gap-2"><Volume2 size={16} /> 10 AI Voices</span>
            <span className="px-4 py-2 bg-emerald-900/40 text-emerald-300 rounded-lg text-sm font-semibold border border-emerald-700/50 flex items-center gap-2"><Star size={16} /> 7-Axis Self-Critique Engine</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-indigo-400 border-b border-slate-700/50 pb-3"><Target size={20} /> تفاصيل المنتج والحملة</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">اسم المنتج</label>
                    <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="مثال: دورة التسويق" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">الجمهور المستهدف</label>
                    <input type="text" name="audience" value={formData.audience} onChange={handleInputChange} className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="مثال: رواد الأعمال" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">المشكلة التي يحلها المنتج</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none cs" placeholder="اشرح معاناة العميل هنا..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">فئة المنتج</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">نطاق السعر</label>
                    <select name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      {PRICE_RANGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">حالة السوق</label>
                  <select name="marketType" value={formData.marketType} onChange={handleInputChange} className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                    {MARKET_TYPES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">الهدف الإعلاني</label>
                    <select name="goal" value={formData.goal} onChange={handleInputChange} className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option>بيع مباشر</option>
                      <option>جمع عملاء (Leads)</option>
                      <option>زيادة الوعي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">اللهجة</label>
                    <select name="dialect" value={formData.dialect} onChange={handleInputChange} className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-indigo-300 font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option>جزائرية (دارجة)</option>
                      <option>مصرية</option>
                      <option>خليجية</option>
                      <option>عربية فصحى</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wider flex items-center gap-2"><TrendingUp size={14} /> عدد السكربتات</label>
                  <div className="flex gap-2">
                    {[1].map(n => (
                      <button key={n} onClick={() => setFormData(prev => ({...prev, hookCount: n}))}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all text-center ${formData.hookCount === n ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500' : 'bg-slate-900/80 text-slate-400 border border-slate-700'}`}>
                        سكربت واحد
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider flex items-center gap-2"><Target size={14} /> الزاوية التسويقية</label>
                  <select name="angle" value={formData.angle} onChange={handleInputChange} className="w-full bg-slate-900/80 border border-indigo-500/50 rounded-xl p-3 text-indigo-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="auto">🔹 تلقائي (AI يقرر الأنسب)</option>
                    <option value="problem">1️⃣ سكربت المشكلة (Problem-Solution)</option>
                    <option value="urgency">2️⃣ سكربت التحفيز (Direct Sales / Urgency)</option>
                    <option value="premium">3️⃣ سكربت الجودة (Premium / Authority)</option>
                    <option value="benefits">4️⃣ سكربت الفوائد (Benefits-driven)</option>
                    <option value="story">5️⃣ سكربت القصة (Storytelling)</option>
                    <option value="compare">6️⃣ سكربت المقارنة (Before / After)</option>
                    <option value="secret">7️⃣ سكربت كشف السر (Secret / Hidden Truth)</option>
                    <option value="testimonial">8️⃣ سكربت التجربة (Testimonial)</option>
                    <option value="shock">9️⃣ سكربت الصدمة (Pattern Interrupt)</option>
                    <option value="convenience">🔟 سكربت تبسيط الحياة (Convenience)</option>
                    <option value="fomo">11️⃣ سكربت الخوف من الخسارة (FOMO)</option>
                    <option value="authority">12️⃣ سكربت السلطة (Authority)</option>
                    <option value="question">13️⃣ سكربت الأسئلة (Question Hook)</option>
                    <option value="routine">14️⃣ سكربت النمط اليومي (Relatable Routine)</option>
                    <option value="belief">15️⃣ سكربت كسر الاعتقاد (Belief breaking)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-pink-400 mb-2 uppercase tracking-wider flex items-center gap-2"><Activity size={14} /> العاطفة الصوتية</label>
                  <div className="flex flex-wrap gap-2">
                    {['[calm]', '[whispering]', '[excited]', '[serious]'].map(emo => (
                      <button key={emo} onClick={() => setFormData(prev => ({...prev, emotion: emo}))}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex-1 text-center ${formData.emotion === emo ? 'bg-pink-600/20 text-pink-400 border border-pink-500' : 'bg-slate-900/80 text-slate-400 border border-slate-700'}`}>
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
                {generatedScript && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-rose-900/40 af">
                    <label className="block text-xs font-semibold text-rose-400 mb-3 uppercase tracking-wider flex items-center gap-2"><XOctagon size={14} /> كلمات مستبعدة</label>
                    <div className="grid grid-cols-2 gap-3">
                      {formData.excludedWords.map((w, i) => (
                        <input key={i} type="text" value={w} onChange={(e) => { const n = [...formData.excludedWords]; n[i] = e.target.value; setFormData(prev => ({...prev, excludedWords: n})); }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none" placeholder={`كلمة ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 flex flex-col flex-grow">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-pink-400 border-b border-slate-700/50 pb-3"><Mic size={20} /> الاستوديو الصوتي (10 شخصيات)</h2>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">اختر المعلق الصوتي</label>
                <div className="flex gap-3 overflow-x-auto pb-4 cs snap-x">
                  {VOICES.map(voice => (
                    <button key={voice.id} onClick={() => setFormData(prev => ({...prev, voiceId: voice.id}))}
                      className={`snap-start flex-shrink-0 w-36 p-3 rounded-xl border-2 transition-all text-right relative overflow-hidden group ${formData.voiceId === voice.id ? 'border-indigo-500 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${voice.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      {formData.voiceId === voice.id && <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-r ${voice.color}`} />}
                      <div className="flex items-center justify-between mb-2"><span className="text-2xl">{voice.gender}</span>{formData.voiceId === voice.id && <CheckCircle size={14} className="text-indigo-400" />}</div>
                      <div className="font-bold text-white text-sm">{voice.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{voice.type}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">نبرة الأداء (Smart Tones)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.keys(TONES).map(t => (
                    <button key={t} onClick={() => setFormData(prev => ({...prev, tone: t}))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.tone === t ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-indigo-400' : 'bg-slate-900 text-slate-300 border border-slate-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="bg-slate-900/80 border border-slate-600/50 rounded-xl p-4">
                  <div className="flex gap-3 items-start">
                    <Info className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                    <div className="w-full">
                      <p className="text-sm text-slate-300 mb-2">{TONES[formData.tone]?.desc}</p>
                      <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800">
                        <span className="text-xs text-slate-500 block mb-1">مثال ({formData.dialect}) — اكتب المثال اللي بغيت:</span>
                        <textarea value={toneExamples[formData.tone] ?? TONES[formData.tone]?.example ?? ''} onChange={e => setToneExamples(prev => ({...prev, [formData.tone]: e.target.value}))} rows={2} placeholder="اكتب المثال هنا..."
                          className="w-full bg-transparent text-green-400 text-sm font-medium outline-none resize-none border border-slate-700/50 rounded-lg p-2 placeholder:text-slate-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* تنسيقات السكربت — قبل التوليد */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">تنسيقات السكربت (اختر ما يناسب)</label>
                <div className="flex flex-wrap gap-1.5">
                  {generationStyleKeys.map(key => {
                    const labels = { curiosity: '🧠 فضول', emotion: '💥 عاطفة', story: '🎥 قصة', darija: '🗣️ دارجة', shorten: '✂️ قصير', funny: '😂 مضحك', formal: '😐 رسمي', expert: '👨‍⚕️ خبير', young: '👦 شاب', female: '👩 امرأة' };
                    const isOn = generationStyles.includes(key);
                    return (
                      <button key={key} onClick={() => setGenerationStyles(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${isOn ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-600'}`}>
                        {labels[key] || key}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-600 mt-1">اختر تنسيقاً واحداً أو أكثر — AI يطبقه عند توليد السكربت</p>
              </div>
              <button onClick={generateScript} disabled={isGenerating}
                className={`w-full mt-auto text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 ${generatedScript ? 'bg-gradient-to-r from-teal-600 to-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-pink-600'}`}>
                {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                {isGenerating ? 'جاري التوليد بالذكاء الاصطناعي...' : generatedScript ? 'إعادة التوليد' : 'توليد السكربت الإعلاني'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col h-[800px] lg:h-auto">
            <div className={`flex-grow bg-slate-900 border ${generatedScript ? 'border-indigo-500/50 ring-1 ring-indigo-500/30' : 'border-slate-700'} rounded-2xl p-1 overflow-hidden flex flex-col`}>
              <div className="bg-slate-800/80 border-b border-slate-700 p-4 rounded-t-xl flex justify-between items-center z-10">
                <div className="flex items-center gap-2 text-slate-300 font-medium"><Mic size={18} className="text-indigo-400" /> النتيجة النهائية (ElevenLabs Ready)</div>
                {generatedScript && (
                  <div className="flex gap-2">
                    <button onClick={downloadScript} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="تحميل TXT"><Download size={16} /></button>
                    <button onClick={copyToClipboard} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 px-3">
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      <span className="text-sm font-semibold">{copied ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-grow p-5 overflow-y-auto cs relative">
                {!generatedScript && !isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center"><Play size={40} className="text-slate-600 ml-1" /></div>
                    <p className="text-lg font-medium">الاستوديو جاهز لإنشاء السكربت</p>
                    <p className="text-sm text-slate-600 text-center max-w-xs">اضبط الإعدادات واضغط على زر التوليد</p>
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 space-y-6 bg-slate-900/80 z-20">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <Mic className="absolute inset-0 m-auto animate-pulse text-pink-400" size={24} />
                    </div>
                    <p className="font-bold tracking-widest animate-pulse">يجري تطبيق: Product Intelligence + Semantic Validation + Banned Phrases + Shot Structure...</p>
                  </div>
                )}
                    {generatedScript && !isGenerating && (
                      <div className="space-y-6 pb-8" key={'s' + (scriptHistory.length + 1) + generatedScript.hook?.slice(0,20)}>
                    <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700 w-full">
                      <div className="bg-indigo-500/20 p-2 rounded-lg"><User className="text-indigo-400" size={20} /></div>
                      <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">المعلق الصوتي</p><p className="text-sm text-white font-bold">{generatedScript.voiceName} <span className="text-slate-500 font-normal">({generatedScript.voiceDesc})</span></p></div>
                    </div>
                    {/* Reference Text — مفتوح دائماً */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-amber-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-amber-400 font-bold">📝 نص مرجعي (اكتب أي نص بالعربية أو الدارجة ليتعلم AI أسلوبك)</p>
                        <button onClick={() => { setReferenceText(''); localStorage.removeItem('ads-reference-text'); }} className="text-xs px-2 py-1 bg-red-900/50 hover:bg-red-900 rounded text-red-300 transition-colors">تفريغ</button>
                      </div>
                      <textarea value={referenceText} onChange={e => setReferenceText(e.target.value)} rows={3}
                        placeholder='اكتب هنا النص بالدارجة اللي بغيت AI يتعلم منه...
مثال: "والله غير منتج مليح، جربتو و راني نهضرك من لخر."'
                        className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-600 text-sm leading-relaxed outline-none resize-y text-right placeholder:text-slate-600" />
                      <p className="text-[10px] text-slate-600 mt-1">AI يقرا هذا النص مع كل توليد ويستفيد من كلماته وأسلوبه</p>
                    </div>
                    {generatedScript.scores && (
                      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                        <p className="text-xs text-slate-400 font-semibold mb-3 flex items-center gap-2"><MessageCircle size={14} /> تقييم الجودة (Quality Score)</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(generatedScript.scores).map(([key, val]) => {
                            const realScore = Number.isNaN(val) ? 0 : Math.min(val, 10);
                            const score = realScore >= 7 ? 'جيد' : realScore >= 4 ? 'مقبول' : 'ضعيف';
                            const color = realScore >= 8 ? 'text-emerald-400' : realScore >= 6 ? 'text-yellow-400' : 'text-red-400';
                            const label = key === 'hook' ? 'افتتاحية' : key === 'visual' ? 'مشهد بصري' : key === 'emotion' ? 'مشاعر' : key === 'curiosity' ? 'فضول' : key === 'darija' ? 'دارجة' : key === 'retention' ? 'تشويق' : key === 'cta' ? 'دعوة' : key === 'rewrite' ? 'إبداع' : 'سياق';
                            return (
                              <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-700">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${color}`} />
                                  <span className="text-xs text-slate-400">{label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${color}`}>{score} ({realScore})</span>
                                </div>
                              </div>
                            );
                          })}
                          <div className="col-span-2 p-2 rounded-lg bg-slate-900/50 border border-slate-700 mt-1">
                            <p className="text-[10px] text-slate-500">✏️ التقييم النهائي: هذا تقيير آلي. راجع السكربت بنفسك وقم بتعديله يدوياً إذا لزم الأمر.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="relative bg-slate-800/50 rounded-2xl p-6 border border-red-500/20">
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> 1. البداية (Hook)
                      </div>
                      <button onMouseDown={e => { e.preventDefault(); editingSection === 'hook' ? saveInlineEdit('hook') : startInlineEdit('hook', generatedScript.hook); }} className={`absolute top-0 left-4 -translate-y-1/2 p-1.5 rounded-lg transition-colors border z-10 ${editingSection === 'hook' ? 'bg-red-500/20 text-red-300 border-red-500/50' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'}`} title={editingSection === 'hook' ? 'حفظ' : 'تعديل يدوي'}>
                        <Pen size={14} />
                      </button>
                      {editingSection === 'hook' ? (
                        <textarea value={editContent} onChange={e => setEditContent(e.target.value)} autoFocus
                          onBlur={() => { if (editingSection === 'hook') saveInlineEdit('hook'); }}
                          onKeyDown={e => { if (e.key === 'Escape') { cancelInlineEdit(); } }}
                          className="w-full bg-slate-900 text-white p-3 rounded-xl border border-red-500/50 mt-2 text-lg leading-relaxed outline-none resize-y min-h-[80px] text-right" />
                      ) : (
                        <div onClick={() => startInlineEdit('hook', generatedScript.hook)} className="cursor-text group mt-2">
                          <p className="text-xl leading-relaxed text-white font-medium">{generatedScript.hook}</p>
                          <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">انقر أو استعمل القلم للتعديل</span>
                        </div>
                      )}
                    </div>
                    <div className="relative bg-slate-800/50 rounded-2xl p-6 border border-blue-500/20">
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 2. الوسط (Body)
                      </div>
                      <button onMouseDown={e => { e.preventDefault(); editingSection === 'body' ? saveInlineEdit('body') : startInlineEdit('body', generatedScript.body); }} className={`absolute top-0 left-4 -translate-y-1/2 p-1.5 rounded-lg transition-colors border z-10 ${editingSection === 'body' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'}`} title={editingSection === 'body' ? 'حفظ' : 'تعديل يدوي'}>
                        <Pen size={14} />
                      </button>
                      {editingSection === 'body' ? (
                        <textarea value={editContent} onChange={e => setEditContent(e.target.value)} autoFocus
                          onBlur={() => { if (editingSection === 'body') saveInlineEdit('body'); }}
                          onKeyDown={e => { if (e.key === 'Escape') { cancelInlineEdit(); } }}
                          className="w-full bg-slate-900 text-white p-3 rounded-xl border border-blue-500/50 mt-2 text-lg leading-relaxed outline-none resize-y min-h-[80px] text-right" />
                      ) : (
                        <div onClick={() => startInlineEdit('body', generatedScript.body)} className="cursor-text group mt-2">
                          <p className="text-lg leading-relaxed text-slate-300 whitespace-pre-wrap">{generatedScript.body}</p>
                          <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">انقر أو استعمل القلم للتعديل</span>
                        </div>
                      )}
                    </div>
                    <div className="relative bg-slate-800/50 rounded-2xl p-6 border border-emerald-500/20">
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" /> 3. النهاية (CTA)
                      </div>
                      <button onMouseDown={e => { e.preventDefault(); editingSection === 'cta' ? saveInlineEdit('cta') : startInlineEdit('cta', generatedScript.cta); }} className={`absolute top-0 left-4 -translate-y-1/2 p-1.5 rounded-lg transition-colors border z-10 ${editingSection === 'cta' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'}`} title={editingSection === 'cta' ? 'حفظ' : 'تعديل يدوي'}>
                        <Pen size={14} />
                      </button>
                      {editingSection === 'cta' ? (
                        <textarea value={editContent} onChange={e => setEditContent(e.target.value)} autoFocus
                          onBlur={() => { if (editingSection === 'cta') saveInlineEdit('cta'); }}
                          onKeyDown={e => { if (e.key === 'Escape') { cancelInlineEdit(); } }}
                          className="w-full bg-slate-900 text-white p-3 rounded-xl border border-emerald-500/50 mt-2 text-lg leading-relaxed outline-none resize-y min-h-[80px] text-right" />
                      ) : (
                        <div onClick={() => startInlineEdit('cta', generatedScript.cta)} className="cursor-text group mt-2">
                          <p className="text-xl leading-relaxed text-emerald-50 font-bold">{generatedScript.cta}</p>
                          <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">انقر أو استعمل القلم للتعديل</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-3 bg-indigo-900/30 p-4 rounded-xl border border-indigo-800/50">
                      <AlertTriangle className="text-indigo-400 flex-shrink-0" size={20} />
                      <p className="text-sm text-indigo-200"><strong>ملاحظة:</strong> {generatedScript.normalizationText}</p>
                    </div>

                      {/* Version History */}
                      {scriptHistory.length > 1 && (
                        <div className="mb-4 bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-400 font-semibold">Version History</span>
                            <span className="text-[10px] text-slate-600">— كل توليد يسجل كنسخة جديدة. انقر على V1, V2, V3 للرجوع لأي إصدار سابق.</span>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {scriptHistory.map((_, i) => (
                              <button key={i} onClick={() => goHistory(i)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  i === historyIndex
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}>
                                V{i + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rating + Save */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setScriptRating(star)}
                              className={`text-lg transition-all ${star <= scriptRating ? 'text-yellow-400' : 'text-slate-600'}`}>
                              {star <= scriptRating ? '★' : '☆'}
                            </button>
                          ))}
                        </div>
                        <button onClick={saveScriptToFav}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors flex items-center gap-1">
                          <Bookmark size={14} /> حفظ كمرجع
                        </button>
                        {savedScripts.length > 0 && (
                          <span className="text-xs text-slate-500">{savedScripts.length} محفوظ</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
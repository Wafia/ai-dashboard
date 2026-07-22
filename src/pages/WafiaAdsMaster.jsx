import { useState } from 'react';
import {
  Rocket,
  Target,
  PenTool,
  Video,
  LayoutTemplate,
  Search,
  Image as ImageIcon,
  SplitSquareHorizontal,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  RefreshCcw,
  Upload,
  Globe,
  X,
  MessageCircle,
  Users,
  Lightbulb,
  Settings,
  Mic
} from 'lucide-react';
import { fetchAI } from '../utils/ai';

const parseMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, index) => {
    let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');

    if (formattedLine.startsWith('### ')) {
      return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-teal-800" dangerouslySetInnerHTML={{ __html: formattedLine.substring(4) }} />;
    }
    if (formattedLine.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-teal-900 border-b pb-2" dangerouslySetInnerHTML={{ __html: formattedLine.substring(3) }} />;
    }
    if (formattedLine.startsWith('# ')) {
      return <h1 key={index} className="text-3xl font-extrabold mt-8 mb-4 text-teal-950" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
    }
    if (formattedLine.startsWith('- ') || formattedLine.startsWith('* ')) {
      return <li key={index} className="ml-6 mb-2 list-disc text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
    }
    if (formattedLine.match(/^\d+\.\s/)) {
      return <li key={index} className="ml-6 mb-2 list-decimal text-gray-700 leading-relaxed font-semibold" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\d+\.\s/, '') }} />;
    }
    if (formattedLine.trim() === '') {
      return <br key={index} />;
    }
    return <p key={index} className="mb-3 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
  });
};

export default function WafiaAdsMaster({ apiKey, model, customEndpoint, providerId }) {
  const [step, setStep] = useState('input');
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState(null);

  const [productData, setProductData] = useState({
    nameOrLink: '',
    description: '',
    price: '',
    method: 'Cash on Delivery (COD)',
    channel: 'Facebook Ads',
    language: 'fr-dz',
    imageBase64: null,
    imageMimeType: null,
    imagePreview: null
  });

  const [showLPForm, setShowLPForm] = useState(false);
  const [lpFormData, setLpFormData] = useState({
    language: 'ar',
    productType: 'single',
    promoOffer: '',
    productName: '',
    features: '',
    angle: '',
    price: '',
    colors: ''
  });

  const [analysisResult, setAnalysisResult] = useState('');
  const [avatars, setAvatars] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [angles, setAngles] = useState(null);
  const [selectedAngle, setSelectedAngle] = useState(null);
  const [currentService, setCurrentService] = useState(null);
  const [serviceResult, setServiceResult] = useState('');
  const [analysisQuestion, setAnalysisQuestion] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [avatarQuestion, setAvatarQuestion] = useState('');
  const [angleQuestion, setAngleQuestion] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleLPInputChange = (e) => {
    const { name, value } = e.target;
    setLpFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("حجم الصورة كبير جداً. يرجى رفع صورة أقل من 4 ميغابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductData(prev => ({
          ...prev,
          imageBase64: reader.result.split(',')[1],
          imageMimeType: file.type,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProductData(prev => ({ ...prev, imageBase64: null, imageMimeType: null, imagePreview: null }));
  };

  const commonAIOptions = {
    apiKey,
    provider: providerId || 'nvidia',
    model: model || 'deepseek-ai/deepseek-v4-flash',
    customEndpoint,
  };

  const startAnalysis = async (e) => {
    e.preventDefault();
    if (!productData.nameOrLink || !productData.description || !productData.price) {
      setError("يرجى ملء جميع الحقول الأساسية (المنتج، الوصف، والسعر).");
      return;
    }
    setError(null);
    setLoadingText('وافية تقوم بتحليل المنتج والسوق الجزائري...');
    setStep('analyzing');

    const prompt = `Voici mon produit pour le marché algérien :
- Nom/Lien/Image : ${productData.nameOrLink}
- Description : ${productData.description}
- Prix de vente prévu : ${productData.price} DZD
- Méthode de vente : ${productData.method}
- Canal principal : ${productData.channel}
${productData.imageBase64 ? "- IMAGE FOURNIE : Analyse visuellement l'image ci-jointe pour en tirer des arguments de vente et comprendre la qualité du produit." : ""}

Fais une analyse structurelle stricte en 7 points comme défini dans tes règles (Définition, Avantages, Forces, Faiblesses, Où c'est vendu en Algérie, Fourchette de prix, Problème résolu). N'ajoute pas de textes publicitaires pour le moment.`;

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt,
        imageBase64: productData.imageBase64,
        imageMimeType: productData.imageMimeType,
        language: productData.language
      });
      setAnalysisResult(result);
      setStep('analysis_done');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('input');
    }
  };

  const handleAnalysisQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!analysisQuestion.trim()) return;

    setCurrentService({ id: 'custom_analysis', title: "إجابة مخصصة: " + analysisQuestion });
    setLoadingText('وافية تفكر في إجابة لسؤالك...');
    setStep('generating_service');
    setError(null);

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt: `Le client a une question spécifique concernant le produit analysé : "${analysisQuestion}". Réponds-lui de manière experte et détaillée.`,
        isService: true,
        previousContext: analysisResult,
        language: productData.language
      });
      setServiceResult(result);
      setStep('service_done');
      setAnalysisQuestion('');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('analysis_done');
    }
  };

  const generateAvatars = async () => {
    setError(null);
    setLoadingText('وافية تبحث عن أفضل 5 عملاء مستهدفين (Avatars)...');
    setStep('analyzing');

    const prompt = `En te basant sur l'analyse de ce produit :
${analysisResult}

Propose 5 profils de clients idéaux et très spécifiques (Avatars) pour ce produit en Algérie. Les profils doivent être précis (âge, problème exact, motivation d'achat).

Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "avatars" qui est un tableau d'objets. Chaque objet doit avoir les clés "title" (string) et "description" (string). Exemple: {"avatars":[{"title":"Titre","description":"Description du profil"}]}`;

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt,
        language: productData.language,
        expectJsonArray: true
      });
      setAvatars(result);
      setStep('analysis_done');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('analysis_done');
    }
  };

  const handleAvatarQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!avatarQuestion.trim()) return;
    setError(null);
    setLoadingText('وافية تقوم بتوليد عملاء جدد بناءً على طلبك...');
    setStep('analyzing');

    const prompt = `En te basant sur l'analyse de ce produit :
${analysisResult}

L'utilisateur a une demande spécifique : "${avatarQuestion}".
IMPORTANT : Voici les profils (Avatars) que tu as DÉJÀ générés :
${JSON.stringify(avatars)}

NE LES RÉPÈTE PAS. Propose 5 NOUVEAUX profils de clients (Avatars) différents et très spécifiques pour ce produit en Algérie, en respectant la demande de l'utilisateur.

Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "avatars" qui est un tableau d'objets. Chaque objet doit avoir les clés "title" (string) et "description" (string). Exemple: {"avatars":[{"title":"Titre","description":"Description du profil"}]}`;

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt,
        language: productData.language,
        expectJsonArray: true
      });
      setAvatars(result);
      setStep('analysis_done');
      setAvatarQuestion('');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('analysis_done');
    }
  };

  const generateAngles = async () => {
    setError(null);
    setLoadingText(`وافية تبتكر 5 زوايا تسويقية مخصصة لـ: ${selectedAvatar.title}...`);
    setStep('analyzing');

    const prompt = `En te basant sur l'analyse de ce produit ET sur cet AVATAR spécifique :
Nom : ${selectedAvatar.title}
Description : ${selectedAvatar.description}

Propose 5 angles marketing très persuasifs et différents les uns des autres pour convaincre spécifiquement CET avatar d'acheter le produit.

Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "angles" qui est un tableau d'objets. Chaque objet doit avoir les clés "title" (string) et "description" (string). Exemple: {"angles":[{"title":"Titre","description":"Description de l'angle"}]}`;

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt,
        language: productData.language,
        expectJsonArray: true
      });
      setAngles(result);
      setStep('analysis_done');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('analysis_done');
    }
  };

  const handleAngleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!angleQuestion.trim()) return;
    setError(null);
    setLoadingText('وافية تبتكر زوايا جديدة بناءً على طلبك...');
    setStep('analyzing');

    const prompt = `En te basant sur l'analyse de ce produit ET sur cet AVATAR spécifique :
Nom : ${selectedAvatar.title}
Description : ${selectedAvatar.description}

L'utilisateur a une demande spécifique : "${angleQuestion}".
IMPORTANT : Voici les angles marketing que tu as DÉJÀ générés :
${JSON.stringify(angles)}

NE LES RÉPÈTE PAS. Propose 5 NOUVEAUX angles marketing très persuasifs et différents pour convaincre cet avatar, en respectant la demande de l'utilisateur.

Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "angles" qui est un tableau d'objets. Chaque objet doit avoir les clés "title" (string) et "description" (string). Exemple: {"angles":[{"title":"Titre","description":"Description de l'angle"}]}`;

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt,
        language: productData.language,
        expectJsonArray: true
      });
      setAngles(result);
      setStep('analysis_done');
      setAngleQuestion('');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('analysis_done');
    }
  };

  const handleServiceSelection = async (serviceId, serviceTitle, servicePrompt) => {
    setCurrentService({ id: serviceId, title: serviceTitle });
    setLoadingText(`وافية تقوم بتجهيز: ${serviceTitle}...`);
    setStep('generating_service');
    setError(null);

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt: `Tâche demandée : ${servicePrompt}`,
        isService: true,
        previousContext: analysisResult,
        avatarContext: selectedAvatar,
        angleContext: selectedAngle,
        language: productData.language,
        imageBase64: productData.imageBase64,
        imageMimeType: productData.imageMimeType
      });
      setServiceResult(result);
      setStep('service_done');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('analysis_done');
    }
  };

  const openLandingPageForm = () => {
    const extractedFeatures = productData.description + (selectedAvatar ? ` - يحل مشكلة: ${selectedAvatar.description}` : '');

    setLpFormData({
      language: productData.language === 'fr-dz' ? 'fr' : productData.language,
      productType: 'single',
      promoOffer: '',
      productName: productData.nameOrLink,
      features: extractedFeatures,
      angle: selectedAngle ? selectedAngle.title : '',
      price: productData.price,
      colors: 'ألوان جذابة ومتناسقة مع هوية المنتج (يمكنك تعديلها)'
    });
    setShowLPForm(true);
  };

  const handleLPFormSubmit = async (e) => {
    e.preventDefault();
    setShowLPForm(false);

    setCurrentService({ id: 5, title: "محتوى صفحة الهبوط (Nano Banana Pro)" });
    setLoadingText('وافية تقوم ببناء صفحة الهبوط والبرومبت الاحترافي...');
    setStep('generating_service');
    setError(null);

    const targetLang = lpFormData.language === 'ar' ? 'العربية (المحلية والخليج)' : lpFormData.language === 'fr' ? 'الفرنسية' : 'الإنجليزية';
    const pTypeStr = lpFormData.productType === 'single' ? 'SINGLE PRODUCT' : 'BUNDLE OFFER';
    const focusStr = lpFormData.productType === 'single' ? 'single product. Focus on its core benefits' : 'bundle offer. Focus on the value and savings';

    const nanoBananaPrompt = `=== CRITICAL INSTRUCTION: ${pTypeStr} ===
Note: This landing page is for a ${focusStr}.
============================================

=== SPECIFIC PRODUCT DETAILS PROVIDED BY THE USER ===
Please strictly use the following details in your copywriting instead of guessing them:
- Product Name: ${lpFormData.productName}
- Features & Description: ${lpFormData.features}
- Marketing Angle: ${lpFormData.angle}
- Preferred Design Colors: ${lpFormData.colors}
=====================================================

=== CRITICAL INSTRUCTION: PRICE INCLUDED ===
The user provided the final product price: ${lpFormData.price}. MUST Mention this explicitly inside the sales copy when appropriate. DO NOT invent prices.
======================================

Analyze the uploaded product image. Identify the product, its key features, target audience, and best color palette.

Act as a world-class Direct Response Copywriter and AI Prompt Engineer specializing in image-based mobile-first landing pages generated by 'Nano Banana Pro'.

### YOUR MISSION HAS TWO CRITICAL STEPS:

### STEP 1: TEXT GENERATION (COPYWRITING)
First, write highly persuasive sales copy for this specific product targeting direct response customers.
CRITICAL: Write the sales copy entirely in the following language: [ ${targetLang} ].
Present this copy clearly in your response using proper formatting (Catchy headline, pain points, solutions, bullet benefits, urgency, CTA).

### STEP 2: NANO BANANA PRO DESIGN PROMPT
After presenting the copywriting, output a single, consolidated READY-TO-COPY design prompt strictly in English for the "Nano Banana Pro" image generator.

--- CRITICAL INSTRUCTIONS FOR STEP 2 OUTPUT: ---
1. Output Format: Provide the entire design prompt inside a single plain text code block.
2. EXACT PRODUCT MATCH: The product shown in the generated design MUST match the user's reference image with 100% accuracy. DO NOT hallucinate or draw a generic lookalike.
3. Structure & Hierarchy: Instruct Nano Banana Pro to generate a "medium-long vertical landing page" (aspect ratio exactly 1:4). It MUST contain exactly 6 distinct visual sections divided clearly, matching the pacing of a standard e-commerce page:
   - Section 1 (Offer & Hero): Top offer bar and the main product image in action. Display the offer text: "${lpFormData.promoOffer || 'عرض خاص'}".
   - Section 2 (Agitation/Problem): An emotional hook showing the problem (e.g. frustration). Must include a small 'Before/After' visual inset.
   - Section 3 (Main Solution): The product shining alongside a happy person/result.
   - Section 4 (Features Comparison): A 2-column visual grid showing "Pros vs Cons" with Checkmarks and Crosses paired with very short bullet points.
   - Section 5 (Additional Versatility): Secondary benefits showing the product in different use cases.
   - Section 6 (Footer): Final design strip with a small product render and the offer: "${lpFormData.promoOffer || 'عرض خاص'}". DO NOT generate Call to Action buttons (no fake buttons).
4. Theme: Explicitly instruct Nano Banana to use the color palette: ${lpFormData.colors}.
5. Marketing Angle: Base the visual tone heavily on: "${lpFormData.angle}".
6. Text Content & Typography: Instruct Nano Banana Pro: "Keep text strictly limited to 1 or 2 small lines per section. DO NOT write long paragraphs. Mimic the exact text density and pacing of modern clean landing pages. Use highly elegant, legible web fonts (avoid giant poster fonts and avoid dense newspaper text)."
7. Copywriting Payload: Inject the localized translated copy from STEP 1 into this English prompt so it is permanently baked into the design.`;

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt: nanoBananaPrompt,
        isService: true,
        previousContext: analysisResult,
        avatarContext: selectedAvatar,
        angleContext: selectedAngle,
        language: lpFormData.language,
        imageBase64: productData.imageBase64,
        imageMimeType: productData.imageMimeType
      });
      setServiceResult(result);
      setStep('service_done');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('analysis_done');
    }
  };

  const handleCustomQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setCurrentService({ id: 'custom', title: "إجابة مخصصة: " + customQuestion });
    setLoadingText('وافية تفكر في إجابة لسؤالك...');
    setStep('generating_service');
    setError(null);

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt: `Le client a une question spécifique concernant le produit, l'avatar sélectionné et l'angle choisi : "${customQuestion}". Réponds-lui de manière experte et détaillée.`,
        isService: true,
        previousContext: analysisResult,
        avatarContext: selectedAvatar,
        angleContext: selectedAngle,
        language: productData.language
      });
      setServiceResult(result);
      setStep('service_done');
      setCustomQuestion('');
    } catch (err) {
      setError('حدث خطأ أثناء المعالجة');
      setStep('analysis_done');
    }
  };

  const resetApp = () => {
    setStep('input');
    setProductData({ nameOrLink: '', description: '', price: '', method: 'Cash on Delivery (COD)', channel: 'Facebook Ads', language: 'fr-dz', imageBase64: null, imageMimeType: null, imagePreview: null });
    setAnalysisResult('');
    setAvatars(null);
    setSelectedAvatar(null);
    setAngles(null);
    setSelectedAngle(null);
    setServiceResult('');
    setCurrentService(null);
    setCustomQuestion('');
    setAnalysisQuestion('');
    setAvatarQuestion('');
    setAngleQuestion('');
    setShowLPForm(false);
    setError(null);
  };

  const contentServices = [
    { id: 3, icon: <PenTool className="w-6 h-6" />, title: "نصوص إعلانية (Copywriting)", prompt: "Rédige 2 textes publicitaires (Primary Text) pour Meta Ads (un court et un long). Le texte DOIT parler directement à l'avatar choisi en utilisant l'angle marketing choisi. Utilise le dialecte algérien (Darija) avec le français si demandé." },
    { id: 4, icon: <Video className="w-6 h-6" />, title: "سكربت فيديو إعلاني", prompt: "Écris un script vidéo détaillé pour un Reel/TikTok de 30 à 45 secondes (Hook, Body, Call to Action) basé sur l'Avatar et l'Angle choisis. Inclus des instructions visuelles." },
    { id: 9, icon: <Mic className="w-6 h-6" />, title: "فويس أوفر (MP3)", prompt: "Agis comme un Copywriter Vidéo expert en Meta Ads. Ta mission est d'écrire des scripts prêts à être transformés en Audio via Text-to-Speech (TTS). En te basant sur le produit, le prix, le problème, l'Avatar et l'Angle, génère EXACTEMENT 3 scripts vidéo (90-120s) exploitant : 1. Curiosité, 2. Douleur, 3. Ambition. Structure: [1. HOOK], [2. CORPS], [3. CTA avec prix]. 🚨 INSTRUCTIONS CRITIQUES POUR LE TEXT-TO-SPEECH (TTS) EN DARIJA : - Rédige le texte en dialecte algérien (Darija) de façon EXTRÊMEMENT NATURELLE, comme s'il était dit à voix haute. - Évite l'arabe classique lourd. Utilise des mots spontanés (ex: راهو، كاين، ماشي، علاش، كيفاه، برك، درك...). - Écris les mots exactement comme ils se prononcent pour faciliter la lecture de l'IA vocale. - Ajoute des pauses légères en utilisant (...) et des virgules pour marquer le rythme de respiration et rendre l'audio ultra-réaliste et dynamique. Le résultat doit être 100% prêt pour être copié-collé dans un logiciel TTS." },
    { id: 5, icon: <LayoutTemplate className="w-6 h-6" />, title: "محتوى صفحة الهبوط", prompt: "Spécial (Interactive Form)" },
    { id: 6, icon: <Search className="w-6 h-6" />, title: "تفاصيل المنتج", prompt: "Crée une fiche 'Détails du Produit' structurée ainsi : 1) Nom du produit (en haut). 2) Le Public Cible / Avatar (basé strictement sur l'Avatar sélectionné). 3) Le problème précis qu'il résout : rédige un texte très professionnel et persuasif expliquant la douleur du client et comment le produit la résout, en te basant STRICTEMENT sur cet Avatar et la perspective de cet Angle marketing." },
    { id: 7, icon: <ImageIcon className="w-6 h-6" />, title: "وصف للصور الإعلانية", prompt: "Agis comme un Directeur Artistique et Stratège Meta Ads expert. En te basant STRICTEMENT sur l'Avatar et l'Angle marketing choisis, génère EXACTEMENT 7 concepts complets de visuels publicitaires (Static Ads) différents. Pour CHAQUE concept, fournis : 1. Le type d'annonce et le pattern psychologique (ex: Call Out, Avant/Après, Comparaison, Problème/Solution, Testimonial, News Article, etc.). 2. Le stade du Funnel visé (TOFU, MOFU, ou BOFU). 3. Le Prompt détaillé et professionnel pour générer l'image (pour Midjourney/DALL-E) spécifiant le style (réaliste, minimaliste, etc.), l'ambiance, et l'action pour arrêter le scroll. 4. La structure du texte SUR l'image divisée en 3 zones : Haut (Hook/Headline), Milieu (Offre/Bénéfice/Explication), Bas (CTA). 5. Des directives de design (Contrastes, couleurs, typographie). Assure-toi que chaque concept soit hyper-persuasif et adapté au marché algérien." },
    { id: 8, icon: <Rocket className="w-6 h-6" />, title: "خطة اختبار A/B", prompt: "Propose un plan de test A/B sur Facebook Ads pour ce produit en se basant sur cet avatar et cet angle (Que tester en suite : d'autres angles ? des créas spécifiques ?)." }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" dir="rtl">
      {error && (
        <div className="m-4 bg-red-50 border-r-4 border-red-500 p-4 rounded-md flex items-center shadow-sm">
          <AlertCircle className="w-6 h-6 text-red-500 ml-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {step === 'input' && (
        <div className="bg-white rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex items-center">
            <ShoppingBag className="w-6 h-6 text-teal-600 ml-3" />
            <h2 className="text-xl font-bold text-teal-900">الخطوة 1: أدخل تفاصيل المنتج للتحليل</h2>
          </div>
          <form onSubmit={startAnalysis} className="p-6 md:p-8 space-y-6">
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center text-teal-800 font-semibold min-w-max">
                <Globe className="w-5 h-5 ml-2 text-teal-600" />
                لغة الإجابة والتحليل:
              </div>
              <div className="flex space-x-2 space-x-reverse flex-wrap gap-y-2">
                {['ar', 'fr-dz', 'en'].map(lang => (
                  <label key={lang} className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-bold transition-all ${productData.language === lang ? 'bg-teal-600 text-white shadow-md border border-teal-600' : 'bg-white text-gray-600 border border-gray-200 hover:bg-teal-50'}`}>
                    <input type="radio" name="language" value={lang} checked={productData.language === lang} onChange={handleInputChange} className="hidden" />
                    {lang === 'ar' ? 'العربية' : lang === 'fr-dz' ? 'Français (Darija)' : 'English'}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المنتج أو الرابط <span className="text-red-500">*</span></label>
                <input type="text" name="nameOrLink" value={productData.nameOrLink} onChange={handleInputChange} placeholder="مثال: ممسحة تنظيف دوارة 360 درجة، أو رابط علي إكسبرس..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">وصف بسيط للمنتج <span className="text-red-500">*</span></label>
                <textarea name="description" value={productData.description} onChange={handleInputChange} rows="3" placeholder="ما هو هذا المنتج؟ وما هي مشكلته التي يحلها؟..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white"></textarea>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">صورة المنتج (اختياري - مهم جداً لصفحة الهبوط)</label>
                {!productData.imagePreview ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-teal-500 hover:bg-teal-50/30 transition bg-gray-50 cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500 px-2 py-1">
                          <span>اضغط هنا لرفع صورة المنتج</span>
                          <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG حتى 4 ميغابايت</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block w-full sm:w-auto">
                    <img src={productData.imagePreview} alt="Preview" className="h-48 w-full sm:w-auto object-cover rounded-xl border border-gray-200 shadow-sm" />
                    <button type="button" onClick={removeImage} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">سعر البيع المتوقع في الجزائر (دج) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" name="price" value={productData.price} onChange={handleInputChange} placeholder="مثال: 4500" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white pr-12" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CreditCard className="h-5 w-5 text-gray-400" /></div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">طريقة البيع</label>
                <select name="method" value={productData.method} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white">
                  <option value="Cash on Delivery (COD)">الدفع عند الاستلام (COD)</option>
                  <option value="Paiement en ligne">الدفع الإلكتروني</option>
                  <option value="Vente en gros">بيع بالجملة</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex justify-center items-center text-lg">
                بدأ تحليل المنتج <ArrowRight className="mr-2 w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      )}

      {(step === 'analyzing' || step === 'generating_service') && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center"><Rocket className="w-8 h-8 text-teal-600 animate-pulse" /></div>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-gray-800 text-center px-4">{loadingText}</h2>
          <p className="mt-2 text-gray-500">يرجى الانتظار بضع ثوانٍ (الذكاء الاصطناعي يعمل 🧠)</p>
        </div>
      )}

      {(step === 'analysis_done' || step === 'service_done') && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-400 ml-2" />
                <h2 className="text-lg font-bold text-white">1. تحليل المنتج والسوق</h2>
              </div>
              {step === 'service_done' && (
                <button onClick={() => setStep('analysis_done')} className="text-xs text-gray-300 hover:text-white underline">عرض التفاصيل</button>
              )}
            </div>
            <div className={`p-6 bg-gray-50 custom-markdown text-sm`} dir="ltr" style={{ display: step === 'service_done' ? 'none' : 'block' }}>
              {parseMarkdown(analysisResult)}
            </div>
          </div>

          {step === 'analysis_done' && !showLPForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-teal-200 p-6 my-6">
              <h3 className="text-lg font-bold text-teal-900 mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 ml-2 text-teal-600" />
                أداة الأسئلة المباشرة: لديك سؤال عن هذا التحليل؟
              </h3>
              <form onSubmit={handleAnalysisQuestionSubmit} className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={analysisQuestion} onChange={(e) => setAnalysisQuestion(e.target.value)} placeholder="اطرح سؤالك هنا قبل إكمال الخطة..." className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none transition" />
                <button type="submit" disabled={!analysisQuestion.trim()} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl transition-colors">طرح السؤال</button>
              </form>
            </div>
          )}

          {step === 'analysis_done' && !showLPForm && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-teal-100 overflow-hidden relative">
              <div className={`px-6 py-4 flex items-center justify-between ${selectedAvatar ? 'bg-teal-50' : 'bg-white'}`}>
                <div className="flex items-center">
                  <Users className={`w-6 h-6 ml-3 ${selectedAvatar ? 'text-teal-600' : 'text-gray-400'}`} />
                  <h2 className={`text-xl font-bold ${selectedAvatar ? 'text-teal-900' : 'text-gray-500'}`}>2. تحديد العميل المستهدف (Avatar)</h2>
                </div>
                {selectedAvatar && (
                  <button onClick={() => { setSelectedAvatar(null); setAngles(null); setSelectedAngle(null); }} className="text-sm text-red-600 hover:underline">تغيير العميل</button>
                )}
              </div>
              <div className="p-6 border-t border-gray-100">
                {!avatars && !selectedAvatar && (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">يجب أولاً تحديد من هو العميل الأنسب لشراء هذا المنتج.</p>
                    <button onClick={generateAvatars} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-colors inline-flex items-center">
                      <Users className="ml-2 w-5 h-5" /> استخراج 5 شخصيات عملاء (Avatars)
                    </button>
                  </div>
                )}
                {avatars && !selectedAvatar && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {avatars.map((avatar, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between" onClick={() => setSelectedAvatar(avatar)}>
                          <div dir="ltr">
                            <h3 className="font-bold text-teal-800 text-lg mb-2">{avatar.title}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-4">{avatar.description}</p>
                          </div>
                          <button className="w-full bg-teal-50 text-teal-700 py-2 rounded-lg font-bold text-sm hover:bg-teal-600 hover:text-white transition">اختيار هذا العميل</button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-teal-50 rounded-xl border border-teal-200 p-5 mt-6 animate-in fade-in duration-500">
                      <h4 className="text-md font-bold text-teal-900 mb-3 flex items-center"><MessageCircle className="w-5 h-5 ml-2 text-teal-600" />أداة الأسئلة المباشرة: تريد عملاء مختلفين؟</h4>
                      <form onSubmit={handleAvatarQuestionSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={avatarQuestion} onChange={(e) => setAvatarQuestion(e.target.value)} placeholder="مثال: لقد جربت هؤلاء، اقترح لي طلاب الجامعات، أو الأمهات..." className="flex-1 px-4 py-3 text-sm rounded-xl border border-teal-300 focus:ring-2 focus:ring-teal-500 outline-none transition bg-white" />
                        <button type="submit" disabled={!avatarQuestion.trim()} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center"><RefreshCcw className="w-4 h-4 ml-2" /> توليد من جديد</button>
                      </form>
                    </div>
                  </>
                )}
                {selectedAvatar && (
                  <div className="bg-teal-600 text-white rounded-xl p-5 flex items-start" dir="ltr">
                    <CheckCircle2 className="w-8 h-8 text-teal-200 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-xl mb-1">{selectedAvatar.title}</h3>
                      <p className="text-teal-50 leading-relaxed text-sm">{selectedAvatar.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'analysis_done' && selectedAvatar && !showLPForm && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-100 overflow-hidden animate-in fade-in duration-500">
              <div className={`px-6 py-4 flex items-center justify-between ${selectedAngle ? 'bg-amber-50' : 'bg-white'}`}>
                <div className="flex items-center">
                  <Lightbulb className={`w-6 h-6 ml-3 ${selectedAngle ? 'text-amber-600' : 'text-gray-400'}`} />
                  <h2 className={`text-xl font-bold ${selectedAngle ? 'text-amber-900' : 'text-gray-500'}`}>3. اختيار الزاوية التسويقية</h2>
                </div>
                {selectedAngle && <button onClick={() => setSelectedAngle(null)} className="text-sm text-red-600 hover:underline">تغيير الزاوية</button>}
              </div>
              <div className="p-6 border-t border-gray-100">
                {!angles && !selectedAngle && (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">الآن سنبحث عن أفضل الزوايا التي ستقنع <strong>"{selectedAvatar.title}"</strong> بالشراء.</p>
                    <button onClick={generateAngles} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow transition-colors inline-flex items-center"><Lightbulb className="ml-2 w-5 h-5" /> ابتكار 5 زوايا تسويقية لهذا العميل</button>
                  </div>
                )}
                {angles && !selectedAngle && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {angles.map((angle, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-200 hover:border-amber-500 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between" onClick={() => setSelectedAngle(angle)}>
                          <div dir="ltr">
                            <h3 className="font-bold text-amber-800 text-lg mb-2">{angle.title}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{angle.description}</p>
                          </div>
                          <button className="w-full bg-amber-50 text-amber-700 py-2 rounded-lg font-bold text-sm hover:bg-amber-500 hover:text-white transition">اعتماد هذه الزاوية</button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mt-6 animate-in fade-in duration-500">
                      <h4 className="text-md font-bold text-amber-900 mb-3 flex items-center"><MessageCircle className="w-5 h-5 ml-2 text-amber-600" />أداة الأسئلة المباشرة: جربت هذه الزوايا مسبقاً وتريد زوايا أخرى؟</h4>
                      <form onSubmit={handleAngleQuestionSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={angleQuestion} onChange={(e) => setAngleQuestion(e.target.value)} placeholder="مثال: أعطني زوايا تركز على الخوف من فقدان الفرصة، أو زوايا مضحكة..." className="flex-1 px-4 py-3 text-sm rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none transition bg-white" />
                        <button type="submit" disabled={!angleQuestion.trim()} className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center"><RefreshCcw className="w-4 h-4 ml-2" /> توليد من جديد</button>
                      </form>
                    </div>
                  </>
                )}
                {selectedAngle && (
                  <div className="bg-amber-500 text-white rounded-xl p-5 flex items-start" dir="ltr">
                    <CheckCircle2 className="w-8 h-8 text-amber-200 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-xl mb-1">{selectedAngle.title}</h3>
                      <p className="text-amber-50 leading-relaxed text-sm">{selectedAngle.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'analysis_done' && showLPForm && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center"><Settings className="w-6 h-6 text-white ml-3" /><h2 className="text-xl font-bold text-white">إعدادات صفحة الهبوط (Nano Banana Pro)</h2></div>
                <button onClick={() => setShowLPForm(false)} className="text-white hover:bg-blue-800 p-1 rounded-full transition"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleLPFormSubmit} className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">لغة الصفحة المستهدفة <span className="text-red-500">*</span></label>
                    <select name="language" value={lpFormData.language} onChange={handleLPInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition">
                      <option value="ar">العربية (المحلية والخليج)</option>
                      <option value="fr">الفرنسية (Français)</option>
                      <option value="en">الإنجليزية (English)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">نوع العرض <span className="text-red-500">*</span></label>
                    <select name="productType" value={lpFormData.productType} onChange={handleLPInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition">
                      <option value="single">منتج واحد (Single Product)</option>
                      <option value="bundle">عرض مجموعات (Bundle Offer)</option>
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المنتج <span className="text-xs text-gray-400">(تم استخراجه أوتوماتيكياً)</span></label>
                    <input type="text" name="productName" value={lpFormData.productName} onChange={handleLPInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">مميزات المنتج والمشكل الذي يحله <span className="text-xs text-gray-400">(مستخرج من التحليل)</span></label>
                    <textarea name="features" value={lpFormData.features} onChange={handleLPInputChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white"></textarea>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">العرض الترويجي (اختياري) <span className="text-xs text-gray-400">(مثال: اشتري 1 واحصل على الثاني مجاناً)</span></label>
                    <input type="text" name="promoOffer" value={lpFormData.promoOffer} onChange={handleLPInputChange} placeholder="اتركه فارغاً إن لم يوجد عرض..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الزاوية التسويقية</label>
                    <input type="text" name="angle" value={lpFormData.angle} onChange={handleLPInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">السعر المعتمد</label>
                    <input type="text" name="price" value={lpFormData.price} onChange={handleLPInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ألوان التصميم المفضلة (تم اقتراحها ذكياً)</label>
                    <input type="text" name="colors" value={lpFormData.colors} onChange={handleLPInputChange} placeholder="مثال: ذهبي وبني خفيف..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white" />
                  </div>
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex justify-center items-center text-lg">
                    توليد محتوى وبرومبت صفحة الهبوط الآن <LayoutTemplate className="mr-2 w-6 h-6" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'analysis_done' && selectedAvatar && selectedAngle && !showLPForm && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pt-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-800 p-2 rounded-lg ml-3 shadow-sm"><Rocket className="w-6 h-6" /></span>
                الخطوة 4: صناعة المحتوى الإعلاني المترابط!
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6 mb-8">
                <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center"><MessageCircle className="w-5 h-5 ml-2 text-blue-600" />استشارة خاصة حول هذه الاستراتيجية؟</h4>
                <form onSubmit={handleCustomQuestionSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input type="text" value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)} placeholder="اطرح سؤالاً عن هذا العميل أو الزاوية..." className="flex-1 px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  <button type="submit" disabled={!customQuestion.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl transition-colors">إرسال</button>
                </form>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentServices.map((service) => (
                  <button key={service.id} onClick={() => { if (service.id === 5) { openLandingPageForm(); } else { handleServiceSelection(service.id, service.title, service.prompt); } }} className="bg-white border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl p-6 rounded-2xl transition-all group flex flex-col items-center text-center transform hover:-translate-y-1 relative overflow-hidden">
                    {service.id === 5 && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">SMART FORM</div>}
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">{service.icon}</div>
                    <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-700">{service.title}</h4>
                    <p className="text-xs text-gray-500 mt-2">يعتمد على العميل والزاوية المختارة</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'service_done' && (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-500 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-white ml-3">{contentServices.find(s => s.id === currentService?.id)?.icon || <CheckCircle2 className="w-6 h-6" />}</span>
                  <h2 className="text-2xl font-bold text-white">{currentService?.title}</h2>
                </div>
                <button onClick={() => { setStep('analysis_done'); setServiceResult(''); setCurrentService(null); }} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition">العودة للإستراتيجية</button>
              </div>
              {(selectedAvatar || selectedAngle) && currentService?.id !== 5 && (
                <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex flex-wrap gap-4 text-sm" dir="ltr">
                  {selectedAvatar && <div className="flex items-center text-blue-800 font-semibold"><Users className="w-4 h-4 mr-1" /> Cible: {selectedAvatar.title}</div>}
                  {selectedAngle && <div className="flex items-center text-amber-700 font-semibold"><Lightbulb className="w-4 h-4 mr-1" /> Angle: {selectedAngle.title}</div>}
                </div>
              )}
              <div className="p-6 md:p-10 text-left bg-white custom-markdown" dir="ltr">
                {parseMarkdown(serviceResult)}
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
                <button onClick={() => navigator.clipboard.writeText(serviceResult)} className="text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center bg-blue-100 px-4 py-2 rounded-lg hover:bg-blue-200 transition">نسخ النص <SplitSquareHorizontal className="w-4 h-4 mr-2" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

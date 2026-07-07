import { AI_PROVIDERS } from '../data/providers';
import { saveChatEntry } from './chatHistoryDB';

const getSystemPrompt = (language) => {
  let langStyle = "toujours en Français adapté aux Algériens avec quelques mots en Darija (ex: Chaba, bezzaf, khouya, haya, bsahtek...).";
  if (language === 'ar') langStyle = "أجيبي دائماً باللغة العربية الاحترافية والواضحة، والمناسبة للسوق الجزائري.";
  if (language === 'en') langStyle = "always answer in professional and clear English, tailored for the Algerian market.";

  return `Tu es "Wafia Ads Master DZ", une experte en Meta Ads (Facebook + Instagram) et Landing Pages, spécialisée dans le marché algérien 🇩🇿.
Ta mission : aider à bâtir une stratégie marketing complète pour des produits e-commerce (Cash on Delivery - COD en Algérie).
Ton style : Professionnel, orienté vente, clair, ${langStyle}
Règles :
1. Tu dois toujours te concentrer sur le produit fourni et respecter les choix du client (Avatar et Angle marketing).
2. Si on te demande une analyse, tu DOIS la faire en 7 points : 1) Définition pour le client algérien, 2) Avantages clés, 3) Forces marketing, 4) Faiblesses/Risques, 5) Concurrence locale/Où c'est vendu, 6) Fourchette de prix estimée en Algérie, 7) Le problème principal qu'il résout (المشكلة التي يحلها).
3. Pour les contenus finaux (Copy, Vidéo, Landing Page), tu DOIS impérativement utiliser l'Avatar ciblé et l'Angle marketing choisis par l'utilisateur pour rédiger le contenu.`;
};

function buildFullPrompt({ prompt, isService, previousContext, avatarContext, angleContext, language }) {
  if (!isService || !previousContext) return prompt;

  let langInstruction = "en Français avec de la Darija";
  if (language === 'ar') langInstruction = "en Arabe";
  if (language === 'en') langInstruction = "en Anglais";

  let fullPrompt = `=== CONTEXTE STRICT ===
1. Analyse du Produit :
${previousContext}

`;

  if (avatarContext) {
    fullPrompt += `2. CIBLE SÉLECTIONNÉE (AVATAR) :
- Nom : ${avatarContext.title}
- Description : ${avatarContext.description}

`;
  }

  if (angleContext) {
    fullPrompt += `3. ANGLE MARKETING SÉLECTIONNÉ :
- Nom de l'angle : ${angleContext.title}
- Explication : ${angleContext.description}

`;
  }

  fullPrompt += `=== TÂCHE À RÉALISER ===
En te basant strictement sur ce produit, cet AVATAR précis, et cet ANGLE précis, réalise la tâche suivante avec ton persona Wafia Ads Master DZ (RÉPONDS IMPÉRATIVEMENT ${langInstruction.toUpperCase()}) :
${prompt}`;

  return fullPrompt;
}

export async function fetchAI({
  prompt,
  apiKey,
  provider: providerId = 'gemini',
  model,
  isService = false,
  previousContext = '',
  avatarContext = null,
  angleContext = null,
  imageBase64 = null,
  imageMimeType = null,
  images = null,
  language = 'fr-dz',
  expectJsonArray = false,
  jsonMode = false,
  customEndpoint = '',
  systemPrompt: customSystemPrompt = null,
  toolId = ''
}) {
  if (!toolId && typeof window !== 'undefined') {
    const m = window.location.pathname.match(/\/tool\/([^/]+)/);
    if (m) toolId = m[1];
  }
  const provider = AI_PROVIDERS[providerId];
  if (!provider) throw new Error(`مزود AI غير معروف: ${providerId}`);

  const effectiveModel = model || provider.defaultModel;
  const fullPrompt = buildFullPrompt({ prompt, isService, previousContext, avatarContext, angleContext, language });
  const systemPrompt = customSystemPrompt || getSystemPrompt(language);

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  const isVisionModel = provider.models?.some(m => m.id === effectiveModel && m.vision);
  let imgParts = images && images.length > 0
    ? images.filter(Boolean)
    : (imageBase64 && imageMimeType ? [{ base64: imageBase64, mimeType: imageMimeType }] : []);

  let userContent = fullPrompt;
  if (imgParts.length > 0) {
    if (isVisionModel) {
      userContent = [{ type: 'text', text: fullPrompt }];
      imgParts.forEach(img => {
        userContent.push({ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.base64}` } });
      });
    } else {
      userContent = fullPrompt + '\n\n[📷 المستخدم أرفق صورة للمنتج]';
    }
  }
  messages.push({ role: 'user', content: userContent });

  let url, headers, body;

  if (providerId === 'gemini') {
    headers = provider.headers();
    url = provider.endpoint(apiKey, effectiveModel);
    body = provider.buildChatBody({
      messages,
      systemPrompt,
      imageData: imageBase64 ? { base64: imageBase64, mimeType: imageMimeType } : null,
      jsonMode: expectJsonArray
    });
  } else {
    headers = provider.headers(apiKey);
    let baseUrl = customEndpoint || provider.endpoint;

    if (!baseUrl || !baseUrl.startsWith('http')) {
      console.warn('Invalid baseUrl, falling back:', { baseUrl, customEndpoint, endpoint: provider.endpoint });
      baseUrl = provider.endpoint;
    }

    if (!baseUrl.endsWith('/chat/completions')) {
      baseUrl = baseUrl.replace(/\/+$/, '') + '/chat/completions';
    }

    body = provider.buildChatBody({
      messages,
      model: effectiveModel,
      jsonMode: jsonMode || expectJsonArray
    });

    if (provider.supportsBrowserCors === false) {
      url = '/api/cors-proxy';
    } else {
      url = baseUrl;
    }
  }

  let retries = 3;
  let delay = 2000;

  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      signal: AbortSignal.timeout(300000)
    });

    if (!response.ok) {
      let errDetail = '';
      try {
        const errText = await response.text();
        errDetail = errText.slice(0, 500);
      } catch { /* ignore */ }
      const is503 = response.status === 503;
      if (is503) {
        if (retries > 1) {
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
          retries--;
          continue;
        }
        throw new Error('الخدمة مزدحمة حالياً. جرب بعد دقائق.');
      }
      const is403 = response.status === 403;
      if (is403) {
        throw new Error('مفتاح API أو مشروع Google غير مصرح له باستخدام Gemini API. تأكد من:\n1. تفعيل "Generative Language API" في Google Cloud Console\n2. أو استخدم مفتاح من aistudio.google.com\n3. أو المشروع قد يكون محظوراً — راسل الدعم.');
      }
      throw new Error(`[${response.status}] ${response.statusText}${errDetail ? ` - ${errDetail}` : ''}`);
    }

    const data = await response.json();
    const result = expectJsonArray ? provider.parseJson(data) : provider.parseChat(data);
    const resultText = typeof result === 'string' ? result : JSON.stringify(result);
    saveChatEntry({ toolId, prompt, response: resultText, providerId, model: effectiveModel }).catch(() => {});
    return result;
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error(`الموديل ${effectiveModel} استغرق وقتاً طويلاً. جرب مرة أخرى أو اختر موديل أسرع.`);
    }
      retries--;
      if (retries === 0) throw error;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
}

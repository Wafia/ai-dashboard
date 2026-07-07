import { useState } from 'react';
import {
  Users, RefreshCcw, AlertCircle, ArrowRight,
  MessageCircle, CheckCircle2, ShoppingBag, Globe,
  UserCheck, X
} from 'lucide-react';
import { fetchAI } from '../utils/ai';

export default function AvatarsGenerator({ apiKey, model, customEndpoint, providerId }) {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('ar');
  const [avatars, setAvatars] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState('');

  const commonAIOptions = { apiKey, provider: providerId || 'nvidia', model: model || 'deepseek-ai/deepseek-v4-flash', customEndpoint };

  const generateAvatars = async (e) => {
    e?.preventDefault();
    if (!productName.trim() || !description.trim()) {
      setError('يرجى إدخال اسم المنتج والوصف');
      return;
    }
    setError(null);
    setLoading(true);
    setAvatars(null);

    const langInstruction = language === 'ar' ? 'باللغة العربية الفصحى المناسبة للسوق الجزائري'
      : language === 'fr-dz' ? 'en Français avec de la Darija algérienne'
      : 'in English';

    const prompt = `Analyse ce produit pour le marché algérien:
- Nom: ${productName}
- Description: ${description}

Génère 5 profils de clients idéaux (Avatars) très spécifiques et détaillés. Chaque profil doit inclure: âge, profession, problème exact, motivation d'achat, et canal préféré.

Réponds ${langInstruction}.
Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "avatars" qui est un tableau d'objets. Chaque objet doit avoir "title" (string) et "description" (string). Exemple: {"avatars":[{"title":"Titre","description":"Description détaillée"}]}`;

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt,
        language,
        expectJsonArray: true
      });
      setAvatars(result);
    } catch (err) {
      setError(`❌ ${err.message || 'حدث خطأ'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !avatars) return;
    setError(null);
    setLoading(true);

    const langInstruction = language === 'ar' ? 'باللغة العربية الفصحى'
      : language === 'fr-dz' ? 'en Français avec de la Darija'
      : 'in English';

    const prompt = `Analyse ce produit pour le marché algérien:
- Nom: ${productName}
- Description: ${description}

L'utilisateur a une demande spécifique: "${question}".
IMPORTANT: Voici les profils DÉJÀ générés:
${JSON.stringify(avatars)}

NE LES RÉPÈTE PAS. Génère 5 NOUVEAUX profils de clients (Avatars) différents, en respectant la demande.

Réponds ${langInstruction}.
Réponds UNIQUEMENT avec un objet JSON valide contenant une clé "avatars" qui est un tableau d'objets. Chaque objet doit avoir "title" (string) et "description" (string).`;

    try {
      const result = await fetchAI({
        ...commonAIOptions,
        prompt,
        language,
        expectJsonArray: true
      });
      setAvatars(result);
      setQuestion('');
    } catch (err) {
      setError(`❌ ${err.message || 'حدث خطأ'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" dir="rtl">
      {error && (
        <div className="m-4 bg-red-50 border-r-4 border-red-500 p-4 rounded-md flex items-center shadow-sm">
          <AlertCircle className="w-6 h-6 text-red-500 ml-3 flex-shrink-0" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Input Form */}
      {!avatars && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center">
            <Users className="w-6 h-6 text-indigo-600 ml-3" />
            <h2 className="text-xl font-bold text-indigo-900">توليد شخصيات العملاء المستهدفين (Avatars)</h2>
          </div>
          <form onSubmit={generateAvatars} className="p-6 md:p-8 space-y-6">
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center text-indigo-800 font-semibold">
                <Globe className="w-5 h-5 ml-2 text-indigo-600" />
                لغة التحليل:
              </div>
              <div className="flex space-x-2 space-x-reverse flex-wrap gap-y-2">
                {['ar', 'fr-dz', 'en'].map(lang => (
                  <label key={lang} className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-bold transition-all ${language === lang ? 'bg-indigo-600 text-white shadow-md border border-indigo-600' : 'bg-white text-gray-600 border border-gray-200 hover:bg-indigo-50'}`}>
                    <input type="radio" name="language" value={lang} checked={language === lang} onChange={(e) => setLanguage(e.target.value)} className="hidden" />
                    {lang === 'ar' ? 'العربية' : lang === 'fr-dz' ? 'Français (Darija)' : 'English'}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المنتج <span className="text-red-500">*</span></label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="مثال: ممسحة كهربائية دوارة 360 درجة" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">وصف المنتج والمشكلة التي يحلها <span className="text-red-500">*</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" placeholder="ما هو هذا المنتج؟ لمن؟ وما المشكلة التي يحلها؟..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm bg-gray-50 focus:bg-white" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex justify-center items-center text-lg">
              توليد 5 شخصيات عملاء <ArrowRight className="mr-2 w-6 h-6" />
            </button>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center"><Users className="w-8 h-8 text-indigo-600 animate-pulse" /></div>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-gray-800 text-center px-4">جاري توليد شخصيات العملاء...</h2>
          <p className="mt-2 text-gray-500">يرجى الانتظار بضع ثوانٍ</p>
        </div>
      )}

      {/* Results */}
      {avatars && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 p-6">
          <div className="bg-white rounded-xl border border-indigo-200 overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <UserCheck className="w-6 h-6 text-white ml-3" />
                <h2 className="text-xl font-bold text-white">شخصيات العملاء المستهدفين</h2>
              </div>
              <button onClick={() => { setAvatars(null); setQuestion(''); }} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition">تغيير المنتج</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {avatars.map((avatar, idx) => (
                  <div key={idx} className="bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-5 transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 font-bold text-lg">
                      {idx + 1}
                    </div>
                    <h3 className="font-bold text-indigo-800 text-lg mb-2">{avatar.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{avatar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question form */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
            <h4 className="text-md font-bold text-indigo-900 mb-3 flex items-center">
              <MessageCircle className="w-5 h-5 ml-2 text-indigo-600" />
              تريد شخصيات مختلفة أو أكثر تحديداً؟
            </h4>
            <form onSubmit={handleQuestionSubmit} className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="مثال: ركز على الطلاب الجامعيين، أو الأمهات العاملات..." className="flex-1 px-4 py-3 text-sm rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white" />
              <button type="submit" disabled={!question.trim() || loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center">
                <RefreshCcw className="w-4 h-4 ml-2" /> توليد من جديد
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

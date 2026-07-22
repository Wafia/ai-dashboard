import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Wand2, Download, Settings2, Loader2, User, AudioLines, Info, ArrowLeft, Key, Volume2, Play } from 'lucide-react';

const VOICES = [
  { id: 'mehdi', name: 'مهدي (Mehdi)', gen: 'ذكر', desc: 'شاب حيوي — إعلانات سريعة وحماسية', color: 'bg-blue-500' },
  { id: 'amira', name: 'أميرة (Amira)', gen: 'أنثى', desc: 'عصرية — سوشيال ميديا وموضة', color: 'bg-pink-500' },
  { id: 'karim', name: 'كريم (Karim)', gen: 'ذكر', desc: 'عميق وفخم — سيارات وعقارات', color: 'bg-indigo-500' },
  { id: 'meriem', name: 'مريم (Meriem)', gen: 'أنثى', desc: 'دافئ وأمومي — سرد قصص ومنتجات منزلية', color: 'bg-purple-500' },
  { id: 'tariq', name: 'طارق (Tariq)', gen: 'ذكر', desc: 'رسمي وواضح — شروحات وتعليم', color: 'bg-cyan-500' },
  { id: 'sarah', name: 'سارة (Sarah)', gen: 'أنثى', desc: 'سريعة وحماسية — تيك توك وريلز', color: 'bg-rose-500' },
  { id: 'sofiane', name: 'سفيان (Sofiane)', gen: 'ذكر', desc: 'هادئ وواثق — منتجات فاخرة', color: 'bg-amber-500' },
  { id: 'fatima', name: 'فاطمة (Fatima)', gen: 'أنثى', desc: 'رزينة ومقنعة — طبي ووثائقي', color: 'bg-teal-500' },
  { id: 'riad', name: 'رياض (Riad)', gen: 'ذكر', desc: 'عفوي — كأنك تهدر مع صديق', color: 'bg-orange-500' },
  { id: 'yasmine', name: 'ياسمين (Yasmine)', gen: 'أنثى', desc: 'احترافية — إعلانات شركات', color: 'bg-violet-500' },
];

const TONES = [
  { id: 'sales', name: 'تحفيز على الشراء', hint: 'حماس + إلحاح — للعروض والتخفيضات' },
  { id: 'premium', name: 'ثقة وجودة', hint: 'هادئ واثق — للمنتجات الغالية' },
  { id: 'friendly', name: 'ودّية', hint: 'طبيعي بسيط — كأنك تهدر مع صديق' },
  { id: 'energetic', name: 'حماسية', hint: 'سريع مليء بالطاقة — ريلز وتيك توك' },
  { id: 'informative', name: 'شرح وتوعية', hint: 'واضح متوازن — تقني وصحي' },
];

const GEMINI_VOICE_MAP = {
  mehdi: 'Fenrir', amira: 'Aoede', karim: 'Puck', meriem: 'Kore',
  tariq: 'Charon', sarah: 'Leda', sofiane: 'Zephyr', fatima: 'Callirrhoe',
  riad: 'Orus', yasmine: 'Autonoe',
};

export default function SawtDZ() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('karim');
  const [tone, setTone] = useState('sales');
  const [speed, setSpeed] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('gemini');

  useEffect(() => {
    const key = localStorage.getItem('sawtdz_gemini_key');
    if (key) setApiKey(key.replace(/^["'\s]+|["'\s]+$/g, ''));
  }, []);

  const saveKey = (val) => {
    const clean = val.replace(/^["'\s]+|["'\s]+$/g, '');
    setApiKey(clean);
    if (clean) localStorage.setItem('sawtdz_gemini_key', clean);
    else localStorage.removeItem('sawtdz_gemini_key');
  };

  function pcmToWavBlob(base64, sampleRate = 24000) {
    const raw = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    const buf = new ArrayBuffer(44 + bytes.length);
    const v = new DataView(buf);
    const w = (off, str) => { for (let i = 0; i < str.length; i++) v.setUint8(off + i, str.charCodeAt(i)); };
    w(0, 'RIFF');
    v.setUint32(4, 36 + bytes.length, true);
    w(8, 'WAVE');
    w(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    w(36, 'data');
    v.setUint32(40, bytes.length, true);
    for (let i = 0; i < bytes.length; i++) v.setUint8(44 + i, bytes[i]);
    return new Blob([buf], { type: 'audio/wav' });
  }

  function rawToBlob(base64, mime) {
    const raw = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  async function generateGemini() {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: GEMINI_VOICE_MAP[voice] },
              },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      let msg = `خطأ ${res.status}`;
      try { const j = await res.json(); msg = j.error?.message || msg; } catch {}
      throw new Error(msg);
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const part = parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error('لم يتم إرجاع بيانات صوتية');

    const b64 = part.inlineData.data;
    const raw = atob(b64);

    // PCM خام (بدون هيدر) — نضيف هيدر WAV (هذا المتوقع من Gemini TTS)
    // لو كان فيه هيدر RIFF — نستخدمه كم هو
    if (raw.length > 4 && raw.charCodeAt(0) === 0x52 && raw.charCodeAt(1) === 0x49 &&
        raw.charCodeAt(2) === 0x46 && raw.charCodeAt(3) === 0x46) {
      return URL.createObjectURL(rawToBlob(b64, 'audio/wav'));
    }
    return URL.createObjectURL(pcmToWavBlob(b64, 24000));
  }

  function generateBrowser() {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) return reject(new Error('المتصفح لا يدعم'));
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      u.rate = speed;
      const voices = window.speechSynthesis.getVoices();
      const ar = voices.find(v => v.lang.startsWith('ar'));
      if (ar) u.voice = ar;
      window.speechSynthesis.speak(u);
      u.onend = () => resolve(null);
      u.onerror = (e) => reject(e.error || 'خطأ في التشغيل');
    });
  }

  async function handleGenerate() {
    if (!text.trim()) return setError('اكتب النص أولاً');
    setError('');
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    setBusy(true);
    try {
      if (mode === 'gemini') {
        const url = await generateGemini();
        setAudioUrl(url);
      } else {
        await generateBrowser();
      }
    } catch (e) {
      setError('فشل التوليد');
    } finally {
      setBusy(false);
    }
  }

  const activeTone = TONES.find(t => t.id === tone);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans" dir="rtl">
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="bg-emerald-600 p-2 rounded-lg"><Mic className="text-white w-5 h-5" /></div>
            <div>
              <h1 className="text-xl font-bold">Sawt<span className="text-emerald-500">DZ</span></h1>
              <span className="text-xs text-gray-400">استوديو التعليق الصوتي</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===== العمود الأيمن (2/3) ===== */}
        <div className="lg:col-span-2 space-y-5">

          {/* --- مفتاح API — واضح ومباشر --- */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold text-emerald-400">مفتاح Google Gemini API</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">أدخل مفتاحك المدفوع من <span dir="ltr" className="text-emerald-500">aistudio.google.com</span> — بدونه يعمل المتصفح فقط</p>
            <input
              type="text"
              value={apiKey}
              onChange={e => saveKey(e.target.value)}
              placeholder="أدخل مفتاح Google Gemini API هنا..."
              className="w-full px-4 py-3 bg-gray-950 border-2 border-emerald-800/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono text-sm dir-ltr text-left"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setMode('gemini')}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${mode === 'gemini' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}`}
              >
                <span className="flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5" />Gemini احترافي</span>
              </button>
              <button
                onClick={() => setMode('browser')}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${mode === 'browser' ? 'bg-amber-600 text-white border-amber-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}`}
              >
                <span className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" />المتصفح (تجريبي)</span>
              </button>
            </div>
          </div>

          {/* --- السكريبت --- */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold">السكريبت الإعلاني</label>
              <span className={`text-xs ${text.length > 2000 ? 'text-red-400' : 'text-gray-500'}`}>{text.length}</span>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={7}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none leading-relaxed"
              placeholder="اكتب السكريبت الإعلاني بالدارجة الجزائرية..."
            />
          </div>

          {/* --- الأصوات --- */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><User className="w-4 h-4 text-emerald-400" />اختر الصوت</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar">
              {VOICES.map(v => (
                <button key={v.id} onClick={() => setVoice(v.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                    voice === v.id
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${v.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {v.gen === 'ذكر' ? '♂' : '♀'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-gray-200">{v.name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{v.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== العمود الأيسر (1/3) ===== */}
        <div className="space-y-5">

          {/* --- النبرة --- */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <h3 className="text-sm font-semibold mb-3">النبرة التسويقية</h3>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 text-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer text-sm"
            >
              {TONES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {activeTone && (
              <div className="mt-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3">
                <p className="text-xs text-emerald-300">{activeTone.hint}</p>
              </div>
            )}
          </div>

          {/* --- السرعة --- */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">السرعة</span>
              <span className="text-xs font-mono text-emerald-500">{speed}x</span>
            </div>
            <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
          </div>

          {/* --- زر التوليد --- */}
          <button onClick={handleGenerate} disabled={busy || !text.trim()}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-base transition-all shadow-xl border ${
              mode === 'gemini'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-900/30 border-emerald-400/20 text-white'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-900/30 border-amber-400/20 text-white'
            } disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:border-gray-700 disabled:shadow-none`}
          >
            {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري التوليد...</>
              : <><Wand2 className="w-5 h-5" />{mode === 'gemini' ? 'توليد التعليق الصوتي' : 'تشغيل معاينة المتصفح'}</>}
          </button>

          {/* --- الخطأ --- */}
          {error && (
            <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4">
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* --- مشغل الصوت والتحميل --- */}
          {audioUrl && (
            <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl shadow-emerald-900/20">
              <h3 className="text-emerald-400 font-bold text-sm flex items-center gap-2 mb-3">
                <Volume2 className="w-4 h-4" />المسار الصوتي جاهز
              </h3>
              <audio controls src={audioUrl} className="w-full h-10 mb-3" autoPlay />
              <a href={audioUrl} download={`SawtDZ_${voice}_${tone}.wav`}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl flex justify-center items-center gap-2 text-sm transition-colors font-medium border border-gray-700"
              >
                <Download className="w-4 h-4 text-emerald-400" />تحميل المقطع الصوتي (WAV)
              </a>
            </div>
          )}

          {/* --- ملاحظات --- */}
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4">
            <ul className="text-[11px] text-gray-500 space-y-1.5">
              <li className="flex items-center gap-1.5"><span className="text-emerald-500">•</span> للتوليد الاحترافي: أدخل مفتاح Google Gemini API أعلاه</li>
              <li className="flex items-center gap-1.5"><span className="text-amber-500">•</span> بدون مفتاح: يعمل المتصفح بصوت تجريبي (بدون تحميل)</li>
              <li className="flex items-center gap-1.5"><span className="text-emerald-500">•</span> مفتاح API يحفظ تلقائياً في متصفحك</li>
            </ul>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(17,24,39,1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(55,65,81,1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.5); }
      `}</style>
    </div>
  );
}

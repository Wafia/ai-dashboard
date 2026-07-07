import {
  Megaphone,
  PenTool,
  MessageCircle,
  Image as ImageIcon,
  Code,
  Sparkles,
  Users,
  Camera,
  Palette,
  Hand,
  LayoutGrid,
  User,
  Mic,
  Volume2
} from 'lucide-react';

export const tools = [
  {
    id: 'wafia-ads',
    title: 'Wafia Ads Master DZ',
    description: 'بناء استراتيجية إعلانات ميتا ولاندينج بيجز متكاملة للسوق الجزائري مع الذكاء الاصطناعي',
    icon: Megaphone,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    component: 'WafiaAdsMaster',
    apiKeyLabel: 'مفتاح Gemini API',
    apiKeyPlaceholder: 'أدخل مفتاح Gemini API الخاص بك...'
  },
  {
    id: 'avatar-gen',
    title: 'Avatars Generator',
    description: 'توليد وتحليل شخصيات العملاء المستهدفين (Avatars) لأي منتج',
    icon: Users,
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-600',
    component: 'AvatarsGenerator',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'creative-studio',
    title: 'Creative Studio',
    description: 'تحليل منتج + شخص وتوليد 6 برومبتات احترافية بأنماط تصوير مختلفة',
    icon: Camera,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    component: 'CreativeStudio',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'adpro-vision',
    title: 'AdPro Vision',
    description: 'تحليل الصور الإعلانية وإعادة إنتاجها بذكاء مع برومبتات احترافية',
    icon: Camera,
    color: 'violet',
    gradient: 'from-violet-500 to-pink-600',
    component: 'AdProVision',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'adfusion',
    title: 'AdFusion',
    description: 'دمج ذكي للمنتجات في التصاميم الإعلانية — تحليل وتكيف لوني احترافي',
    icon: Palette,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    component: 'AdFusion',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'pose-craft',
    title: 'PoseCraft',
    description: 'دمج المنتجات مع الأفاتار — تشكيل الوضعية المثالية للإمساك بالمنتج',
    icon: Hand,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    component: 'PoseCraft',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'angle-craft',
    title: 'AngleCraft',
    description: 'توليد 6 زوايا تصوير احترافية للمنتجات — Hero, Three-Quarter, Macro, Lifestyle والمزيد',
    icon: LayoutGrid,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    component: 'AngleCraft',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'wear-craft',
    title: 'WearCraft',
    description: 'تثبيت المنتج على الأفاتار + توليد 6 زوايا — Avatar Product Placement Engine',
    icon: User,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    component: 'WearCraft',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'adscript-studio',
    title: 'AdScript Studio',
    description: 'مولد سكربتات إعلانية جزائرية بالدارجة مع 10 أصوات ونبرات ذكية — جاهز لـ ElevenLabs',
    icon: Mic,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    component: 'AdScriptStudio',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'sawtdz',
    title: 'SawtDZ',
    description: 'محترف تحويل النص إلى صوت — استوديو تعليق صوتي جزائري بالذكاء الاصطناعي',
    icon: Volume2,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    component: 'SawtDZ',
    apiKeyLabel: 'مفتاح Google Gemini API',
    apiKeyPlaceholder: 'أدخل مفتاح Gemini API (اختياري)'
  },
  {
    id: 'chatbot',
    title: 'Chatbot Builder',
    description: 'بناء محادثات وروبوتات دردشة تفاعلية لخدمة العملاء والمبيعات',
    icon: MessageCircle,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    component: 'ToolComingSoon',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'image-gen',
    title: 'Image Generator',
    description: 'توليد صور إعلانية ومنتجات احترافية باستخدام الذكاء الاصطناعي — Imagine Studio Pro',
    icon: ImageIcon,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    component: 'ImageGenerator',
    apiKeyLabel: 'مفتاح Image API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'code-helper',
    title: 'Code Assistant',
    description: 'مساعد برمجي ذكي لكتابة وتصحيح وتحسين الأكواد البرمجية',
    icon: Code,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    component: 'ToolComingSoon',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  },
  {
    id: 'seo-tools',
    title: 'SEO Optimizer',
    description: 'تحسين محركات البحث وتحليل الكلمات المفتاحية لمحتواك',
    icon: Sparkles,
    color: 'cyan',
    gradient: 'from-cyan-500 to-sky-600',
    component: 'ToolComingSoon',
    apiKeyLabel: 'مفتاح AI API',
    apiKeyPlaceholder: 'أدخل مفتاح API...'
  }
];

export const colorMap = {
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50', ring: 'ring-rose-500' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-600', border: 'border-teal-200', light: 'bg-teal-50', ring: 'ring-teal-500' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50', ring: 'ring-purple-500' },
  pink: { bg: 'bg-pink-600', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50', ring: 'ring-pink-500' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', ring: 'ring-amber-500' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', ring: 'ring-blue-500' },
  cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50', ring: 'ring-cyan-500' },
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50', ring: 'ring-indigo-500' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50', ring: 'ring-violet-500' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', ring: 'ring-emerald-500' },
};

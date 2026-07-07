import { useNavigate } from 'react-router-dom';
import { Sparkles, Rocket, LogOut, Shield } from 'lucide-react';
import { tools, colorMap } from '../data/tools';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-950" dir="rtl">
      {/* Header bar */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-bold text-lg">AI Tools Hub</span>
          </div>
          <div className="flex items-center gap-3">
            {role === 'admin' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all text-sm"
              >
                <Shield className="w-4 h-4" />
                لوحة التحكم
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden -mt-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">منصة الأدوات الذكية</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
              AI Tools
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Hub</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              مجموعة متكاملة من أدوات الذكاء الاصطناعي لمساعدتك في التسويق، الكتابة، التصميم، والبرمجة
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">اختر أداتك</h2>
            <p className="text-gray-500">كل أداة مدعومة بالذكاء الاصطناعي ومصممة لاحتياجاتك</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const colors = colorMap[tool.color];
              return (
                <button
                  key={tool.id}
                  onClick={() => navigate(`/tool/${tool.id}`)}
                  className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 text-right transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tool.gradient}`} />
                  
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-5 shadow-lg shadow-${tool.color}-500/20 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                  
                  {tool.component === 'ToolComingSoon' ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                      <Rocket className="w-3 h-3" />
                      قريباً
                    </div>
                  ) : (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${colors.text} ${colors.light} px-3 py-1.5 rounded-full`}>
                      <Rocket className="w-3 h-3" />
                      تشغيل الأداة
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Tools Hub — جميع الأدوات تعمل بالذكاء الاصطناعي</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
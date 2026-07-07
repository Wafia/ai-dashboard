import { Construction, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tools, colorMap } from '../data/tools';

export default function ToolComingSoon({ toolId }) {
  const navigate = useNavigate();
  const tool = tools.find(t => t.id === toolId);
  const colors = colorMap[tool?.color || 'blue'];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {tool && (
                <>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-gray-900">{tool.title}</h1>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
          <Construction className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">قريباً</h2>
        <p className="text-gray-500 max-w-md mb-2">
          هذه الأداة قيد التطوير وستكون متاحة قريباً
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>قيد الإعداد</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}

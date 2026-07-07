import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { LayoutDashboard, Users, Bell, LogOut, BarChart3, Loader2 } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'الإحصائيات', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'clients', label: 'العملاء', icon: Users, href: '/admin/clients' },
  { id: 'alerts', label: 'التنبيهات', icon: Bell, href: '/admin/alerts' },
];

export default function AdminLayout({ children, activeTab, onNavigate }) {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('sharing_alerts').select('id', { count: 'exact', head: true }).eq('resolved', false),
      supabase.from('usage_logs').select('id', { count: 'exact', head: true }),
    ]).then(([clients, alerts, logs]) => {
      setStats({
        clients: clients.count || 0,
        alerts: alerts.count || 0,
        usage: logs.count || 0,
      });
    }).catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold">لوحة التحكم</h1>
              <p className="text-[10px] text-gray-400">AI Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.id === 'alerts' && stats?.alerts > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {stats.alerts}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-gray-800">
          {stats && (
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div>
                <p className="text-lg font-bold text-white">{stats.clients}</p>
                <p className="text-[10px] text-gray-500">عملاء</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{stats.usage}</p>
                <p className="text-[10px] text-gray-500">استخدام</p>
              </div>
              <div>
                <p className={`text-lg font-bold ${stats.alerts > 0 ? 'text-red-400' : 'text-white'}`}>{stats.alerts}</p>
                <p className="text-[10px] text-gray-500">تنبيهات</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Bell, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('id, is_active, created_at', { count: 'exact' }),
      supabase.from('sharing_alerts').select('id, resolved, detected_at', { count: 'exact' }),
      supabase.from('usage_logs').select('tool_id, provider_used, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(20),
      supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('is_blocked', false),
    ]).then(([clientsRes, alertsRes, logsRes, sessionsRes]) => {
      const clients = clientsRes.data || [];
      const alerts = alertsRes.data || [];
      const logs = logsRes.data || [];
      setData({
        totalClients: clients.length,
        activeClients: clients.filter(c => c.is_active).length,
        totalAlerts: alerts.length,
        unresolvedAlerts: alerts.filter(a => !a.resolved).length,
        totalUsage: logsRes.count || 0,
        activeSessions: sessionsRes.count || 0,
        recentLogs: logs.slice(0, 10),
      });
    }).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const cards = [
    { label: 'إجمالي العملاء', value: data.totalClients, icon: Users, color: 'from-blue-500 to-indigo-600', trend: null },
    { label: 'عملاء نشطون', value: data.activeClients, icon: Users, color: 'from-green-500 to-emerald-600', trend: null },
    { label: 'جلسات نشطة', value: data.activeSessions, icon: BarChart3, color: 'from-cyan-500 to-sky-600', trend: null },
    { label: 'تنبيهات غير محلولة', value: data.unresolvedAlerts, icon: Bell, color: 'from-red-500 to-rose-600', trend: data.unresolvedAlerts > 0 ? 'up' : 'down' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">الإحصائيات</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">{card.label}</span>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            {card.trend && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${card.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                {card.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.trend === 'up' ? 'يتطلب انتباه' : 'لا توجد مشاكل'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary + Usage Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h2 className="text-sm font-bold text-gray-700 mb-4">إجمالي الاستخدام</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{data.totalUsage}</p>
              <p className="text-xs text-gray-500">استدعاء AI</p>
            </div>
          </div>
        </div>

        {/* Clients quick list */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h2 className="text-sm font-bold text-gray-700 mb-4">حالة العملاء</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">إجمالي العملاء</span>
              <span className="font-bold">{data.totalClients}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">نشطون</span>
              <span className="font-bold text-green-600">{data.activeClients}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600">موقوفون</span>
              <span className="font-bold text-red-600">{data.totalClients - data.activeClients}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

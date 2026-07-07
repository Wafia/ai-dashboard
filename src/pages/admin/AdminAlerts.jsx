import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sharing_alerts')
      .select('*, clients(email)')
      .order('detected_at', { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  };

  const resolveAlert = async (id) => {
    await supabase.from('sharing_alerts').update({ resolved: true }).eq('id', id);
    loadAlerts();
  };

  const blockClient = async (clientId) => {
    await supabase.from('clients').update({ is_active: false }).eq('id', clientId);
    await supabase.from('sharing_alerts').update({ resolved: true }).eq('client_id', clientId);
    loadAlerts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">التنبيهات</h1>
        <span className="text-xs text-gray-500">مراقبة مشاركة الحسابات</span>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">لا توجد تنبيهات</p>
            <p className="text-xs text-gray-400 mt-1">كل الحسابات تستخدم من جهاز واحد</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`bg-white rounded-2xl p-4 border ${
              alert.resolved ? 'border-gray-200 opacity-60' : 'border-red-200'
            } shadow-sm`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    alert.resolved ? 'bg-gray-100' : 'bg-red-100'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${alert.resolved ? 'text-gray-400' : 'text-red-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-800">
                        {alert.clients?.email || 'عميل محذوف'}
                      </span>
                      {!alert.resolved && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          غير محلول
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      تم اكتشاف جهاز جديد: <span className="font-mono bg-gray-100 px-1 rounded text-[10px]">{alert.device_1?.slice(0, 12)}</span>
                      {' ← '}
                      <span className="font-mono bg-gray-100 px-1 rounded text-[10px]">{alert.device_2?.slice(0, 12)}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(alert.detected_at).toLocaleString('ar-DZ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!alert.resolved && (
                    <>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all"
                      >
                        تم الحل
                      </button>
                      <button
                        onClick={() => blockClient(alert.client_id)}
                        className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all"
                      >
                        حظر العميل
                      </button>
                    </>
                  )}
                  {alert.resolved && (
                    <span className="text-xs text-gray-400">تم الحل</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

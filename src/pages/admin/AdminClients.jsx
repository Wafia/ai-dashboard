import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Plus, Trash2, Key, X, CheckCircle2, Loader2,
  Ban, CheckCircle, Search, ShieldAlert
} from 'lucide-react';

const FN_URL = 'https://jynyxvwvttmthiesfiya.supabase.co/functions/v1/create-client-user';

async function callFn(action, payload) {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xBimyzu7c5LprkX3YOTnRw_UIMdBVc6';
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${anonKey}` },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشلت العملية');
  return data;
}

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'delete' | 'password'
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  };

  const openModal = (type, client = null) => {
    setSelectedClient(client);
    setModal(type);
    setFormData({ email: client?.email || '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  };

  const handleCreate = async () => {
    setError(''); setSuccess('');
    if (!formData.email.includes('@')) { setError('الإيميل غير صالح'); return; }
    if (formData.password.length < 6) { setError('كلمة المرور أقل من 6 أحرف'); return; }
    if (formData.password !== formData.confirmPassword) { setError('كلمة المرور غير متطابقة'); return; }
    setSaving(true);
    try {
      await callFn('create', { email: formData.email, password: formData.password });
      setSuccess(`✅ تمت الإضافة بنجاح`);
      setModal(null);
      loadClients();
    } catch (err) { setError('حدث خطأ أثناء المعالجة'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await callFn('delete', { email: selectedClient.email });
      await supabase.from('clients').delete().eq('id', selectedClient.id);
      setSuccess(`✅ تم حذف ${selectedClient.email}`);
      setModal(null);
      loadClients();
    } catch (err) { setError('حدث خطأ أثناء المعالجة'); }
    finally { setSaving(false); }
  };

  const handleUpdatePassword = async () => {
    setError(''); setSuccess('');
    if (formData.password.length < 6) { setError('كلمة المرور أقل من 6 أحرف'); return; }
    if (formData.password !== formData.confirmPassword) { setError('كلمة المرور غير متطابقة'); return; }
    setSaving(true);
    try {
      await callFn('update-password', { user_id: selectedClient.auth_user_id, password: formData.password });
      setSuccess(`✅ تم تغيير كلمة المرور لـ ${selectedClient.email}`);
      setModal(null);
    } catch (err) { setError('حدث خطأ أثناء المعالجة'); }
    finally { setSaving(false); }
  };

  const toggleBlock = async (client) => {
    await supabase.from('clients').update({ is_active: !client.is_active }).eq('id', client.id);
    loadClients();
  };

  const filtered = clients.filter(c => c.email.includes(search));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة حسابات العملاء — إضافة، حذف، تغيير كلمة المرور، حظر</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all text-sm shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          إضافة عميل جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 بحث بإيميل العميل..."
          className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none bg-white shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">لا يوجد عملاء</p>
            <p className="text-sm mt-1">أضف أول عميل الآن</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-right p-4 text-xs font-bold text-gray-500">#</th>
                <th className="text-right p-4 text-xs font-bold text-gray-500">الإيميل</th>
                <th className="text-center p-4 text-xs font-bold text-gray-500">الحالة</th>
                <th className="text-right p-4 text-xs font-bold text-gray-500">تاريخ التسجيل</th>
                <th className="text-center p-4 text-xs font-bold text-gray-500">التحكم</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-400 font-mono">{i + 1}</td>
                  <td className="p-4 text-sm font-semibold text-gray-800">{c.email}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      c.is_active
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {c.is_active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {c.is_active ? 'نشط' : 'محظور'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openModal('password', c)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="تغيير كلمة المرور"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleBlock(c)}
                        className={`p-2 rounded-lg transition-all ${
                          c.is_active
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={c.is_active ? 'حظر' : 'إلغاء الحظر'}
                      >
                        {c.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openModal('delete', c)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="حذف العميل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ============ MODALS ============ */}

      {/* Add Client Modal */}
      {modal === 'add' && (
        <Modal onClose={() => setModal(null)} title="إضافة عميل جديد">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">الإيميل</label>
              <input
                type="email" value={formData.email}
                onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                placeholder="client@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة المرور</label>
              <input
                type="text" value={formData.password}
                onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                placeholder="أدخل كلمة المرور"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
              <input
                type="text" value={formData.confirmPassword}
                onChange={(e) => setFormData(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="أعد كتابة كلمة المرور"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
              />
            </div>
            {error && <ErrorBox text={error} />}
            {success && <SuccessBox text={success} />}
            <SaveButton onClick={handleCreate} loading={saving} label="حفظ" />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {modal === 'delete' && selectedClient && (
        <Modal onClose={() => setModal(null)} title="حذف العميل" danger>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-700 mb-1">هل أنت متأكد من حذف</p>
            <p className="text-lg font-bold text-gray-900 mb-4">{selectedClient.email}</p>
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-200 mb-4">
              ⚠️ هذا الإجراء نهائي. سيُحذف حساب العميل بالكامل.
            </p>
            {error && <ErrorBox text={error} />}
            {success && <SuccessBox text={success} />}
            <div className="flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm">
                إلغاء
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Password Modal */}
      {modal === 'password' && selectedClient && (
        <Modal onClose={() => setModal(null)} title="تغيير كلمة المرور">
          <div className="space-y-4">
            <div className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-200 text-sm text-blue-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>تغيير كلمة المرور لـ <strong>{selectedClient.email}</strong></span>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة المرور الجديدة</label>
              <input
                type="text" value={formData.password}
                onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                placeholder="أدخل كلمة المرور الجديدة"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
              <input
                type="text" value={formData.confirmPassword}
                onChange={(e) => setFormData(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="أعد كتابة كلمة المرور"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
              />
            </div>
            {error && <ErrorBox text={error} />}
            {success && <SuccessBox text={success} />}
            <SaveButton onClick={handleUpdatePassword} loading={saving} label="حفظ التغيير" />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Helper Components ─── */

function Modal({ children, onClose, title, danger }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-lg font-bold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorBox({ text }) {
  return (
    <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200">
      {text}
    </div>
  );
}

function SuccessBox({ text }) {
  return (
    <div className="text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-xl border border-green-200 flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4" />
      {text}
    </div>
  );
}

function SaveButton({ onClick, loading, label }) {
  return (
    <button
      onClick={onClick} disabled={loading}
      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'جاري الحفظ...' : label}
    </button>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

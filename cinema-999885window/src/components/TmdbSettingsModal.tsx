import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, RefreshCw, Database, Sparkles, ShieldCheck, ExternalLink, Code } from 'lucide-react';
import { TmdbService } from '../services/tmdb';

interface TmdbSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
  onKeySaved?: () => void;
}

export const TmdbSettingsModal: React.FC<TmdbSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
  onKeySaved
}) => {
  const [customKey, setCustomKey] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [summary, setSummary] = useState(TmdbService.getActiveKeySummary());

  useEffect(() => {
    if (isOpen) {
      setCustomKey(TmdbService.getCustomApiKey());
      setSummary(TmdbService.getActiveKeySummary());
      setStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setStatus('testing');
    setStatusMessage('جاري اختبار الاتصال بقاعدة بيانات TMDb المفتوحة...');

    try {
      const keyToTest = customKey.trim() || '1cf50e6248dc270629e802686245c2c8';
      const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${keyToTest}`);
      
      if (res.ok) {
        TmdbService.setCustomApiKey(customKey.trim());
        setSummary(TmdbService.getActiveKeySummary());
        setStatus('success');
        setStatusMessage(customKey.trim() ? 'تم حفظ وتفعيل مفتاح TMDb الخاص بك بنجاح!' : 'تم تفعيل حزمة مفاتيح TMDb المفتوحة التلقائية بنجاح!');
        onKeyUpdated?.();
        onKeySaved?.();
      } else {
        setStatus('error');
        setStatusMessage('فشل الاتصال: تأكد من صحة مفتاح TMDb API المدخل.');
      }
    } catch (e: any) {
      setStatus('error');
      setStatusMessage('حدث خطأ في الاتصال بشبكة TMDb: ' + (e.message || 'خطأ غير معروف'));
    }
  };

  const handleResetToDefault = () => {
    TmdbService.setCustomApiKey('');
    setCustomKey('');
    setSummary(TmdbService.getActiveKeySummary());
    setStatus('success');
    setStatusMessage('تمت العودة بنجاح إلى حزمة مفاتيح TMDb المفتوحة المشتركة (7 مفاتيح نشطة).');
    onKeyUpdated?.();
    onKeySaved?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0d1322] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 space-y-6 text-right font-['Cairo']">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>محرك TMDb المفتوح</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  v3 Open Engine
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                إدارة الوصول المفتوح لجميع بيانات الأفلام، المسلسلات، والأنمي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Status Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#141b2e] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>حالة الاتصال</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>مفتوح ومباشر 100%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141b2e] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>حزمة المفاتيح</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {summary.isCustom ? 'مفتاح مخصص' : `${summary.totalKeys} مفاتيح تدويرية`}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141b2e] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>البيانات المغطاة</span>
            </div>
            <div className="text-sm font-bold text-sky-400 font-mono">
              +1,000,000 عمل
            </div>
          </div>
        </div>

        {/* Custom API Key Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>مفتاح TMDb API مخصص (اختياري):</span>
            </label>
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
            >
              <span>الحصول على مفتاح مجاني</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="ضع مفتاحك الشخصي هنا (أو اتركه فارغاً لاستخدام المفاتيح المفتوحة المدمجة)..."
              dir="ltr"
              className="w-full px-4 py-3 bg-[#131b2e] border border-white/10 focus:border-amber-400 rounded-2xl text-sm text-white placeholder-gray-500 outline-none font-mono transition-all"
            />
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            💡 التطبيق يحتوي بالفعل على مصفوفة مفاتيح مفتوحة المصدر نشطة تدعم جلب كافة بيانات الأفلام، المسلسلات، الأنمي، طاقم التمثيل، وتريلرات اليوتيوب بدقة عالية. يمكنك إضافة مفتاحك الخاص في أي وقت.
          </p>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold ${
              status === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : status === 'error'
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                : 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
            }`}
          >
            {status === 'testing' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-sky-400 flex-shrink-0" />
            ) : status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span className="flex-1">{statusMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {summary.isCustom && (
            <button
              onClick={handleResetToDefault}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all border border-white/10"
            >
              استعادة المفاتيح المفتوحة المدمجة
            </button>
          )}
          
          <div className="flex items-center gap-2 w-full sm:w-auto sm:mr-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
            >
              إغلاق
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={status === 'testing'}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'testing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الفحص...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>حفظ واختبار الاتصال</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Film, ShieldCheck, Zap, Globe, Sparkles, Scale, FileText } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="border-t border-white/10 bg-[#070a14] py-10 px-4 sm:px-6 lg:px-8 text-white mt-16 text-right font-['Cairo']">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                <Film className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-white">نافذة السينما VIP</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              المنصة الأحدث لمشاهدة أحدث الأفلام والمسلسلات والأنمي بدقة 4K فائقة الوضوح مع دعم 36 سيرفر بث مباشر فائق السرعة.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-amber-400">مميزات السيرفرات</h4>
            <ul className="text-xs text-gray-400 space-y-2">
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>36 سيرفر بث مباشر عالي الجودة</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>دعم الترجمة والدبلجة العربية الكاملة</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>دقة 4K UHD و 1080p FHD بدون تقطيع</span>
              </li>
            </ul>
          </div>

          {/* Legal & Pages */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-amber-400">الصفحات القانونية والروابط</h4>
            <ul className="text-xs text-gray-400 space-y-2.5">
              <li>
                <a
                  href="/dmca"
                  onClick={(e) => handleLinkClick(e, '/dmca')}
                  className="hover:text-purple-300 transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <Scale className="w-3.5 h-3.5 text-purple-400" />
                  <span>DMCA Notice &amp; Disclaimer</span>
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleLinkClick(e, '/terms')}
                  className="hover:text-purple-300 transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Terms of Use (اتفاقية الاستخدام)</span>
                </a>
              </li>
              <li>
                <a
                  href="/"
                  onClick={(e) => handleLinkClick(e, '/')}
                  className="hover:text-purple-300 transition-colors inline-block"
                >
                  الرئيسية
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-amber-400">إخلاء المسؤولية</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              نافذة السينما هو محرك بحث ومجمع لتضمينات الفيديو من سيرفرات خارجية مفتوحة المصدر ولا يقوم بتخزين أو استضافة أي ملفات فيديو على خوادمه الخاصة.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} نافذة السينما VIP. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="/dmca" onClick={(e) => handleLinkClick(e, '/dmca')} className="hover:text-gray-300">
              DMCA
            </a>
            <span>•</span>
            <a href="/terms" onClick={(e) => handleLinkClick(e, '/terms')} className="hover:text-gray-300">
              Terms of Use
            </a>
            <span>•</span>
            <span>36 سيرفر متصل</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


import React, { useEffect } from 'react';
import { FileCheck, Mail, ArrowRight, CheckCircle2, AlertOctagon } from 'lucide-react';

interface TermsPageProps {
  onNavigateHome: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigateHome }) => {
  useEffect(() => {
    // Set Document Title and SEO Meta Tags
    document.title = 'Terms of Use | نافذة السينما VIP';

    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', name);
        } else {
          el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', 'Terms of Use and website usage policies for نافذة السينما VIP.');
    setMeta('robots', 'index, follow');
    setMeta('og:title', 'Terms of Use | نافذة السينما VIP', true);
    setMeta('og:description', 'Terms of Use and website usage policies for نافذة السينما VIP.', true);
    setMeta('og:url', `${window.location.origin}/terms`, true);
    setMeta('og:type', 'website', true);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `${window.location.origin}/terms`);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 text-left font-sans" dir="ltr">
      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between" dir="rtl">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white border border-white/10 text-sm font-semibold transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>العودة للرئيسية</span>
        </button>
        <span className="text-xs text-gray-400 font-['Cairo']">شروط الخدمة والاتفاقية</span>
      </div>

      {/* Main Card */}
      <article className="bg-[#0b1022]/90 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8 text-gray-200 text-sm sm:text-base leading-relaxed">
        {/* Header */}
        <header className="border-b border-white/10 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <FileCheck className="w-3.5 h-3.5" />
            Terms Agreement
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Last Updated: August 2026
          </p>
        </header>

        {/* Section 1: Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Acceptance of Terms
          </h2>
          <p className="text-gray-300">
            By accessing and using this website, you agree to comply with these Terms of Use.
          </p>
          <p className="text-gray-300">
            If you do not agree with these terms, please discontinue use of the website.
          </p>
        </section>

        {/* Section 2: Website Purpose */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Website Purpose
          </h2>
          <p className="text-gray-300">
            This website provides information, search functionality, metadata, links, and references related to movies, television shows, anime, seasons, and episodes.
          </p>
          <p className="text-gray-300">
            The website is intended to help users discover and navigate publicly available information and third-party sources.
          </p>
        </section>

        {/* Section 3: Third-Party Services */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Third-Party Services
          </h2>
          <p className="text-gray-300">
            The website may display links, embedded players, media references, images, or other content provided by third-party services.
          </p>
          <p className="text-gray-300">
            We do not control third-party websites or services and are not responsible for their:
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-sm font-medium">
            <li className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Content</span>
            </li>
            <li className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Availability</span>
            </li>
            <li className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Accuracy</span>
            </li>
            <li className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Policies</span>
            </li>
            <li className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Terms</span>
            </li>
            <li className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Privacy practices</span>
            </li>
            <li className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 col-span-2 sm:col-span-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Legality</span>
            </li>
          </ul>
          <p className="text-gray-400 text-xs pt-1">
            Users should review the terms and policies of any third-party service they access.
          </p>
        </section>

        {/* Section 4: Content and Copyright */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Content and Copyright
          </h2>
          <p className="text-gray-300">
            Movie titles, television titles, anime titles, images, posters, logos, trademarks, descriptions, and other intellectual property may belong to their respective owners.
          </p>
          <p className="text-gray-300">
            We do not claim ownership of third-party intellectual property unless explicitly stated.
          </p>
          <p className="text-gray-300">
            Users must respect all applicable copyright, trademark, and intellectual-property laws.
          </p>
        </section>

        {/* Section 5: External Links */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            External Links
          </h2>
          <p className="text-gray-300">
            The website may contain links to websites operated by third parties.
          </p>
          <p className="text-gray-300">
            Following an external link means that you are leaving our website and accessing a third-party service.
          </p>
          <p className="text-gray-300">
            We are not responsible for the content, security, availability, or practices of external websites.
          </p>
        </section>

        {/* Section 6: User Responsibility */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            User Responsibility
          </h2>
          <p className="text-gray-300">
            You are responsible for your use of the website and for complying with all applicable laws and regulations.
          </p>
          <p className="text-gray-300">
            You must not use the website for unlawful purposes or attempt to interfere with the operation or security of the website.
          </p>
        </section>

        {/* Section 7: Prohibited Activities */}
        <section className="space-y-3 bg-[#130f24]/50 border border-red-500/20 rounded-xl p-5">
          <h2 className="text-lg font-bold text-rose-300 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            Prohibited Activities
          </h2>
          <p className="text-gray-300 text-sm">Users must not:</p>
          <ul className="space-y-2 pl-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Attempt to compromise or disrupt the website.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Attempt unauthorized access to systems or accounts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Abuse automated systems or APIs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Attempt to bypass technical restrictions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Use the website for unlawful activity.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Attempt to damage or interfere with third-party services.</span>
            </li>
          </ul>
        </section>

        {/* Section 8: Availability */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Availability
          </h2>
          <p className="text-gray-300">
            We do not guarantee that the website or any particular content, link, player, or third-party service will always be available.
          </p>
          <p className="text-gray-300">
            Content and services may change, become unavailable, or be removed without notice.
          </p>
        </section>

        {/* Section 9: Accuracy of Information */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Accuracy of Information
          </h2>
          <p className="text-gray-300">
            We attempt to provide accurate information, but we do not guarantee that all information displayed on the website is complete, accurate, or current.
          </p>
          <p className="text-gray-300">
            Information obtained from third-party services may change without notice.
          </p>
        </section>

        {/* Section 10: Disclaimer of Warranties */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Disclaimer of Warranties
          </h2>
          <p className="text-gray-300">
            The website is provided on an "as available" basis.
          </p>
          <p className="text-gray-300">
            To the extent permitted by applicable law, we make no warranties regarding the availability, accuracy, reliability, or suitability of the website or third-party services referenced through it.
          </p>
        </section>

        {/* Section 11: Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Limitation of Liability
          </h2>
          <p className="text-gray-300">
            To the maximum extent permitted by applicable law, we are not responsible for losses or damages resulting from the use of the website, inability to access the website, or reliance on third-party content or services.
          </p>
        </section>

        {/* Section 12: Changes to These Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Changes to These Terms
          </h2>
          <p className="text-gray-300">
            We may update these Terms of Use from time to time.
          </p>
          <p className="text-gray-300">
            When changes are made, the "Last Updated" date will be updated accordingly.
          </p>
          <p className="text-gray-300">
            Continued use of the website after changes are published constitutes acceptance of the updated terms to the extent permitted by applicable law.
          </p>
        </section>

        {/* Section 13: Contact */}
        <footer className="border-t border-white/10 pt-6 space-y-2">
          <h3 className="text-base font-bold text-white">Contact</h3>
          <p className="text-gray-300 text-sm">
            For questions regarding these Terms of Use:{' '}
            <a href="mailto:qredwson@gmail.com" className="text-purple-400 hover:text-purple-300 underline font-semibold">
              qredwson@gmail.com
            </a>
          </p>
        </footer>
      </article>
    </div>
  );
};

import React, { useEffect } from 'react';
import { ShieldAlert, Mail, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

interface DmcaPageProps {
  onNavigateHome: () => void;
}

export const DmcaPage: React.FC<DmcaPageProps> = ({ onNavigateHome }) => {
  useEffect(() => {
    // Set Document Title and SEO Meta Tags
    document.title = 'DMCA Notice & Disclaimer | نافذة السينما VIP';

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

    setMeta('description', 'DMCA copyright notice and disclaimer for نافذة السينما VIP. Contact us for valid copyright-related complaints and takedown requests.');
    setMeta('robots', 'index, follow');
    setMeta('og:title', 'DMCA Notice & Disclaimer | نافذة السينما VIP', true);
    setMeta('og:description', 'DMCA copyright notice and disclaimer for نافذة السينما VIP. Contact us for valid copyright-related complaints and takedown requests.', true);
    setMeta('og:url', `${window.location.origin}/dmca`, true);
    setMeta('og:type', 'website', true);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `${window.location.origin}/dmca`);

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
        <span className="text-xs text-gray-400 font-['Cairo']">صفحة قانونية رسمية</span>
      </div>

      {/* Main Card */}
      <article className="bg-[#0b1022]/90 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8 text-gray-200 text-sm sm:text-base leading-relaxed">
        {/* Header */}
        <header className="border-b border-white/10 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Legal Notice
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DMCA Notice &amp; Disclaimer
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Last Updated: August 2026
          </p>
        </header>

        {/* Section 1: Please Be Informed */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Please Be Informed
          </h2>
          <p className="text-gray-300">
            This website does not intentionally host or upload copyrighted video files on its own servers. Video players, embeds, and links displayed on the website may reference content hosted or served by third-party websites.
          </p>
          <p className="text-gray-300">
            We do not claim ownership of third-party videos, streams, images, trademarks, or other copyrighted materials displayed through external services.
          </p>
        </section>

        {/* Section 2: Our Mission */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Our Mission
          </h2>
          <p className="text-gray-300">
            Our website is designed to organize and provide information about movies, television shows, and anime and to help users discover available content and related sources.
          </p>
          <p className="text-gray-300">
            Where third-party content or video players are referenced, the relevant media may be provided by external services and is subject to those services' own policies and terms.
          </p>
        </section>

        {/* Section 3: Copyright Concerns */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Copyright Concerns
          </h2>
          <p className="text-gray-300">
            If you are a copyright owner or an authorized representative and believe that content accessible through our website infringes your copyright, please contact us using the information below.
          </p>
          <p className="text-gray-300 font-medium">Please include:</p>
          <ul className="space-y-2 pl-2">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
              <span>Your full name and contact information.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
              <span>Identification of the copyrighted work.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
              <span>The specific URL on our website associated with the allegedly infringing material.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
              <span>A description of the material you believe infringes your rights.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
              <span>A statement confirming that you are the copyright owner or authorized to act on their behalf.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
              <span>A statement that the information in your notice is accurate and that you have a good-faith belief that the use is unauthorized.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
              <span>Your electronic or physical signature.</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Third-Party Content */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Third-Party Content
          </h2>
          <p className="text-gray-300">
            Some pages may contain links, embedded players, or references to third-party websites. We do not control those external websites or their content.
          </p>
          <p className="text-gray-300">
            If the allegedly infringing material is hosted directly by a third-party provider, contacting that provider may also be necessary to request removal from its servers.
          </p>
        </section>

        {/* Section 5: Images and Trademarks */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Images and Trademarks
          </h2>
          <p className="text-gray-300">
            Images, posters, logos, names, and trademarks displayed on the website may belong to their respective copyright and trademark owners.
          </p>
          <p className="text-gray-300">
            We do not claim ownership of third-party intellectual property.
          </p>
        </section>

        {/* Section 6: DMCA Complaints & Contact */}
        <section className="space-y-4 bg-[#121933]/70 border border-purple-500/20 rounded-xl p-5 sm:p-6">
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            DMCA Complaints &amp; Takedown Requests
          </h2>
          <p className="text-gray-300">
            We review valid copyright complaints and take appropriate action where applicable.
          </p>
          <div className="p-3 bg-black/40 rounded-lg border border-white/10 font-mono text-sm text-purple-300 flex items-center justify-between flex-wrap gap-2">
            <span>Contact Email: <strong className="text-white">qredwson@gmail.com</strong></span>
            <span className="text-xs text-amber-400/80">Subject: "DMCA Notice"</span>
          </div>
          <p className="text-xs text-gray-400">
            We aim to review valid and sufficiently detailed notices promptly.
          </p>
        </section>

        {/* Section 7: Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Disclaimer
          </h2>
          <p className="text-gray-300">
            The availability of a link, embed, or reference to third-party content does not constitute an endorsement, sponsorship, or affiliation with the owner or operator of that third-party service unless expressly stated.
          </p>
          <p className="text-gray-300">
            We are not responsible for the content, availability, legality, accuracy, or policies of external websites.
          </p>
        </section>

        {/* Section 8: No Ownership Claim */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            No Ownership Claim
          </h2>
          <p className="text-gray-300">
            All copyrights, trademarks, logos, images, videos, and other intellectual property remain the property of their respective owners.
          </p>
          <p className="text-gray-300">
            Nothing on this website is intended to transfer ownership of third-party intellectual property.
          </p>
        </section>

        {/* Section 9: Contact */}
        <footer className="border-t border-white/10 pt-6 space-y-2">
          <h3 className="text-base font-bold text-white">Contact</h3>
          <p className="text-gray-300 text-sm">
            For copyright notices and related concerns:{' '}
            <a href="mailto:qredwson@gmail.com" className="text-purple-400 hover:text-purple-300 underline font-semibold">
              qredwson@gmail.com
            </a>
          </p>
        </footer>
      </article>
    </div>
  );
};

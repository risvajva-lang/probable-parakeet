import React from 'react';
import { Flame, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

interface TopTrendingBannerProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const TopTrendingBanner: React.FC<TopTrendingBannerProps> = ({
  onRefresh,
  isLoading
}) => {
  return (
    <div
      id="section-top-trending-banner"
      className="w-full rounded-3xl bg-gradient-to-r from-[#10162a] via-[#141b34] to-[#10162a] border border-purple-500/20 p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all"
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        {/* Right side: Flame Icon + Titles */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-orange-500/40 flex items-center justify-center shadow-lg shadow-orange-500/10 flex-shrink-0">
            <Flame className="w-6 h-6 text-orange-400 fill-orange-500/80 animate-pulse" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black text-white font-['Cairo'] tracking-tight">
              الأكثر مشاهدة اليوم
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-['Cairo'] mt-0.5">
              أعلى 5 أعمال مشاهدة وإقبالاً في المنصة
            </p>
          </div>
        </div>

        {/* Left side: Badges & Live Refresh */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold font-['Cairo'] border border-amber-500/30">
            Top 5 الأكثر مشاهدة
          </span>

          {onRefresh && (
            <button
              id="btn-refresh-trending"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1a233d] hover:bg-[#232f50] text-purple-300 text-xs font-bold font-['Cairo'] border border-purple-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <TrendingUp className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث حي</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

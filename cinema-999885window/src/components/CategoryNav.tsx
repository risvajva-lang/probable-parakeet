import React from 'react';
import { Film, Tv, Sparkles, Flame, Heart, Clock, LayoutGrid, Zap, Palette, Smile } from 'lucide-react';
import { CategoryFilter } from '../types';

interface CategoryNavProps {
  currentCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  favoritesCount: number;
  historyCount: number;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  currentCategory,
  onSelectCategory,
  favoritesCount,
  historyCount
}) => {
  const categories: { id: CategoryFilter; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'all', label: 'جميع العروض والكتالوج 🎬✨', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'trending', label: 'وصل حديثاً ⚡', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'movie', label: 'الأفلام السينمائية', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'tv', label: 'المسلسلات', icon: <Tv className="w-3.5 h-3.5" /> },
    { id: 'anime', label: 'الأنمي الياباني 🎌', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'cartoon', label: 'أفلام ومسلسلات الكرتون 🎨', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'favorites', label: 'المفضلة', icon: <Heart className="w-3.5 h-3.5" />, count: favoritesCount },
    { id: 'history', label: 'سجل المشاهدة', icon: <Clock className="w-3.5 h-3.5" />, count: historyCount }
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Category Section Header Banner (Screenshot 4) */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-[#0d1326] via-[#121933] to-[#0d1326] border border-purple-500/20 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-white font-['Cairo']">
              مكتبة العروض الشاملة
            </h2>
            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 font-['Cairo'] mt-0.5">
            تصفح كل الأفلام والمسلسلات والأنمي الياباني وأفلام الكرتون بجودة Full HD
          </p>
        </div>

        <span className="px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-black font-['Cairo'] border border-amber-500/30">
          Top Cinema VIP
        </span>
      </div>

      {/* Categories Buttons Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`tab-category-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-['Cairo'] whitespace-nowrap transition-all flex-shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/25 font-black scale-105'
                  : 'bg-[#10162a]/90 hover:bg-[#18213d] text-gray-300 border-white/10 hover:border-purple-500/30'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              {cat.count !== undefined && cat.count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                    isActive ? 'bg-black text-amber-400' : 'bg-purple-600 text-white'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { Tv, Film, Heart, Clock } from 'lucide-react';
import { CategoryFilter } from '../types';

interface BottomNavBarProps {
  currentCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  favoritesCount: number;
  historyCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentCategory,
  onSelectCategory,
  favoritesCount,
  historyCount
}) => {
  const navItems = [
    {
      id: 'all' as CategoryFilter,
      label: 'الرئيسية',
      icon: Tv
    },
    {
      id: 'movie' as CategoryFilter,
      label: 'الكتالوج',
      icon: Film
    },
    {
      id: 'favorites' as CategoryFilter,
      label: 'المفضلة',
      icon: Heart,
      count: favoritesCount
    },
    {
      id: 'history' as CategoryFilter,
      label: 'سجل المشاهدة',
      icon: Clock,
      count: historyCount
    }
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d1a]/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 sm:hidden transition-all shadow-[0_-10px_25px_rgba(0,0,0,0.5)]"
      dir="rtl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === 'all'
              ? currentCategory === 'all' || currentCategory === 'trending'
              : item.id === 'movie'
              ? currentCategory === 'movie' || currentCategory === 'tv' || currentCategory === 'anime'
              : currentCategory === item.id;

          return (
            <button
              key={item.id}
              id={`nav-bottom-${item.id}`}
              onClick={() => onSelectCategory(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-600/40 font-bold scale-105 border border-purple-400/40 min-w-[76px]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-['Cairo'] mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

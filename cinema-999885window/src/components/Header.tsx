import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Clapperboard,
  Tv,
  Film,
  Flame,
  Heart,
  Clock,
  Sparkles,
  Database,
  Globe,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { CategoryFilter } from '../types';

interface HeaderProps {
  currentCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoritesCount: number;
  historyCount: number;
  onOpenTmdbSettings?: () => void;
  onOpenLanguageModal?: () => void;
  currentLanguage?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  favoritesCount,
  historyCount,
  onOpenTmdbSettings,
  onOpenLanguageModal,
  currentLanguage = 'ar'
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const navItems = [
    { id: 'all' as CategoryFilter, label: 'الرئيسية', icon: Tv },
    { id: 'movie' as CategoryFilter, label: 'الكتالوج والأفلام', icon: Film },
    { id: 'tv' as CategoryFilter, label: 'المسلسلات', icon: Tv },
    { id: 'anime' as CategoryFilter, label: 'الأنمي', icon: Sparkles },
    { id: 'trending' as CategoryFilter, label: 'الأكثر مشاهدة', icon: Flame },
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
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#060913]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo with Neon Clapperboard Frame as in Screenshot 1 & 2 */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            onClick={() => onSelectCategory('all')}
          >
            <div className="relative p-2 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 p-[2px] shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-all">
              <div className="bg-[#0b1020] p-1.5 rounded-[14px] flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black font-['Cairo'] tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
                نافذة السينما
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#0e1424] p-1.5 rounded-2xl border border-white/10">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentCategory === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onSelectCategory(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-['Cairo'] transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Search Bar, Language Pill, TMDb Key Engine */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-md">
            {/* Live Search Input */}
            <div className="relative flex-1 max-w-xs hidden sm:block">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث عن فيلم، مسلسل..."
                className="w-full bg-[#12182b] text-xs text-white placeholder-gray-400 rounded-2xl py-2.5 pr-9 pl-8 border border-white/10 focus:border-purple-500 focus:outline-none transition-all font-['Cairo']"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  onClick={() => onSearchChange('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Button */}
            <button
              id="btn-mobile-search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden p-2 rounded-xl bg-[#12182b] text-gray-300 border border-white/10 hover:text-white"
              aria-label="بحث"
            >
              <Search className="w-4 h-4 text-purple-400" />
            </button>

            {/* Language Selector Pill (as in Screenshot 2: 🌐 🇸🇦 AR) */}
            <button
              id="btn-language-selector"
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12182b] hover:bg-[#1a233d] text-white border border-purple-500/30 text-xs font-mono font-bold transition-all shadow-sm"
              title="تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-sm">🇸🇦</span>
              <span className="text-[11px] uppercase tracking-wider">{currentLanguage === 'ar' ? 'AR' : currentLanguage}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="sm:hidden pb-3 pt-1 animate-in fade-in slide-in-from-top-1">
            <div className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث عن فيلم، مسلسل، أو أنمي..."
                className="w-full bg-[#12182b] text-sm text-white placeholder-gray-400 rounded-xl py-2 pr-9 pl-9 border border-purple-500/40 focus:outline-none font-['Cairo']"
              />
              <Search className="w-4 h-4 text-purple-400 absolute right-3 pointer-events-none" />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  onSearchChange('');
                }}
                className="absolute left-3 p-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

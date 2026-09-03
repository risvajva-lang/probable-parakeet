import React, { useState } from 'react';
import { Filter, SlidersHorizontal, Star, Calendar, Globe, ArrowUpDown, Sparkles, X, Database } from 'lucide-react';
import { DiscoverFilterParams } from '../types';
import { ALL_GENRES_LIST, LANGUAGES_LIST } from '../services/tmdb';

interface AdvancedFilterBarProps {
  filters: DiscoverFilterParams;
  onFilterChange: (newFilters: DiscoverFilterParams) => void;
  onOpenTmdbSettings: () => void;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  filters,
  onFilterChange,
  onOpenTmdbSettings
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const yearsList = [
    { label: 'جميع السنوات', value: '' },
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
    { label: '2020', value: '2020' },
    { label: '2019', value: '2019' },
    { label: '2018', value: '2018' },
    { label: '2015', value: '2015' },
    { label: '2010', value: '2010' },
    { label: '2000', value: '2000' }
  ];

  const sortOptions = [
    { label: 'الأكثر شعبية', value: 'popularity.desc' as const },
    { label: 'الأعلى تقييماً', value: 'vote_average.desc' as const },
    { label: 'الأحدث صدوراً', value: 'primary_release_date.desc' as const },
    { label: 'الأكثر إيرادات', value: 'revenue.desc' as const },
    { label: 'الأكثر تصويتاً', value: 'vote_count.desc' as const }
  ];

  const ratingOptions = [
    { label: 'كل التقييمات', value: 0 },
    { label: '8.0+ ⭐ ممتاز', value: 8 },
    { label: '7.0+ ⭐ جيد جداً', value: 7 },
    { label: '6.0+ ⭐ جيد', value: 6 }
  ];

  const activeFiltersCount =
    (filters.genreId && filters.genreId > 0 ? 1 : 0) +
    (filters.year ? 1 : 0) +
    (filters.language ? 1 : 0) +
    (filters.minRating && filters.minRating > 0 ? 1 : 0) +
    (filters.sortBy && filters.sortBy !== 'popularity.desc' ? 1 : 0);

  const handleResetFilters = () => {
    onFilterChange({
      type: filters.type,
      genreId: 0,
      year: '',
      language: '',
      minRating: 0,
      sortBy: 'popularity.desc',
      page: 1
    });
  };

  return (
    <div className="space-y-3 font-['Cairo']">
      {/* Top Filter Trigger & Quick Genre Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Quick Horizontal Genre Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border flex-shrink-0 ${
              isOpen || activeFiltersCount > 0
                ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#121829] text-gray-300 hover:bg-[#182138] border-white/10'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فلترة متقدمة</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-amber-400 text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {ALL_GENRES_LIST.slice(0, 10).map((g) => {
            const isSelected = (filters.genreId || 0) === g.id;
            return (
              <button
                key={g.id}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    genreId: isSelected ? 0 : g.id,
                    page: 1
                  });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 font-black shadow-sm'
                    : 'bg-[#101626]/80 text-gray-300 hover:bg-[#161f36] border-white/10 hover:border-white/20'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        {/* TMDb Status Indicator / Settings Modal Trigger */}
        <button
          onClick={onOpenTmdbSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex-shrink-0"
          title="إعدادات محرك TMDb المفتوح"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">TMDb Open API</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Expanded Filter Panel */}
      {isOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1424] border border-amber-500/30 shadow-xl shadow-black/60 space-y-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black text-white">خيارات البحث المتقدم في TMDb</span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold"
              >
                <X className="w-3 h-3" />
                <span>إعادة تعيين الفلاتر ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Genre Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>التصنيف والنوع:</span>
              </label>
              <select
                value={filters.genreId || 0}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    genreId: parseInt(e.target.value, 10),
                    page: 1
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#141b2e] border border-white/15 text-xs text-white outline-none focus:border-amber-400 transition-all font-bold"
              >
                {ALL_GENRES_LIST.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language / Origin Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-sky-400" />
                <span>اللغة وبلد الإنتاج:</span>
              </label>
              <select
                value={filters.language || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    language: e.target.value,
                    page: 1
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#141b2e] border border-white/15 text-xs text-white outline-none focus:border-amber-400 transition-all font-bold"
              >
                {LANGUAGES_LIST.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Year Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>سنة الإصدار:</span>
              </label>
              <select
                value={filters.year || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    year: e.target.value,
                    page: 1
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#141b2e] border border-white/15 text-xs text-white outline-none focus:border-amber-400 transition-all font-bold"
              >
                {yearsList.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                <span>ترتيب النتائج:</span>
              </label>
              <select
                value={filters.sortBy || 'popularity.desc'}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    sortBy: e.target.value as any,
                    page: 1
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#141b2e] border border-white/15 text-xs text-white outline-none focus:border-amber-400 transition-all font-bold"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span>الحد الأدنى للتقييم:</span>
            </span>
            {ratingOptions.map((r) => {
              const isSelected = (filters.minRating || 0) === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      minRating: r.value,
                      page: 1
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-400 text-black border-amber-300 font-black'
                      : 'bg-[#141b2e] text-gray-300 hover:bg-[#1c2640] border-white/10'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

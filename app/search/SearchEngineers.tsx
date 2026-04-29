'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import {
  SPECIALIZATIONS,
  SPECIALIZATION_STYLES,
  getAvatarClasses,
  mockEngineers,
} from '@/lib/mock-engineers';
import Navbar from '@/components/shared/Navbar';

const ITEMS_PER_PAGE = 6;

const SORT_OPTIONS = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'most_experienced', label: 'Most Experienced' },
  { value: 'newest', label: 'Newest' },
] as const;

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
] as const;

export default function SearchEngineers() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Mobile filter drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Read current filter state from URL
  const activeSpecs = searchParams.getAll('spec');
  const location = searchParams.get('location') || '';
  const experience = searchParams.get('exp') || '';
  const rateMin = searchParams.get('rateMin') || '';
  const rateMax = searchParams.get('rateMax') || '';
  const prcOnly = searchParams.get('prc') === '1';
  const sortBy = searchParams.get('sort') || 'relevant';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local form state (used for "Apply" flow)
  const [formSpecs, setFormSpecs] = useState<string[]>(activeSpecs);
  const [formLocation, setFormLocation] = useState(location);
  const [formExperience, setFormExperience] = useState(experience);
  const [formRateMin, setFormRateMin] = useState(rateMin);
  const [formRateMax, setFormRateMax] = useState(rateMax);
  const [formPrc, setFormPrc] = useState(prcOnly);
  
  // API State
  const [engineers, setEngineers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngineers = async () => {
       setLoading(true);
       try {
          // Normalize query strings to API
          const params = new URLSearchParams(searchParams.toString());
          // Our API uses specific key mappings (e.g. specialization vs spec)
          const specs = params.getAll('spec');
          if (specs.length > 0) {
             params.delete('spec');
             params.set('specialization', specs.join(','));
          }
          if (params.has('location')) {
             const loc = params.get('location');
             params.delete('location');
             // Simplistically pushing it to city to match API
             if (loc) params.set('city', loc);
          }
          if (params.has('exp')) {
             const exp = params.get('exp');
             params.delete('exp');
             if (exp) params.set('min_experience', exp);
          }
          if (params.has('rateMin')) {
             const mn = params.get('rateMin');
             params.delete('rateMin');
             if (mn) params.set('min_rate', mn);
          }
          if (params.has('rateMax')) {
             const mx = params.get('rateMax');
             params.delete('rateMax');
             if (mx) params.set('max_rate', mx);
          }
          if (params.has('prc')) {
             params.delete('prc');
             params.set('prc_verified', 'true');
          }
          const useFallback = () => {
            const mappedMocks = mockEngineers.map(m => ({
              id: m.id,
              full_name: `${m.firstName} ${m.lastName}`,
              headline: `${m.specialization} Engineer`,
              specializations: [m.specialization],
              prc_verified: m.prcVerified,
              city: m.city,
              province: m.province,
              years_experience: m.yearsExperience,
              average_rating: m.rating,
              total_reviews: m.reviewCount,
              hourly_rate: m.hourlyRate,
            }));
            
            let filteredMocks = mappedMocks;
            if (specs.length > 0) {
              filteredMocks = filteredMocks.filter(m => specs.some(s => m.specializations.includes(s)));
            }
            if (params.has('city')) {
              const locStr = params.get('city')?.toLowerCase() || '';
              filteredMocks = filteredMocks.filter(m => m.city.toLowerCase().includes(locStr) || m.province.toLowerCase().includes(locStr));
            }
            if (params.has('min_experience')) {
              const minExp = parseInt(params.get('min_experience') || '0', 10);
              filteredMocks = filteredMocks.filter(m => m.years_experience >= minExp);
            }
            if (params.has('prc_verified')) {
              filteredMocks = filteredMocks.filter(m => m.prc_verified);
            }
            
            const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
            const pagedMocks = filteredMocks.slice(startIdx, startIdx + ITEMS_PER_PAGE);

            setEngineers(pagedMocks);
            setTotalCount(filteredMocks.length);
            setTotalPages(Math.max(1, Math.ceil(filteredMocks.length / ITEMS_PER_PAGE)));
          };

          const res = await fetch(`/api/engineers/search?${params.toString()}`);
          if (!res.ok) {
            useFallback();
            return;
          }
          const data = await res.json();
          
          if (data.engineers && data.engineers.length > 0) {
            setEngineers(data.engineers);
            setTotalCount(data.total_count || 0);
            setTotalPages(data.total_pages || 1);
          } else {
            useFallback();
          }
       } catch(err) {
          // If fetch entirely throws
          // Re-declare useFallback since we are in the catch block where it might not be defined if it failed earlier,
          // Actually, useFallback is declared inside the try block. Let's just do it directly.
          const mappedMocks = mockEngineers.map(m => ({
            id: m.id,
            full_name: `${m.firstName} ${m.lastName}`,
            headline: `${m.specialization} Engineer`,
            specializations: [m.specialization],
            prc_verified: m.prcVerified,
            city: m.city,
            province: m.province,
            years_experience: m.yearsExperience,
            average_rating: m.rating,
            total_reviews: m.reviewCount,
            hourly_rate: m.hourlyRate,
          }));
          const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
          setEngineers(mappedMocks.slice(startIdx, startIdx + ITEMS_PER_PAGE));
          setTotalCount(mappedMocks.length);
          setTotalPages(Math.max(1, Math.ceil(mappedMocks.length / ITEMS_PER_PAGE)));
       } finally {
          setLoading(false);
       }
    };
    
    fetchEngineers();
  }, [searchParams]);

  // Sync local form when URL changes (e.g. back/forward navigation)
  const urlKey = searchParams.toString();

  // Build URL from params
  const buildUrl = useCallback(
    (overrides: Record<string, string | string[] | undefined> = {}) => {
      const params = new URLSearchParams();

      const specs =
        overrides.spec !== undefined
          ? (overrides.spec as string[])
          : formSpecs;
      specs.forEach((s) => params.append('spec', s));

      const loc =
        overrides.location !== undefined
          ? (overrides.location as string)
          : formLocation;
      if (loc) params.set('location', loc);

      const exp =
        overrides.exp !== undefined
          ? (overrides.exp as string)
          : formExperience;
      if (exp) params.set('exp', exp);

      const min =
        overrides.rateMin !== undefined
          ? (overrides.rateMin as string)
          : formRateMin;
      if (min) params.set('rateMin', min);

      const max =
        overrides.rateMax !== undefined
          ? (overrides.rateMax as string)
          : formRateMax;
      if (max) params.set('rateMax', max);

      const prc =
        overrides.prc !== undefined ? overrides.prc === '1' : formPrc;
      if (prc) params.set('prc', '1');

      const sort =
        overrides.sort !== undefined ? (overrides.sort as string) : sortBy;
      if (sort && sort !== 'relevant') params.set('sort', sort);

      const page =
        overrides.page !== undefined ? (overrides.page as string) : '1';
      if (page && page !== '1') params.set('page', page);

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [formSpecs, formLocation, formExperience, formRateMin, formRateMax, formPrc, sortBy, pathname]
  );

  // Apply filters
  const handleApplyFilters = () => {
    router.push(buildUrl({ page: '1' }));
    setDrawerOpen(false);
  };

  // Clear all filters
  const handleClearAll = () => {
    setFormSpecs([]);
    setFormLocation('');
    setFormExperience('');
    setFormRateMin('');
    setFormRateMax('');
    setFormPrc(false);
    router.push(pathname);
    setDrawerOpen(false);
  };

  // Sort change — applied immediately
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'relevant') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  // Toggle spec checkbox
  const toggleSpec = (spec: string) => {
    setFormSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.3;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(
          <Star key={i} size={16} fill="#EAB308" className="text-yellow-500" />
        );
      } else if (i === full && hasHalf) {
        stars.push(
          <span key={i} className="relative inline-block w-4 h-4">
            <Star
              size={16}
              className="text-slate-200 absolute top-0 left-0"
            />
            <span className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
              <Star size={16} fill="#EAB308" className="text-yellow-500" />
            </span>
          </span>
        );
      } else {
        stars.push(<Star key={i} size={16} className="text-slate-200" />);
      }
    }
    return stars;
  };

  // Sidebar filter content (reused in drawer + desktop)
  const filterContent = (
    <div className="space-y-6">
      {/* Specialization */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
          Specialization
        </h3>
        <div className="space-y-2.5">
          {SPECIALIZATIONS.map((spec) => (
            <label
              key={spec}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formSpecs.includes(spec)}
                  onChange={() => toggleSpec(spec)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Overlay checked icon */}
                {formSpecs.includes(spec) && (
                  <div className="absolute inset-0 w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">
                {spec}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
          Location
        </h3>
        <input
          type="text"
          placeholder="City or Province"
          value={formLocation}
          onChange={(e) => setFormLocation(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition bg-white"
        />
      </div>

      <hr className="border-slate-200" />

      {/* Years of Experience */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
          Experience
        </h3>
        <div className="relative">
          <select
            value={formExperience}
            onChange={(e) => setFormExperience(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition bg-white appearance-none pr-10 cursor-pointer"
          >
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Hourly Rate Range */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
          Hourly Rate (PHP)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={formRateMin}
            onChange={(e) => setFormRateMin(e.target.value)}
            min={0}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition bg-white"
          />
          <span className="text-slate-400 text-sm font-medium shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={formRateMax}
            onChange={(e) => setFormRateMax(e.target.value)}
            min={0}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition bg-white"
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* PRC Verified Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              PRC Verified Only
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Show only licensed engineers
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formPrc}
            onClick={() => setFormPrc(!formPrc)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 ${
              formPrc ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                formPrc ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Actions */}
      <div className="space-y-3 pt-1">
        <button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearAll}
          className="w-full text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer text-center"
        >
          Clear All
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar activePage="search" />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-blue-50 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-extrabold text-indigo-950 tracking-tight">
            Search Engineers
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Find the perfect civil engineer for your next project
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <SlidersHorizontal size={18} className="text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Filters
                  </h2>
                </div>
                {filterContent}
              </div>
            </aside>

            {/* Main Grid Area */}
            <main className="flex-1 min-w-0">
              {/* Top bar: Result count + sort + mobile filter button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                    {(activeSpecs.length > 0 || location || experience || rateMin || rateMax || prcOnly) && (
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        !
                      </span>
                    )}
                  </button>
                  <p className="text-sm text-slate-600 font-medium">
                    Showing{' '}
                    <span className="text-indigo-950 font-bold">
                      {totalCount}
                    </span>{' '}
                    engineer{totalCount !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition appearance-none pr-10 cursor-pointer shadow-sm"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Engineer Cards Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-52 animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 rounded-full bg-slate-100 shrink-0" />
                          <div className="flex-1 space-y-3">
                            <div className="h-5 w-40 bg-slate-100 rounded" />
                            <div className="h-4 w-24 bg-slate-100 rounded" />
                            <div className="h-4 w-32 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </div>
                   ))}
                </div>
              ) : engineers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {engineers.map((engineer) => (
                    <EngineerCard
                      key={engineer.id || engineer.user_id}
                      engineer={engineer}
                      renderStars={renderStars}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SlidersHorizontal size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    No engineers found
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer ${
                          page === safePage
                            ? 'bg-blue-600 text-white border border-blue-600'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Filters</h2>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6">{filterContent}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-indigo-950 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-900 rounded-lg shadow-sm border border-indigo-800">
              <span className="text-xl font-bold font-serif text-blue-500">
                BS
              </span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              BuildLink<span className="text-blue-500">PH</span>
            </span>
          </div>
          <p className="text-slate-300 font-medium mb-6">
            Find the Right Engineer. Build with Confidence.
          </p>
          <div className="border-t border-indigo-900 pt-6 text-sm flex flex-col md:flex-row justify-center gap-4">
            <p>
              &copy; {new Date().getFullYear()} BS CORP / BuildLinkPH. All
              rights reserved.
            </p>
            <div className="hidden md:block text-indigo-800">•</div>
            <div className="flex justify-center gap-4">
              <Link href="#" className="hover:text-blue-400 transition">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-blue-400 transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── Engineer Card Component ─────────── */

function EngineerCard({
  engineer,
  renderStars,
}: {
  engineer: any;
  renderStars: (rating: number) => React.ReactNode[];
}) {
  const nameParts = (engineer.full_name || 'Unknown Engineer').split(' ');
  const initials = nameParts.map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const avatarColors = getAvatarClasses('blue');

  const specs = engineer.specializations || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col group hover:border-blue-200">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-14 h-14 rounded-full ${avatarColors.bg} flex items-center justify-center ${avatarColors.text} text-lg font-bold ring-4 ring-slate-50 shrink-0 group-hover:scale-105 transition-transform`}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 truncate">
                {engineer.full_name}
              </h3>
              <p className="text-sm text-slate-500 font-medium truncate shrink-0 max-w-[200px]">{engineer.headline}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                 {specs.slice(0, 2).map((sp: string, idx: number) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 ${SPECIALIZATION_STYLES[sp]?.bg || 'bg-slate-50'} ${SPECIALIZATION_STYLES[sp]?.text || 'text-slate-700'} px-2 py-0.5 rounded-full text-[10px] font-bold`}
                    >
                      {sp}
                    </span>
                 ))}
                 {specs.length > 2 && <span className="text-[10px] text-slate-400 font-medium align-middle">+{specs.length - 2}</span>}
              </div>
            </div>
            {engineer.prc_verified && (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] uppercase font-bold shrink-0">
                <ShieldCheck size={13} />
                PRC
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {engineer.city}, {engineer.province}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {engineer.years_experience || 0} yrs exp.
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              {renderStars(engineer.average_rating || 0)}
            </div>
            <span className="text-sm font-bold text-slate-800">
              {(engineer.average_rating || 0).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({engineer.total_reviews || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <div>
          <span className="text-lg font-bold text-indigo-950">
            ₱{(engineer.hourly_rate || 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 ml-1">/hr</span>
        </div>
        <Link
          href={`/engineers/${engineer.user_id || engineer.id}`}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Briefcase,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SearchIcon,
  Bookmark,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  mockJobs,
  PROJECT_TYPES,
  DISCIPLINES,
  WORK_TYPES,
  PROVINCES,
  formatRelativeTime,
  formatCurrency,
  type Job
} from '@/lib/mock-jobs';
import Navbar from '@/components/shared/Navbar';
import { createClient } from '@/lib/supabase';

const ITEMS_PER_PAGE = 5;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest_budget', label: 'Highest Budget' },
  { value: 'relevant', label: 'Most Relevant' },
] as const;

export default function JobBoard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeSearch, setActiveSearch] = useState(searchParams.get('q') || '');

  // Read current filter state from URL
  const activeProjectTypes = searchParams.getAll('pt');
  const activeDisciplines = searchParams.getAll('disc');
  const activeWorkTypes = searchParams.getAll('wt');
  const province = searchParams.get('prov') || '';
  const city = searchParams.get('city') || '';
  const budgetMinStr = searchParams.get('bmin') || '';
  const budgetMaxStr = searchParams.get('bmax') || '';
  const datePosted = searchParams.get('date') || 'any'; // 'any', '24h', '7d', '30d'
  const prcRequired = searchParams.get('prc') === '1';
  const sortBy = searchParams.get('sort') || 'recent';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local form state for sidebar filters (used for "Apply" flow)
  const [formProjectTypes, setFormProjectTypes] = useState<string[]>(activeProjectTypes);
  const [formDisciplines, setFormDisciplines] = useState<string[]>(activeDisciplines);
  const [formWorkTypes, setFormWorkTypes] = useState<string[]>(activeWorkTypes);
  const [formProvince, setFormProvince] = useState(province);
  const [formCity, setFormCity] = useState(city);
  const [formBudgetMin, setFormBudgetMin] = useState(budgetMinStr);
  const [formBudgetMax, setFormBudgetMax] = useState(budgetMaxStr);
  const [formDate, setFormDate] = useState(datePosted);
  const [formPrc, setFormPrc] = useState(prcRequired);

  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Redirect client users — Browse Jobs is exclusive to engineers
  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return; // guests can still browse
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        const role = userData?.role || user.user_metadata?.role;
        if (role === 'client') {
          router.replace('/dashboard/client');
        }
      } catch {
        // fallback: check metadata
        const role = user.user_metadata?.role;
        if (role === 'client') {
          router.replace('/dashboard/client');
        }
      }
    });
  }, [router]);

  const toggleSaved = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buildUrl = useCallback(
    (overrides: Record<string, string | string[] | undefined> = {}) => {
      const params = new URLSearchParams();

      const q = overrides.q !== undefined ? (overrides.q as string) : activeSearch;
      if (q) params.set('q', q);

      const pt = overrides.pt !== undefined ? (overrides.pt as string[]) : formProjectTypes;
      pt.forEach((x) => params.append('pt', x));

      const disc = overrides.disc !== undefined ? (overrides.disc as string[]) : formDisciplines;
      disc.forEach((x) => params.append('disc', x));

      const wt = overrides.wt !== undefined ? (overrides.wt as string[]) : formWorkTypes;
      wt.forEach((x) => params.append('wt', x));

      const prov = overrides.prov !== undefined ? (overrides.prov as string) : formProvince;
      if (prov) params.set('prov', prov);

      const cty = overrides.city !== undefined ? (overrides.city as string) : formCity;
      if (cty) params.set('city', cty);

      const bmin = overrides.bmin !== undefined ? (overrides.bmin as string) : formBudgetMin;
      if (bmin) params.set('bmin', bmin);

      const bmax = overrides.bmax !== undefined ? (overrides.bmax as string) : formBudgetMax;
      if (bmax) params.set('bmax', bmax);

      const dateStr = overrides.date !== undefined ? (overrides.date as string) : formDate;
      if (dateStr && dateStr !== 'any') params.set('date', dateStr);

      const prc = overrides.prc !== undefined ? overrides.prc === '1' : formPrc;
      if (prc) params.set('prc', '1');

      const sort = overrides.sort !== undefined ? (overrides.sort as string) : sortBy;
      if (sort && sort !== 'recent') params.set('sort', sort);

      const page = overrides.page !== undefined ? (overrides.page as string) : '1';
      if (page && page !== '1') params.set('page', page);

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [activeSearch, formProjectTypes, formDisciplines, formWorkTypes, formProvince, formCity, formBudgetMin, formBudgetMax, formDate, formPrc, sortBy, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    router.push(buildUrl({ q: searchQuery, page: '1' }));
  };

  const handleApplyFilters = () => {
    router.push(buildUrl({ page: '1' }));
    setDrawerOpen(false);
  };

  const handleClearAll = () => {
    setFormProjectTypes([]);
    setFormDisciplines([]);
    setFormWorkTypes([]);
    setFormProvince('');
    setFormCity('');
    setFormBudgetMin('');
    setFormBudgetMax('');
    setFormDate('any');
    setFormPrc(false);
    setSearchQuery('');
    setActiveSearch('');
    router.push(pathname);
    setDrawerOpen(false);
  };

  const handleSortChange = (value: string) => {
    router.push(buildUrl({ sort: value, page: '1' }));
  };

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  const filteredJobs = useMemo(() => {
    let result = [...mockJobs];

    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      result = result.filter(j => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q) || j.clientName.toLowerCase().includes(q));
    }

    if (activeProjectTypes.length > 0) result = result.filter(j => activeProjectTypes.includes(j.projectType));
    if (activeDisciplines.length > 0) result = result.filter(j => activeDisciplines.includes(j.discipline));
    if (activeWorkTypes.length > 0) result = result.filter(j => activeWorkTypes.includes(j.workType));
    if (province) result = result.filter(j => j.province === province);
    if (city) {
      const q = city.toLowerCase();
      result = result.filter(j => j.city.toLowerCase().includes(q));
    }

    if (budgetMinStr) {
      const min = parseInt(budgetMinStr, 10);
      result = result.filter(j => j.openToProposals || (j.budgetMax && j.budgetMax >= min));
    }
    if (budgetMaxStr) {
      const max = parseInt(budgetMaxStr, 10);
      result = result.filter(j => j.openToProposals || (j.budgetMin && j.budgetMin <= max));
    }

    if (datePosted !== 'any') {
      const now = new Date().getTime();
      let limitDays = 0;
      if (datePosted === '24h') limitDays = 1;
      else if (datePosted === '7d') limitDays = 7;
      else if (datePosted === '30d') limitDays = 30;

      if (limitDays > 0) {
        const limitMs = limitDays * 24 * 60 * 60 * 1000;
        result = result.filter(j => (now - new Date(j.postedDate).getTime()) <= limitMs);
      }
    }

    if (prcRequired) result = result.filter(j => j.prcRequired);

    switch (sortBy) {
      case 'highest_budget':
        result.sort((a, b) => {
          const maxA = a.budgetMax || 0;
          const maxB = b.budgetMax || 0;
          return maxB - maxA;
        });
        break;
      case 'relevant':
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
    }

    return result;
  }, [activeSearch, activeProjectTypes, activeDisciplines, activeWorkTypes, province, city, budgetMinStr, budgetMaxStr, datePosted, prcRequired, sortBy]);


  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedJobs = filteredJobs.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    router.push(buildUrl({ page: String(page) }));
  };

  // Avoid hydration mismatch by waiting for mount
  if (!mounted) {
    return null;
  }

  const renderCheckboxGroup = (title: string, options: readonly string[], state: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-2.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={state.includes(opt)}
                onChange={() => toggleArrayItem(setter, opt)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const filterContent = (
    <div className="space-y-6">
      {renderCheckboxGroup('Project Type', PROJECT_TYPES, formProjectTypes, setFormProjectTypes)}
      <hr className="border-slate-200" />
      {renderCheckboxGroup('Discipline', DISCIPLINES, formDisciplines, setFormDisciplines)}
      <hr className="border-slate-200" />
      {renderCheckboxGroup('Work Type', WORK_TYPES, formWorkTypes, setFormWorkTypes)}
      <hr className="border-slate-200" />

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Location</h3>
        <div className="space-y-3">
          <div className="relative">
             <select
              value={formProvince}
              onChange={(e) => setFormProvince(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition bg-white appearance-none pr-10 cursor-pointer"
            >
              <option value="">Any Province</option>
              {PROVINCES.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <input
            type="text"
            placeholder="City"
            value={formCity}
            onChange={(e) => setFormCity(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition bg-white"
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Budget Range */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Budget Range (PHP)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={formBudgetMin}
            onChange={(e) => setFormBudgetMin(e.target.value)}
            min={0}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition bg-white"
          />
          <span className="text-slate-400 text-sm font-medium shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={formBudgetMax}
            onChange={(e) => setFormBudgetMax(e.target.value)}
            min={0}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition bg-white"
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Date Posted */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Date Posted</h3>
        <div className="space-y-2.5">
          {[
            { value: 'any', label: 'Any time' },
            { value: '24h', label: 'Last 24 hours' },
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
          ].map((opt) => (
             <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
               <div className="relative flex items-center justify-center">
                 <input
                   type="radio"
                   name="datePosted"
                   value={opt.value}
                   checked={formDate === opt.value}
                   onChange={() => setFormDate(opt.value)}
                   className="peer w-5 h-5 appearance-none border-2 border-slate-300 rounded-full checked:border-blue-600 transition-colors cursor-pointer"
                 />
                 <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
               </div>
               <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{opt.label}</span>
             </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* PRC Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">PRC Required Only</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter jobs requiring valid license</p>
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
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                formPrc ? 'translate-x-5' : 'translate-x-0'
              }`} />
          </button>
        </div>
      </div>

      <hr className="border-slate-200" />

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
      <Navbar activePage="jobs" />

      {/* Header & Search */}
      <div className="bg-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 text-center sm:text-left">
            Find Engineering Jobs
          </h1>
          <form onSubmit={handleSearch} className="max-w-3xl flex bg-white rounded-xl shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-blue-500/50">
             <div className="flex-1 flex items-center px-4">
               <SearchIcon className="text-slate-400" size={20} />
               <input
                 type="text"
                 placeholder="Search by job title, skills, or keywords..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full px-3 py-3 bg-transparent text-slate-800 focus:outline-none placeholder:text-slate-400"
               />
             </div>
             <button type="submit" className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
               Search
             </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <SlidersHorizontal size={18} className="text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Filters</h2>
                </div>
                {filterContent}
             </div>
          </aside>

          {/* Job Listings Area */}
          <main className="flex-1 min-w-0">
            {/* Top Bar for hits and sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
               <div className="flex items-center gap-3">
                 <button
                    onClick={() => setDrawerOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
                  >
                    <SlidersHorizontal size={16} /> Filters
                  </button>
                  <p className="text-sm text-slate-600 font-medium">
                    Showing <span className="text-indigo-950 font-bold">{filteredJobs.length}</span> jobs
                  </p>
               </div>
               <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition appearance-none pr-10 cursor-pointer shadow-sm"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Job Grid */}
            <div className="space-y-4">
              {paginatedJobs.length > 0 ? (
                 paginatedJobs.map((job) => (
                   <div key={job.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 sm:p-6 group flex flex-col hover:border-blue-200 relative overflow-hidden">
                      {job.prcRequired && (
                        <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg border-b border-l border-blue-100 flex items-center gap-1">
                          <ShieldCheck size={12} /> PRC Required
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <Link href={`/jobs/${job.id}`} className="text-lg sm:text-xl font-bold text-indigo-950 hover:text-blue-600 transition truncate pr-20">
                          {job.title}
                        </Link>
                        <button onClick={(e) => toggleSaved(job.id, e)} className="shrink-0 p-2 -mr-2 text-slate-400 hover:text-blue-600 transition rounded-full hover:bg-blue-50 z-10">
                          <Bookmark size={20} fill={savedJobs.has(job.id) ? "currentColor" : "none"} className={savedJobs.has(job.id) ? "text-blue-600" : ""} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          {job.clientName}
                          {job.clientVerified && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                           <MapPin size={14} /> {job.city}, {job.province}
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                           <Calendar size={14} /> {formatRelativeTime(job.postedDate)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                         <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold">{job.projectType}</span>
                         <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md text-xs font-semibold">{job.discipline}</span>
                         <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1"><Briefcase size={12}/>{job.workType}</span>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2 mb-5 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="font-bold text-slate-800">
                           {job.openToProposals ? (
                             <span className="text-emerald-600 text-sm">Open to Proposals</span>
                           ) : (
                             <span>
                               {formatCurrency(job.budgetMin || 0)} - {formatCurrency(job.budgetMax || 0)}
                             </span>
                           )}
                        </div>
                        <Link href={`/jobs/${job.id}`} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-950 transition">
                           View Job
                        </Link>
                      </div>
                   </div>
                 ))
              ) : (
                 <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
                    <SearchIcon size={32} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs found</h3>
                    <p className="text-slate-500 text-sm mb-4">Try adjusting your filters or search terms</p>
                    <button onClick={handleClearAll} className="text-blue-600 font-semibold cursor-pointer">Clear all filters</button>
                 </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    ))}
                  <button
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
          </main>
        </div>
      </div>

       {/* Mobile Drawer Overlay */}
       {drawerOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-slide-in flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Filters</h2>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition cursor-pointer">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">{filterContent}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-indigo-950 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-900 rounded-lg shadow-sm border border-indigo-800">
              <span className="text-xl font-bold font-serif text-blue-500">BS</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">BuildLink<span className="text-blue-500">PH</span></span>
          </div>
          <p className="text-slate-300 font-medium mb-6">Find the Right Engineer. Build with Confidence.</p>
          <div className="border-t border-indigo-900 pt-6 text-sm flex flex-col md:flex-row justify-center gap-4">
            <p>&copy; {new Date().getFullYear()} BS CORP / BuildLinkPH. All rights reserved.</p>
            <div className="hidden md:block text-indigo-800">•</div>
            <div className="flex justify-center gap-4">
              <Link href="#" className="hover:text-blue-400 transition">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-400 transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Suspense } from 'react';
import type { Metadata } from 'next';
import JobBoard from './JobBoard';
import { SearchIcon, SlidersHorizontal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engineering Jobs | BuildLinkPH',
  description: 'Find top civil engineering jobs and freelance projects in the Philippines. Browse by specialization, location, and budget.',
};

function JobFallback() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <nav className="bg-white border-b border-slate-200 h-16" />
      
      {/* Header & Search skeleton */}
      <div className="bg-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="h-10 w-64 bg-indigo-900/50 rounded-lg animate-pulse mb-4 mx-auto sm:mx-0" />
          <div className="max-w-3xl flex bg-white rounded-xl shadow-lg p-1.5 opacity-80">
             <div className="flex-1 flex items-center px-4">
               <SearchIcon className="text-slate-200" size={20} />
               <div className="w-full h-12 bg-transparent" />
             </div>
             <div className="bg-blue-600/50 px-6 sm:px-8 py-3 rounded-lg w-28 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 shrink-0">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <SlidersHorizontal size={18} className="text-slate-300" />
                  <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
             </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex justify-between mb-6">
               <div className="h-8 w-40 bg-slate-200 rounded-lg animate-pulse" />
               <div className="h-8 w-36 bg-slate-200 rounded-lg animate-pulse" />
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-48 animate-pulse">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="h-6 w-3/4 bg-slate-200 rounded" />
                    <div className="h-8 w-8 bg-slate-100 rounded-full shrink-0" />
                  </div>
                  <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
                  <div className="flex gap-2 mb-4">
                     <div className="h-6 w-20 bg-slate-100 rounded-md" />
                     <div className="h-6 w-20 bg-slate-100 rounded-md" />
                     <div className="h-6 w-20 bg-slate-100 rounded-md" />
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobFallback />}>
      <JobBoard />
    </Suspense>
  );
}

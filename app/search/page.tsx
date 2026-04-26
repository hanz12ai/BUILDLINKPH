import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchEngineers from './SearchEngineers';

export const metadata: Metadata = {
  title: 'Search Engineers | BuildLinkPH',
  description:
    'Find qualified civil engineers in the Philippines. Filter by specialization, location, experience, and more.',
};

function SearchFallback() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Nav skeleton */}
      <nav className="bg-white border-b border-slate-200 h-16" />

      {/* Header skeleton */}
      <div className="bg-gradient-to-b from-blue-50 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-9 w-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-5 w-96 bg-slate-200 rounded-lg animate-pulse mt-3" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </aside>

          {/* Cards skeleton */}
          <main className="flex-1 min-w-0">
            <div className="flex justify-between mb-6">
              <div className="h-8 w-40 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-8 w-36 bg-slate-200 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-6 h-52 animate-pulse"
                >
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
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchEngineers />
    </Suspense>
  );
}

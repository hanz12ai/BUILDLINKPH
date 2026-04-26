'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface NavbarProps {
  /** Which link to highlight as "active" */
  activePage?: 'jobs' | 'search' | 'home' | 'tools';
}

export default function Navbar({ activePage }: NavbarProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;

      // Display name from auth metadata
      const name = user.user_metadata?.full_name || user.email || '';
      setUserName(name);
      const parts = name.trim().split(' ');
      setUserInitials(
        parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase()
      );

      // ── Role: always read from public.users (source of truth) ──
      // Fall back to user_metadata only if DB query fails
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && userData?.role) {
          setUserRole(userData.role as string);
        } else {
          // Fallback to metadata
          const metaRole = user.user_metadata?.role as string | undefined;
          setUserRole(metaRole || 'client');
        }
      } catch {
        const metaRole = user.user_metadata?.role as string | undefined;
        setUserRole(metaRole || 'client');
      }
    });
  }, []);

  const handleLogOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserRole(null);
    setUserName('');
    setUserInitials('');
    setDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const dashboardHref = userRole === 'engineer' ? '/dashboard/engineer' : '/dashboard/client';

  const linkClass = (page: string) =>
    `text-sm font-medium hidden sm:block transition-colors ${
      activePage === page
        ? 'text-blue-600 font-semibold'
        : 'text-slate-600 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-950 rounded-lg shadow-sm">
            <span className="text-xl font-bold font-serif text-blue-500">BS</span>
          </div>
          <span className="text-xl font-bold text-indigo-950 tracking-tight">
            BuildLink<span className="text-blue-500">PH</span>
          </span>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-4">

          {/* Role-based nav links — only render after mount to avoid hydration flash */}
          {mounted && (
            <>
              {/* Engineers: Find Jobs + Find Engineers */}
              {userRole === 'engineer' && (
                <>
                  <Link href="/jobs" className={linkClass('jobs')}>Find Jobs</Link>
                  <Link href="/search" className={linkClass('search')}>Find Engineers</Link>
                </>
              )}

              {/* Clients: Find Engineers only (they post jobs, not apply) */}
              {userRole === 'client' && (
                <Link href="/search" className={linkClass('search')}>Find Engineers</Link>
              )}

              {/* Guests: both links */}
              {!userRole && (
                <>
                  <Link href="/jobs" className={linkClass('jobs')}>Find Jobs</Link>
                  <Link href="/search" className={linkClass('search')}>Find Engineers</Link>
                </>
              )}

              {/* Cost Estimator - available to everyone */}
              <Link href="/tools/cost-estimator" className={linkClass('tools')}>Cost Estimator</Link>
            </>
          )}

          {/* Auth section */}
          {!mounted ? null : userRole ? (
            /* ── LOGGED IN ── */
            <div className="flex items-center gap-3">
              {/* Clients get a prominent "Post a Project" CTA */}
              {userRole === 'client' && (
                <Link
                  href="/dashboard/client/post-job"
                  className="bg-indigo-950 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-800 transition hidden sm:flex items-center gap-1.5"
                >
                  <Briefcase size={15} />
                  Post a Project
                </Link>
              )}

              <Link
                href={dashboardHref}
                className="text-sm text-slate-600 hover:text-blue-600 font-medium hidden sm:block transition-colors"
              >
                My Dashboard
              </Link>

              {/* Avatar + dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm hover:ring-2 hover:ring-blue-300 transition cursor-pointer"
                  title={userName}
                >
                  {userInitials || <User size={16} />}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <div className="text-sm font-bold text-slate-900 truncate">{userName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {userRole === 'engineer' ? '🔧 Engineer Account' : '🏗️ Client Account'}
                        </div>
                      </div>

                      <Link
                        href={dashboardHref}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                      >
                        My Dashboard
                      </Link>

                      {userRole === 'engineer' ? (
                        <>
                          <Link href="/jobs" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition">
                            Browse Jobs
                          </Link>
                          <Link href="/search" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition">
                            Find Engineers
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/search" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition">
                            Find Engineers
                          </Link>
                          <Link href="/dashboard/client/post-job" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition">
                            Post a Project
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100" />
                      <button
                        onClick={handleLogOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut size={15} />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* ── GUEST ── */
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-blue-600 font-medium hidden sm:block transition-colors">
                Log in
              </Link>
              <Link href="/register?role=engineer" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition">
                Join as Engineer
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('?');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user) {
        const name = user.user_metadata?.full_name || user.email || 'Client';
        setUserName(name);
        const parts = name.trim().split(' ');
        setUserInitials(
          parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase()
        );
      }
    });
  }, []);

  const handleLogOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard/client', icon: LayoutDashboard },
    { name: 'Post a Job', href: '/dashboard/client/post-job', icon: Briefcase },
    { name: 'My Jobs', href: '/dashboard/client/jobs', icon: Briefcase },
    { name: 'Browse Engineers', href: '/search', icon: Users },
    { name: 'Messages', href: '/dashboard/client/messages', icon: MessageSquare },
    { name: 'Company Profile', href: '/dashboard/client/profile', icon: User },
    { name: 'Settings', href: '/dashboard/client/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Header elements */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
         <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-950 rounded-md shadow-sm">
              <span className="text-base font-bold font-serif text-blue-500">BS</span>
            </div>
            <span className="text-lg font-bold text-indigo-950 tracking-tight">BuildLink<span className="text-blue-500">PH</span></span>
         </Link>
         <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-500 hover:text-slate-900 focus:outline-none">
           <Menu size={24} />
         </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-slide-in-left">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
               <Link href="/" className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-950 rounded-md shadow-sm">
                    <span className="text-base font-bold font-serif text-blue-500">BS</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-950 tracking-tight">BuildLink<span className="text-blue-500">PH</span></span>
               </Link>
               <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-900">
                 <X size={20} />
               </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">{userName || 'Loading...'}</div>
                  <div className="truncate text-xs text-slate-500">Client Account</div>
                </div>
              </div>
              <button onClick={handleLogOut} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 fixed top-0 bottom-0 left-0 z-40">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
           <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-950 rounded-md shadow-sm">
                <span className="text-base font-bold font-serif text-blue-500">BS</span>
              </div>
              <span className="text-lg font-bold text-indigo-950 tracking-tight">BuildLink<span className="text-blue-500">PH</span></span>
           </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-bold text-slate-900">{userName || 'Loading...'}</div>
              <div className="truncate text-xs text-slate-500">Client Account</div>
            </div>
          </div>
          <button onClick={handleLogOut} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-w-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}

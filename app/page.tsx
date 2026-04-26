'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, Hammer, Building, PenTool, Mountain, SearchIcon, Briefcase, Calculator, ArrowRight } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import { createClient } from '@/lib/supabase';

export default function Home() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;

      // Read from public.users — same source of truth as middleware
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
          if (metaRole) setUserRole(metaRole);
        }
      } catch {
        const metaRole = user.user_metadata?.role as string | undefined;
        if (metaRole) setUserRole(metaRole);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar activePage="home" />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 via-white to-white relative pb-20 pt-16 lg:pt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-950 mb-6 tracking-tight leading-tight">
            Find the Right Engineer. <br className="hidden md:inline" />
            <span className="text-blue-600">Build with Confidence.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            The premier job marketplace exclusively for civil engineers in the Philippines. Whether you are building from the ground up or designing the future.
          </p>

          {/* Role-aware CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            {userRole === 'engineer' ? (
              <>
                <Link href="/jobs" className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <SearchIcon size={20} />
                  Browse Engineering Jobs
                </Link>
                <Link href="/search" className="bg-white text-indigo-950 border-2 border-indigo-100 px-8 py-3.5 rounded-lg font-medium text-lg hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm flex items-center justify-center gap-2">
                  <Briefcase size={20} className="text-blue-600" />
                  Find Fellow Engineers
                </Link>
              </>
            ) : userRole === 'client' ? (
              <>
                <Link href="/search" className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <SearchIcon size={20} />
                  Find Engineers to Hire
                </Link>
                <Link href="/dashboard/client/post-job" className="bg-white text-indigo-950 border-2 border-indigo-100 px-8 py-3.5 rounded-lg font-medium text-lg hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm flex items-center justify-center gap-2">
                  <Briefcase size={20} className="text-blue-600" />
                  Post a Project
                </Link>
              </>
            ) : (
              /* Guest / not logged in */
              <>
                <Link href="/search" className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <SearchIcon size={20} />
                  I need to hire an engineer
                </Link>
                <Link href="/register?role=engineer" className="bg-white text-indigo-950 border-2 border-indigo-100 px-8 py-3.5 rounded-lg font-medium text-lg hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm flex items-center justify-center gap-2">
                  <Briefcase size={20} className="text-blue-600" />
                  I'm a civil engineer
                </Link>
              </>
            )}
          </div>

          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <Link href="/tools/cost-estimator" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50/80 backdrop-blur-sm hover:bg-indigo-100 px-5 py-2.5 rounded-full transition shadow-sm border border-indigo-100">
               <Calculator size={18} />
               Try our free Construction Cost Estimator
               <ArrowRight size={16} />
             </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-2 flex flex-col md:flex-row gap-2 border border-indigo-50 text-left">
            <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 relative flex items-center">
              <div className="pl-4 text-slate-400">
                <Hammer size={20} />
              </div>
              <select className="w-full p-4 bg-transparent focus:outline-none text-slate-700 font-medium appearance-none cursor-pointer">
                <option value="">Any Specialization</option>
                <option value="structural">Structural</option>
                <option value="civil">Civil</option>
                <option value="geotechnical">Geotechnical</option>
                <option value="sanitary">Sanitary</option>
                <option value="geodetic">Geodetic</option>
              </select>
            </div>

            <div className="flex-1 relative flex items-center">
              <div className="pl-4 text-slate-400">
                <MapPin size={20} />
              </div>
              <input
                type="text"
                placeholder="Location (City/Province)"
                className="w-full p-4 bg-transparent focus:outline-none text-slate-700 font-medium"
              />
            </div>

            <button className="bg-indigo-950 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-indigo-800 transition flex items-center justify-center gap-2 m-1">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white py-12 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-bold text-blue-600 mb-2">4,200+</div>
              <div className="text-slate-600 font-medium tracking-wide uppercase text-sm">Registered Engineers</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-4xl font-bold text-blue-600 mb-2">12,500+</div>
              <div className="text-slate-600 font-medium tracking-wide uppercase text-sm">Completed Projects</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-slate-600 font-medium tracking-wide uppercase text-sm">Verified PRC Licenses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Engineers */}
      <section className="bg-slate-50 py-24 flex-grow">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-indigo-950 mb-4">Featured Engineers</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Discover top-rated professionals ready to bring your vision to life.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Engineer Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-8 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-bold mb-5 ring-4 ring-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                JD
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Engr. Juan Dela Cruz</h3>
              <div className="flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Building size={14} /> Structural
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 mb-3 text-sm font-medium">
                <MapPin size={16} /> Metro Manila
              </div>
              <div className="flex items-center gap-1 mb-6">
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <span className="text-slate-700 font-semibold ml-1">5.0</span>
              </div>
              <Link href="/engineers/1" className="mt-auto w-full bg-white border-2 border-indigo-100 text-indigo-950 rounded-lg py-2.5 font-semibold hover:bg-slate-50 hover:border-indigo-200 transition">
                View Profile
              </Link>
            </div>

            {/* Engineer Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-8 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-3xl font-bold mb-5 ring-4 ring-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                MR
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Engr. Maria Reyes</h3>
              <div className="flex items-center justify-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <PenTool size={14} /> Civil
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 mb-3 text-sm font-medium">
                <MapPin size={16} /> Cebu City
              </div>
              <div className="flex items-center gap-1 mb-6">
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} className="text-slate-200" />
                <span className="text-slate-700 font-semibold ml-1">4.0</span>
              </div>
              <Link href="/engineers/2" className="mt-auto w-full bg-white border-2 border-indigo-100 text-indigo-950 rounded-lg py-2.5 font-semibold hover:bg-slate-50 hover:border-indigo-200 transition">
                View Profile
              </Link>
            </div>

            {/* Engineer Card 3 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-8 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold mb-5 ring-4 ring-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                PS
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Engr. Paolo Santos</h3>
              <div className="flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Mountain size={14} /> Geotechnical
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 mb-3 text-sm font-medium">
                <MapPin size={16} /> Davao City
              </div>
              <div className="flex items-center gap-1 mb-6">
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <Star size={18} fill="#EAB308" className="text-yellow-500" />
                <span className="text-slate-700 font-semibold ml-1">4.9</span>
              </div>
              <Link href="/engineers/3" className="mt-auto w-full bg-white border-2 border-indigo-100 text-indigo-950 rounded-lg py-2.5 font-semibold hover:bg-slate-50 hover:border-indigo-200 transition">
                View Profile
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-950 text-slate-400 py-16 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-900 rounded-lg shadow-sm border border-indigo-800">
              <span className="text-xl font-bold font-serif text-blue-500">BS</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">BuildLink<span className="text-blue-500">PH</span></span>
          </div>
          <p className="max-w-md mx-auto text-slate-300 font-medium mb-8">
            Find the Right Engineer. Build with Confidence.
          </p>
          <div className="border-t border-indigo-900 pt-8 text-sm flex flex-col md:flex-row justify-center gap-4">
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
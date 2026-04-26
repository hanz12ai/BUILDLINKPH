'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  Bookmark,
  X,
  ChevronLeft,
  Calendar,
  Briefcase,
  Award,
  MessageSquare,
  Heart,
} from 'lucide-react';
import {
  type EngineerProfile,
  type PortfolioItem,
  AVATAR_COLOR_MAP,
  AVAILABILITY_STYLES,
} from '@/lib/mock-engineer-profiles';
import Navbar from '@/components/shared/Navbar';
import { createClient } from '@/lib/supabase';

export default function EngineerProfileView({
  profile,
}: {
  profile: EngineerProfile;
}) {
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioItem | null>(null);
  const [saved, setSaved] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  // Add the new states:
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
     const fetchReviews = async () => {
        try {
           const res = await fetch(`/api/reviews/${profile.id}?page=${reviewsPage}`);
           if (res.ok) {
              const data = await res.json();
              if (reviewsPage === 1) {
                  setRealReviews(data.reviews || []);
                  setReviewStats(data.stats);
              } else {
                  setRealReviews(prev => [...prev, ...(data.reviews || [])]);
              }
              setHasMoreReviews(data.page < data.total_pages);
           }
        } catch(e) {
           console.error(e);
        } finally {
           setLoadingReviews(false);
        }
     };
     fetchReviews();
  }, [profile.id, reviewsPage]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const role = data.session.user.user_metadata?.role as string | undefined;
        setUserRole(role || 'client');
      }
    });
  }, []);

  const avatarStyle = AVATAR_COLOR_MAP[profile.avatarColor] || AVATAR_COLOR_MAP.blue;
  const availStyle = AVAILABILITY_STYLES[profile.availability];

  const handleContactHireClick = () => {
    if (!userRole) {
      router.push('/login');
      return;
    }
    // Logic for contacting/hiring goes here for logged-in users
    alert('Contact / Hire flow will start here!');
  };

  const renderStars = (rating: number, size = 16) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.3;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(
          <Star
            key={i}
            size={size}
            fill="#EAB308"
            className="text-yellow-500"
          />
        );
      } else if (i === full && hasHalf) {
        stars.push(
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="text-slate-200 absolute top-0 left-0" />
            <span className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
              <Star size={size} fill="#EAB308" className="text-yellow-500" />
            </span>
          </span>
        );
      } else {
        stars.push(<Star key={i} size={size} className="text-slate-200" />);
      }
    }
    return stars;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Search
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ──────────── LEFT: Main Content ──────────── */}
            <main className="flex-1 min-w-0 space-y-8">
              {/* ─── Header Card ─── */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Top gradient bar */}
                <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                </div>

                <div className="px-6 sm:px-8 pb-8 -mt-16 relative">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                    {/* Avatar */}
                    <div
                      className={`w-28 h-28 rounded-2xl ${avatarStyle.bg} flex items-center justify-center ${avatarStyle.text} text-4xl font-bold ring-4 ring-white shadow-lg shrink-0`}
                    >
                      {profile.initials}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight">
                          Engr. {profile.firstName} {profile.lastName}
                        </h1>
                        {profile.prcVerified && (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                            <ShieldCheck size={14} />
                            PRC License Verified
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {profile.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={15} className="text-slate-400" />
                          {profile.city}, {profile.province}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={15} className="text-slate-400" />
                          {profile.yearsExperience} years experience
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="flex items-center gap-0.5">
                            {renderStars(profile.rating)}
                          </div>
                          <span className="font-bold text-slate-800 ml-1">
                            {profile.rating.toFixed(1)}
                          </span>
                          <span className="text-slate-400">
                            ({profile.reviewCount} reviews)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-only rate + CTA */}
                  <div className="lg:hidden mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-extrabold text-indigo-950">
                          ₱{profile.hourlyRate.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-400 ml-1">
                          /hour
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 ${availStyle.bg} ${availStyle.text} px-3 py-1.5 rounded-full text-xs font-bold`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${availStyle.dot} animate-pulse`}
                        />
                        {profile.availability}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleContactHireClick} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm cursor-pointer flex items-center justify-center gap-2">
                        <MessageSquare size={16} />
                        Contact / Hire
                      </button>
                      <button
                        onClick={() => setSaved(!saved)}
                        className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm transition cursor-pointer flex items-center gap-2 ${
                          saved
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                        }`}
                      >
                        <Bookmark
                          size={16}
                          fill={saved ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ─── About ─── */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-indigo-950 mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-blue-600" />
                  About
                </h2>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  {profile.bio}
                </p>
              </section>

              {/* ─── Specializations & Skills ─── */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-indigo-950 mb-4 flex items-center gap-2">
                  <Award size={20} className="text-blue-600" />
                  Specializations & Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* ─── Experience ─── */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-indigo-950 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Experience
                </h2>
                <div className="flex items-center gap-4 mb-5">
                  <div className="bg-blue-50 rounded-xl px-5 py-3 text-center">
                    <div className="text-3xl font-extrabold text-blue-600">
                      {profile.yearsExperience}
                    </div>
                    <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                      Years
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">
                      Professional experience in {profile.specialization.toLowerCase()} engineering
                      across the Philippines
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Project Types
                </h3>
                <ul className="space-y-2">
                  {profile.projectTypes.map((type) => (
                    <li
                      key={type}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {type}
                    </li>
                  ))}
                </ul>
              </section>

              {/* ─── Portfolio ─── */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-indigo-950 mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Portfolio
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.portfolio.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPortfolio(item)}
                      className="group text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer"
                    >
                      {/* Placeholder image */}
                      <div
                        className={`h-36 bg-gradient-to-br ${item.image} relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white/30 text-6xl font-black">
                            {item.type.charAt(0)}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                        {/* Year badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          {item.year}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition line-clamp-2">
                          {item.title}
                        </h3>
                        <span className="inline-block bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {item.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* ─── Reviews ─── */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                    <Star size={20} className="text-blue-600" />
                    Reviews
                  </h2>
                </div>

                {loadingReviews && reviewsPage === 1 ? (
                   <div className="text-center py-8 text-slate-500 text-sm font-semibold">Loading reviews...</div>
                ) : reviewStats && reviewStats.total_count > 0 ? (
                  <>
                     {/* Aggregate Stats */}
                     <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-slate-100">
                        {/* Overall Rating */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                           <div className="text-5xl font-extrabold text-indigo-950 mb-2">{reviewStats.average_rating.toFixed(1)}</div>
                           <div className="flex items-center gap-0.5 mb-1">{renderStars(reviewStats.average_rating, 16)}</div>
                           <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{reviewStats.total_count} Reviews</div>
                        </div>

                        {/* Star Distribution */}
                        <div className="flex-1 flex flex-col gap-1.5 justify-center">
                           {[5,4,3,2,1].map(star => {
                              const count = reviewStats.rating_distribution[star] || 0;
                              const pct = reviewStats.total_count > 0 ? (count / reviewStats.total_count) * 100 : 0;
                              return (
                                <div key={star} className="flex items-center gap-3">
                                   <div className="w-8 shrink-0 text-xs font-bold text-slate-500 flex items-center gap-1">{star} <Star size={10}/></div>
                                   <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }}></div>
                                   </div>
                                   <div className="w-6 shrink-0 text-right text-xs font-semibold text-slate-600">{count}</div>
                                </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="space-y-6">
                       {realReviews.map((review) => {
                         const reviewColor = AVATAR_COLOR_MAP.blue;
                         const initials = (review.reviewer?.full_name || 'U').split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase();
                         const rDate = new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                         return (
                           <div key={review.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                             <div className="flex items-start gap-3.5">
                               <div className={`w-10 h-10 rounded-full ${reviewColor.bg} flex items-center justify-center ${reviewColor.text} text-sm font-bold shrink-0`}>
                                 {initials}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex flex-wrap items-center justify-between mb-1">
                                   <div>
                                       <span className="text-sm font-bold text-slate-900 mr-2">
                                         {review.reviewer?.full_name || 'Verified Client'}
                                       </span>
                                   </div>
                                   <span className="text-xs text-slate-400">{rDate}</span>
                                 </div>
                                 <div className="flex items-center gap-0.5 mb-2">
                                   {renderStars(review.rating, 14)}
                                 </div>
                                 <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                   {review.comment}
                                 </p>
                                 {(review.tags && review.tags.length > 0) && (
                                     <div className="flex flex-wrap gap-2 mt-2">
                                         {review.tags.map((tag:string, idx:number) => (
                                             <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                                                {tag}
                                             </span>
                                         ))}
                                     </div>
                                 )}
                               </div>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                     {hasMoreReviews && (
                        <div className="mt-8 text-center">
                           <button onClick={() => setReviewsPage(p => p + 1)} className="px-5 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition rounded-lg text-sm font-bold shadow-sm">
                              Load More Reviews
                           </button>
                        </div>
                     )}
                  </>
                ) : (
                   <div className="text-center py-8">
                      <p className="text-sm text-slate-500 font-medium">No reviews yet for this engineer.</p>
                   </div>
                )}
              </section>
            </main>

            {/* ──────────── RIGHT: Sticky Sidebar (Desktop) ──────────── */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Rate & CTA Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  {/* Rate */}
                  <div className="text-center mb-5">
                    <div className="text-3xl font-extrabold text-indigo-950">
                      ₱{profile.hourlyRate.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400 font-medium">
                      per hour
                    </div>
                  </div>

                  {/* Availability */}
                  <div
                    className={`flex items-center justify-center gap-2 ${availStyle.bg} ${availStyle.text} px-4 py-2.5 rounded-xl text-sm font-bold mb-5`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${availStyle.dot} animate-pulse`}
                    />
                    {profile.availability === 'Available'
                      ? 'Available for Hire'
                      : profile.availability === 'Busy'
                        ? 'Currently Busy'
                        : 'Away'}
                  </div>

                  {/* CTA */}
                  <button onClick={handleContactHireClick} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm cursor-pointer flex items-center justify-center gap-2 mb-3">
                    <MessageSquare size={16} />
                    Contact / Hire
                  </button>

                  {/* Save */}
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`w-full py-3 rounded-xl border-2 font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                      saved
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    <Bookmark
                      size={16}
                      fill={saved ? 'currentColor' : 'none'}
                    />
                    {saved ? 'Saved' : 'Save Engineer'}
                  </button>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Experience</span>
                      <span className="text-sm font-bold text-slate-800">
                        {profile.yearsExperience} years
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Projects</span>
                      <span className="text-sm font-bold text-slate-800">
                        {profile.portfolio.length}+ completed
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Rating</span>
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <Star size={13} fill="#EAB308" className="text-yellow-500" />
                        {profile.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Reviews</span>
                      <span className="text-sm font-bold text-slate-800">
                        {profile.reviewCount}
                      </span>
                    </div>
                    {profile.prcVerified && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">License</span>
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                          <ShieldCheck size={13} />
                          PRC Verified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Portfolio Modal */}
      {selectedPortfolio && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedPortfolio(null)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-modal-in">
            {/* Image */}
            <div
              className={`h-48 sm:h-56 bg-gradient-to-br ${selectedPortfolio.image} relative`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/20 text-8xl font-black">
                  {selectedPortfolio.type.charAt(0)}
                </div>
              </div>
              <button
                onClick={() => setSelectedPortfolio(null)}
                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition cursor-pointer backdrop-blur-sm"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  {selectedPortfolio.type}
                </span>
                <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  {selectedPortfolio.year}
                </span>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 14rem)' }}>
              <h3 className="text-xl font-extrabold text-indigo-950 mb-4">
                {selectedPortfolio.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[15px]">
                {selectedPortfolio.description}
              </p>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={15} />
                  Completed {selectedPortfolio.year}
                </div>
                <button
                  onClick={() => setSelectedPortfolio(null)}
                  className="bg-slate-100 text-slate-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
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

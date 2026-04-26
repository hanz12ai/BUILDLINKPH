'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  MapPin,
  Calendar,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  Share2,
  Bookmark,
  FileText,
  FileImage,
  Download,
  X,
  UploadCloud,
  PhilippinePeso
} from 'lucide-react';
import { type JobDetails } from '@/lib/mock-job-details';
import { formatRelativeTime, formatCurrency } from '@/lib/mock-jobs';
import Navbar from '@/components/shared/Navbar';

export default function JobDetailClient({ job }: { job: JobDetails }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const role = data.session.user.user_metadata?.role as string | undefined;
        setUserRole(role || 'client');
      }
    });
  }, []);

  const handleApplyClick = () => {
    if (!userRole) {
      router.push('/login');
      return;
    }
    setModalOpen(true);
  };
  
  // Apply form state
  const [coverNote, setCoverNote] = useState('');
  const [rate, setRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitProposal = async () => {
     setSubmitError(null);
     setIsSubmitting(true);
     try {
       const res = await fetch('/api/applications', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           job_id: job.id,
           cover_note: coverNote,
           proposed_rate: parseFloat(rate)
         })
       });

       if (res.status === 201) {
         setModalOpen(false);
         setSubmitSuccess(true);
       } else if (res.status === 409) {
         setSubmitError('You have already applied to this job.');
       } else {
         throw new Error('Failed');
       }
     } catch(err) {
       setSubmitError('Failed to submit application. Please try again.');
     } finally {
       setIsSubmitting(false);
     }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar activePage="jobs" />

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* ──────────── LEFT: Main Content ──────────── */}
            <main className="flex-1 min-w-0 space-y-6">
              {/* Header Card */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
                     <div className="flex items-center gap-2 font-semibold">
                       <CheckCircle2 size={18} className="text-emerald-600" />
                       Application submitted! The client will be notified.
                     </div>
                     <button onClick={() => setSubmitSuccess(false)}><X size={16} className="text-emerald-600 hover:text-emerald-800" /></button>
                  </div>
                )}

                {job.prcRequired && (
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 mb-4 uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    PRC License Required
                  </div>
                )}
                
                <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight mb-4 leading-tight">
                  {job.title}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-semibold">{job.projectType}</span>
                  <span className="bg-sky-50 text-sky-700 px-3 py-1 rounded-md text-sm font-semibold">{job.discipline}</span>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1.5"><Briefcase size={14}/>{job.workType}</span>
                </div>

                {/* Meta Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 mt-0.5">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Location</div>
                      <div className="text-sm text-slate-500">{job.city}, {job.province}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 mt-0.5">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Project Timeline</div>
                      <div className="text-sm text-slate-500">Posted {formatRelativeTime(job.postedDate)} • <span className="font-medium text-amber-600">Deadline: {formatDate(job.deadline)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Mobile Budget (Hidden on lg) */}
                <div className="lg:hidden mt-6 pt-2">
                  <div className="text-sm text-slate-500 font-medium mb-1">Budget Range</div>
                  <div className="text-2xl font-extrabold text-indigo-950 mb-4">
                    {job.openToProposals ? (
                        <span className="text-emerald-600">Open to Proposals</span>
                      ) : (
                        <span>{formatCurrency(job.budgetMin || 0)} - {formatCurrency(job.budgetMax || 0)}</span>
                    )}
                  </div>
                  <button onClick={handleApplyClick} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-sm cursor-pointer mb-3">
                    Apply Now
                  </button>
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`w-full py-3.5 rounded-xl border-2 font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                      saved ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                    {saved ? 'Saved' : 'Save Job'}
                  </button>
                </div>
              </section>

              {/* Project Description */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-indigo-950 mb-4">Project Description</h2>
                <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
                  {job.fullDescription.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {/* Requirements */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-indigo-950 mb-5">Requirements</h2>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5"><div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-xs">✓</div></span>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">Minimum Experience</span>
                      <span className="text-sm text-slate-600">{job.requirements.minExperience}+ years of relevant experience</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5"><div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-xs">✓</div></span>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">PRC License</span>
                      <span className="text-sm text-slate-600">
                        {job.requirements.prcRequired ? 'Active PRC License required to sign and seal documents.' : 'PRC License is optional but tracking is an advantage.'}
                      </span>
                    </div>
                  </li>
                </ul>

                <h3 className="text-sm font-bold text-slate-800 mb-3">Additional Notes:</h3>
                <ul className="space-y-2">
                  {job.requirements.additionalNotes.map((note, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Attachments */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-bold text-indigo-950 mb-5">Attachments</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-slate-50 transition group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${file.type === 'pdf' ? 'bg-rose-100 text-rose-600' : file.type === 'zip' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          {file.type === 'pdf' ? <FileText size={20} /> : <FileImage size={20} />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition truncate max-w-[150px] sm:max-w-[180px]" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">{file.size} • {file.type.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-slate-400 group-hover:text-blue-600 transition">
                        <Download size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            {/* ──────────── RIGHT: Sticky Sidebar ──────────── */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24 space-y-6">
                
                {/* Apply Settings Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-t-4 border-t-blue-600">
                  <div className="text-sm text-slate-500 font-medium mb-1 titlecase uppercase tracking-wider">Project Budget</div>
                  <div className="text-3xl font-extrabold text-indigo-950 mb-6">
                    {job.openToProposals ? (
                        <span className="text-emerald-600 text-[22px]">Open to Proposals</span>
                      ) : (
                        <span>{formatCurrency(job.budgetMin || 0)} - {formatCurrency(job.budgetMax || 0)}</span>
                    )}
                  </div>

                  <button onClick={handleApplyClick} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-[15px] hover:bg-blue-700 transition shadow-sm cursor-pointer mb-3">
                    Apply Now
                  </button>
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`w-full py-3 rounded-xl border-2 font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                      saved ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                    {saved ? 'Saved' : 'Save Job'}
                  </button>
                  <button className="w-full mt-3 py-3 text-slate-500 font-semibold text-sm hover:text-slate-800 transition flex items-center justify-center gap-2 cursor-pointer">
                    <Share2 size={16} /> Share Project
                  </button>
                </div>

                {/* Client Info Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">About the Client</h3>
                   <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xl font-bold shrink-0">
                        {getInitials(job.clientName)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          {job.clientName}
                        </div>
                        {job.clientVerified && (
                           <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                             <CheckCircle2 size={12} /> Verified Client
                           </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-slate-100">
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-slate-500">Member since</span>
                       <span className="font-bold text-slate-800">{job.clientStats.memberSince}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-slate-500">Jobs posted</span>
                       <span className="font-bold text-slate-800">{job.clientStats.totalJobsPosted} jobs</span>
                     </div>
                   </div>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </div>

       {/* Apply Modal */}
       {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-modal-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
               <div>
                 <h2 className="text-xl font-bold text-indigo-950">Submit Proposal</h2>
                 <p className="text-xs text-slate-500 mt-0.5 font-medium truncate max-w-[300px]">{job.title}</p>
               </div>
               <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-2 rounded-full transition cursor-pointer">
                 <X size={20} />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
               <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Cover Note</label>
                  <textarea
                    rows={5}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Introduce yourself and explain why you're a good fit for this project..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition resize-none"
                  />
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Proposed Rate</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhilippinePeso size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                     Client budget: <span className="font-semibold text-slate-700">{job.openToProposals ? 'Open to Proposals' : `${formatCurrency(job.budgetMin || 0)} - ${formatCurrency(job.budgetMax || 0)}`}</span>
                  </p>
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-800 mb-2">Attach CV / Portfolio</label>
                 <div className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors rounded-xl p-8 text-center cursor-pointer group">
                   <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-105 transition-transform">
                     <UploadCloud size={24} className="text-blue-500" />
                   </div>
                   <div className="text-sm font-bold text-slate-700 mb-1">Click to upload or drag and drop</div>
                   <div className="text-xs text-slate-500">PDF, DOCX, ZIP (Max 10MB)</div>
                 </div>
               </div>
            </div>

            {submitError && (
              <div className="mx-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold">
                {submitError}
              </div>
            )}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-slate-50">
               <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                 Cancel
               </button>
               <button onClick={handleSubmitProposal} className="px-6 py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2" disabled={!coverNote || !rate || isSubmitting}>
                 {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
               </button>
            </div>
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
          </div>
        </div>
      </footer>
    </div>
  );
}

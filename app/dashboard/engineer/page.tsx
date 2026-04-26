'use client';

import Link from 'next/link';
import {
  Eye,
  Send,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Clock,
  MessageSquare
} from 'lucide-react';
import { mockEngineerStats, mockEngineerApplications, mockEngineerMessages } from '@/lib/mock-dashboard';
import { mockJobs } from '@/lib/mock-jobs';

export default function EngineerDashboardPage() {
  const stats = mockEngineerStats;
  const recommendedJobs = mockJobs.slice(0, 3); // Just grab first 3 mock jobs

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">Pending</span>;
      case 'Viewed':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Viewed by Client</span>;
      case 'Shortlisted':
        return <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">Shortlisted</span>;
      case 'Hired':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">Hired</span>;
      case 'Rejected':
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-xs font-bold">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Engr. Juan Dela Cruz.</p>
      </div>

      {/* Banners */}
      <div className="space-y-4">
        {/* Profile Completion Builder */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
           <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-sm font-bold text-indigo-950">Your profile is 60% complete</h3>
               <span className="text-xs font-bold text-blue-600">60%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
               <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
             </div>
             <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="text-slate-500">Missing items:</span>
                <Link href="#" className="font-semibold text-blue-600 hover:underline flex items-center gap-1">+ Add Photo</Link>
                <Link href="#" className="font-semibold text-blue-600 hover:underline flex items-center gap-1">+ Add Portfolio Item</Link>
             </div>
           </div>
        </div>

        {/* PRC License Banner */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="flex items-start gap-3">
             <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
             <div>
               <h3 className="text-sm font-bold text-amber-900">Your PRC license is pending verification</h3>
               <p className="text-xs text-amber-700 mt-0.5">You will not be able to apply to strict jobs until verified.</p>
             </div>
           </div>
           <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition shrink-0">
             Upload Documents
           </button>
        </div>
      </div>

      {/* Top Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Profile Views', value: stats.profileViews, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Applications Sent', value: stats.applicationsSent, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Accepted', value: stats.proposalsAccepted, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Projects', value: stats.activeProjects, icon: Briefcase, color: 'text-sky-600', bg: 'bg-sky-50' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <Icon size={24} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-indigo-950 leading-none mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* My Applications Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-indigo-950">My Applications</h2>
            </div>
            
            <div className="divide-y divide-slate-100 flex-1">
              {mockEngineerApplications.length > 0 ? (
                mockEngineerApplications.map((app) => (
                  <div key={app.id} className="p-5 hover:bg-slate-50 transition group flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={`/jobs/${app.jobId}`} className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                          {app.jobTitle}
                        </Link>
                        <div className="shrink-0 sm:hidden">
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-slate-600 mb-2 truncate">
                        {app.clientName}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="hidden sm:inline-block">{getStatusBadge(app.status)}</span>
                        <span>Applied on {formatDate(app.dateApplied)}</span>
                        <span className="font-semibold text-emerald-600 border border-emerald-100 bg-emerald-50 px-2 py-0.5 rounded">₱{app.proposedRate.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="shrink-0 mt-2 sm:mt-0">
                       <Link href={`/jobs/${app.jobId}`} className="inline-block w-full sm:w-auto text-center px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition">
                         View Job
                       </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No applications sent yet. Search for jobs to apply.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
              <Link href="/dashboard/engineer/applications" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                View All Applications <ChevronRight size={16} />
              </Link>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Recommended Jobs */}
          <section className="bg-gradient-to-b from-indigo-950 to-indigo-900 rounded-xl border border-indigo-800 shadow-lg flex flex-col overflow-hidden">
            <div className="p-5 border-b border-indigo-800/50 flex items-center gap-2">
              <Briefcase size={18} className="text-indigo-300" />
              <h2 className="text-lg font-bold text-white">Recommended for You</h2>
            </div>
            
            <div className="divide-y divide-indigo-800/50 flex-1">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="p-5 hover:bg-white/5 transition group">
                   <div className="flex items-start justify-between gap-2 mb-2">
                     <Link href={`/jobs/${job.id}`} className="text-sm font-bold text-white group-hover:text-blue-300 truncate">
                       {job.title}
                     </Link>
                   </div>
                   <div className="flex flex-wrap items-center gap-2 mb-3">
                     <span className="bg-indigo-800/50 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{job.projectType}</span>
                     <span className="text-xs font-semibold text-emerald-400">
                      {job.openToProposals ? 'Open' : `₱${job.budgetMax?.toLocaleString()}`}
                     </span>
                   </div>
                   <div className="flex items-center justify-between mt-2">
                     <div className="flex items-center gap-1 text-xs text-indigo-300">
                       <MapPin size={12} /> {job.province}
                     </div>
                     <Link href={`/jobs/${job.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                       Apply <ChevronRight size={14} />
                     </Link>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* Messages Preview */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare size={18} className="text-slate-400" />
              <h2 className="text-lg font-bold text-indigo-950">Messages</h2>
            </div>
            
            <div className="divide-y divide-slate-100 flex-1">
              {mockEngineerMessages.map((msg) => {
                const colorMap: Record<string, string> = {
                  teal: 'text-teal-700 bg-teal-100',
                  rose: 'text-rose-700 bg-rose-100',
                  blue: 'text-blue-700 bg-blue-100'
                };
                const colorClass = colorMap[msg.senderColor] || colorMap.blue;
                
                return (
                <Link href="#" key={msg.id} className="p-4 hover:bg-slate-50 transition flex items-start gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colorClass}`}>
                     {msg.senderInitials}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-0.5">
                       <span className={`text-sm font-bold truncate ${!msg.read ? 'text-slate-900' : 'text-slate-700'}`}>
                         {msg.senderName}
                       </span>
                       {!msg.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                     </div>
                     <p className={`text-xs truncate ${!msg.read ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                       {msg.content}
                     </p>
                   </div>
                </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
              <Link href="/dashboard/engineer/messages" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                View Inbox <ChevronRight size={16} />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

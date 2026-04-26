'use client';

import Link from 'next/link';
import {
  Briefcase,
  FileText,
  Users,
  CheckCircle2,
  Plus,
  MoreVertical,
  ChevronRight,
  Eye
} from 'lucide-react';
import {
  mockClientDashboardStats,
  mockClientJobPosts,
  mockProposals,
  mockSavedEngineers
} from '@/lib/mock-dashboard';

export default function ClientDashboardPage() {
  const stats = mockClientDashboardStats;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">Active</span>;
      case 'Draft':
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">Draft</span>;
      case 'Closed':
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-xs font-bold">Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Apex Development Corp. Here's what's happening.</p>
      </div>

      {/* Top Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Job Posts', value: stats.activeJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Proposals', value: stats.totalProposals, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Saved Engineers', value: stats.savedEngineers, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed Projects', value: stats.completedProjects, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
        
        {/* LEFT COLUMN (2/3 width on xl) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* My Job Posts Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-indigo-950">My Job Posts</h2>
              <button className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition">
                <Plus size={16} />
                <span className="hidden sm:inline">Post a New Job</span>
                <span className="sm:hidden">Post</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {mockClientJobPosts.length > 0 ? (
                mockClientJobPosts.map((job) => (
                  <div key={job.id} className="p-5 hover:bg-slate-50 transition group flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={`/jobs/${job.id}`} className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                          {job.title}
                        </Link>
                        <div className="shrink-0 sm:hidden">
                          {getStatusBadge(job.status)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="hidden sm:inline-block">{getStatusBadge(job.status)}</span>
                        <span>Posted on {formatDate(job.postedDate)}</span>
                        <span className="font-semibold text-slate-700">{job.proposalsCount} proposals</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                       <button className="px-3 py-1.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition">
                         View Proposals
                       </button>
                       <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition">
                         <MoreVertical size={18} />
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No job posts yet.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
              <Link href="/dashboard/client/jobs" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                View All Jobs <ChevronRight size={16} />
              </Link>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (1/3 width on xl) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Recent Proposals Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-indigo-950">Recent Proposals</h2>
            </div>
            
            <div className="divide-y divide-slate-100 flex-1">
              {mockProposals.slice(0, 4).map((proposal) => {
                const colorMap: Record<string, string> = {
                  blue: 'text-blue-700 bg-blue-100',
                  sky: 'text-sky-700 bg-sky-100',
                  indigo: 'text-indigo-700 bg-indigo-100',
                  amber: 'text-amber-700 bg-amber-100',
                  emerald: 'text-emerald-700 bg-emerald-100',
                  rose: 'text-rose-700 bg-rose-100',
                  violet: 'text-violet-700 bg-violet-100'
                };
                const colorClasses = colorMap[proposal.engineerAvatarColor] || colorMap.blue;
                return (
                <div key={proposal.id} className="p-5 hover:bg-slate-50 transition group">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colorClasses}`}>
                      {proposal.engineerInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/engineers/${proposal.engineerId}`} className="text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          Engr. {proposal.engineerName}
                        </Link>
                        <span className="text-xs font-bold text-emerald-600 shrink-0">
                          ₱{proposal.proposedRate.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate" title={proposal.jobTitle}>
                        {proposal.jobTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between ml-13 mt-1">
                    <span className="text-xs text-slate-400">{formatDate(proposal.date)}</span>
                    <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                      <Eye size={14} /> View
                    </button>
                  </div>
                </div>
              )})}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
              <Link href="/dashboard/client/proposals" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                View All Proposals <ChevronRight size={16} />
              </Link>
            </div>
          </section>

          {/* Saved Engineers Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-indigo-950">Saved Engineers</h2>
            </div>
            
            <div className="p-5 grid grid-cols-2 gap-3 flex-1">
              {mockSavedEngineers.map((engineer) => {
                const colorMap: Record<string, string> = {
                  blue: 'text-blue-700 bg-blue-100',
                  sky: 'text-sky-700 bg-sky-100',
                  indigo: 'text-indigo-700 bg-indigo-100',
                  amber: 'text-amber-700 bg-amber-100',
                  emerald: 'text-emerald-700 bg-emerald-100',
                  rose: 'text-rose-700 bg-rose-100',
                  violet: 'text-violet-700 bg-violet-100'
                };
                const colorClasses = colorMap[engineer.avatarColor] || colorMap.blue;
                return (
                <Link key={engineer.id} href={`/engineers/${engineer.id}`} className="block border border-slate-200 rounded-lg p-3 text-center hover:border-blue-300 hover:shadow-sm transition group">
                   <div className={`w-10 h-10 mx-auto rounded-full mb-2 flex items-center justify-center text-sm font-bold ${colorClasses}`}>
                     {engineer.initials}
                   </div>
                   <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">{engineer.name}</div>
                   <div className="text-[10px] text-slate-500 truncate mt-0.5">{engineer.specialization}</div>
                </Link>
              )})}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto h-full">
              <Link href="/dashboard/client/saved" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                View All Saved <ChevronRight size={16} />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

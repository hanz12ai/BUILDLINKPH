'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreVertical, Edit2, Eye, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { mockClientJobPosts } from '@/lib/mock-dashboard';

export default function ClientJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredJobs = mockClientJobPosts.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5"><CheckCircle2 size={12}/> Active</span>;
      case 'Draft':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold">Draft</span>;
      case 'Closed':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5"><XCircle size={12}/> Closed</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">My Job Posts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your active projects, drafts, and past jobs.</p>
        </div>
        <Link href="/dashboard/client/post-job" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm self-start sm:self-auto shrink-0">
          <Plus size={18} />
          Post a New Job
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search job titles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredJobs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredJobs.map((job) => (
              <div key={job.id} className="p-5 hover:bg-slate-50 transition flex flex-col lg:flex-row lg:items-center gap-6 group">
                
                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Link href={`/jobs/${job.id}`} className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                      {job.title}
                    </Link>
                    <div className="lg:hidden shrink-0">
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span className="hidden lg:block">{getStatusBadge(job.status)}</span>
                    <span>Posted on {formatDate(job.postedDate)}</span>
                    <span className="text-slate-300 hidden sm:block">•</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {job.proposalsCount} Proposals
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t border-slate-100 lg:border-0 mt-2 lg:mt-0">
                  <Link 
                    href={`/dashboard/client/jobs/${job.id}/proposals`}
                    className="flex-1 lg:flex-none text-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 rounded-lg text-sm font-bold transition"
                  >
                    View Proposals
                  </Link>
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition" title="View Job Page">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Edit Job">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition" title="Delete Job">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="text-slate-300" size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No jobs found</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All' 
                ? "We couldn't find any jobs matching your current filters. Try adjusting them." 
                : "You haven't posted any jobs yet. Create your first job post to start receiving proposals from engineers."}
            </p>
            {(searchQuery || statusFilter !== 'All') ? (
              <button 
                onClick={() => {setSearchQuery(''); setStatusFilter('All');}}
                className="text-blue-600 font-bold hover:text-blue-700 text-sm"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/dashboard/client/post-job" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                Post Your First Job
              </Link>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

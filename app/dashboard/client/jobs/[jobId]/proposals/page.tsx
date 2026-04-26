'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck, 
  ChevronDown, 
  MessageSquare,
  User,
  X,
  Send
} from 'lucide-react';

interface ExtendedProposal {
  id: string | number;
  engineerId: string | number;
  engineerName: string;
  engineerInitials: string;
  engineerColor: string;
  specialization: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  prcVerified: boolean;
  proposedRate: number;
  dateSubmitted: string;
  coverNote: string;
  status: 'Pending' | 'Shortlisted' | 'Hired' | 'Rejected' | string;
}

const mockJobDetails = {
  id: 101,
  title: 'Structural Design for 5-Story Mixed-Use Building',
  status: 'Active',
  postedDate: '2026-04-05',
  proposalsCount: 6,
};

const mockProposals: ExtendedProposal[] = [
  {
    id: 1,
    engineerId: 1,
    engineerName: 'Juan Dela Cruz',
    engineerInitials: 'JD',
    engineerColor: 'blue',
    specialization: 'Structural Engineer',
    yearsExperience: 8,
    rating: 4.9,
    reviewCount: 42,
    prcVerified: true,
    proposedRate: 60000,
    dateSubmitted: '2026-04-06T10:00:00Z',
    coverNote: "Hi there! I have extensive experience designing 5-to-10 story commercial and mixed-use structures in Metro Manila following the latest NCP 2015 codes. My recent project in Quezon City is very similar to your requirements. I'd love to share the plans with you. Let me know if you are open to a quick call.",
    status: 'Shortlisted'
  },
  {
    id: 2,
    engineerId: 5,
    engineerName: 'Miguel Santos',
    engineerInitials: 'MS',
    engineerColor: 'sky',
    specialization: 'Civil Engineer',
    yearsExperience: 5,
    rating: 4.7,
    reviewCount: 18,
    prcVerified: true,
    proposedRate: 55000,
    dateSubmitted: '2026-04-05T15:30:00Z',
    coverNote: "I've overseen the planning and execution of multiple commercial spaces. While standard structural design is not my absolute primary focus, I can definitely sign and seal the requirements for a 5-story building and collaborate with your architect.",
    status: 'Pending'
  },
  {
    id: 3,
    engineerId: 11,
    engineerName: 'Mark Villanueva',
    engineerInitials: 'MV',
    engineerColor: 'emerald',
    specialization: 'Structural Engineer',
    yearsExperience: 12,
    rating: 5.0,
    reviewCount: 89,
    prcVerified: true,
    proposedRate: 85000,
    dateSubmitted: '2026-04-04T08:15:00Z',
    coverNote: "Good day! I am a senior structural consultant and specialize strictly in high-rise and mid-rise load-bearing evaluations. My rate might be higher, but I guarantee an optimized foundation design that will save you significantly on concrete and rebar costs.",
    status: 'Pending'
  },
  {
    id: 4,
    engineerId: 7,
    engineerName: 'Roberto Garcia',
    engineerInitials: 'RG',
    engineerColor: 'amber',
    specialization: 'Project Supervision',
    yearsExperience: 3,
    rating: 4.5,
    reviewCount: 6,
    prcVerified: false,
    proposedRate: 40000,
    dateSubmitted: '2026-04-06T14:20:00Z',
    coverNote: "I'm a newly licensed engineer eager to build my portfolio. I can dedicate my full time to your structural plans at a very competitive rate.",
    status: 'Rejected'
  },
  {
    id: 5,
    engineerId: 15,
    engineerName: 'Isabel Torres',
    engineerInitials: 'IT',
    engineerColor: 'violet',
    specialization: 'Structural Engineer',
    yearsExperience: 7,
    rating: 4.8,
    reviewCount: 31,
    prcVerified: true,
    proposedRate: 62000,
    dateSubmitted: '2026-04-03T11:45:00Z',
    coverNote: "Attached is my proposal. I've designed three mixed-use buildings in the past two years, all fully compliant and permitted. I can turn these plans around in exactly 3 weeks from contract signing.",
    status: 'Shortlisted'
  }
];

export default function ViewProposalsPage({ params }: { params: Promise<{ jobId: string }> | { jobId: string } }) {
  const { jobId } = 'then' in params ? use(params) : params;
  
  const [proposals, setProposals] = useState<ExtendedProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Most Recent');
  const [expandedNotes, setExpandedNotes] = useState<Record<string | number, boolean>>({});
  
  // Chat Sliding Panel State
  const [activeChatEngineer, setActiveChatEngineer] = useState<ExtendedProposal | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const fetchProposals = async () => {
     try {
        const res = await fetch(`/api/applications?job_id=${jobId}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        
        // Map raw DB layout to UI extended map
        const mapped = (data.applications || []).map((app: any) => {
           // Safely grab nested engineer profile stats or default
           const eng = app.engineer || {};
           const name = eng.full_name || 'Unknown Engineer';
           const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase();
           
           return {
              id: app.id,
              engineerId: app.engineer_id || eng.id || 'err',
              engineerName: name,
              engineerInitials: initials,
              engineerColor: 'blue', 
              specialization: eng.specializations?.[0] || 'Engineer',
              yearsExperience: eng.years_experience || 0,
              rating: eng.average_rating || 0,
              reviewCount: eng.total_reviews || 0,
              prcVerified: eng.prc_verified || false,
              proposedRate: app.proposed_rate || 0,
              dateSubmitted: app.created_at || new Date().toISOString(),
              coverNote: app.cover_note || '',
              status: (app.status || 'pending').charAt(0).toUpperCase() + String(app.status || 'pending').slice(1)
           }
        });
        setProposals(mapped);
     } catch (err) {
        console.error(err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
     if (jobId) fetchProposals();
  }, [jobId]);

  const updateStatus = async (id: string | number, newStatus: string) => {
     const dbStatus = newStatus.toLowerCase();
     const uiStatus = newStatus;
     
     // Optimistic updates catching native DB limits
     setProposals(prev => prev.map(p => p.id === id ? { ...p, status: uiStatus } : p));
     
     try {
       await fetch(`/api/applications/${id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status: dbStatus })
       });
       // Optional: fetchProposals() to ensure sync 
       fetchProposals();
     } catch (err) {
       console.error(err);
       // Revert on error
       fetchProposals();
     }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Shortlisted') return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">Shortlisted</span>;
    if (status === 'Hired') return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">Hired</span>;
    if (status === 'Rejected') return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">Rejected</span>;
    return null;
  };

  // Derived filtered & sorted list
  const filteredProposals = proposals
    .filter(p => filter === 'All' ? true : p.status === filter)
    .sort((a, b) => {
      if (sort === 'Most Recent') return new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
      if (sort === 'Lowest Rate') return a.proposedRate - b.proposedRate;
      if (sort === 'Highest Rated') return b.rating - a.rating;
      return 0;
    });

  const toggleNote = (id: string | number) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const mapColor = (color: string) => {
     const colorMap: Record<string, string> = {
       blue: 'text-blue-700 bg-blue-100',
       sky: 'text-sky-700 bg-sky-100',
       emerald: 'text-emerald-700 bg-emerald-100',
       amber: 'text-amber-700 bg-amber-100',
       violet: 'text-violet-700 bg-violet-100'
     };
     return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 relative overflow-x-hidden">
      
      {/* Back navigation & Header */}
      <div className="mb-8 mt-2">
        <Link href="/dashboard/client" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition mb-4">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight leading-tight mb-2">
              {mockJobDetails.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
               <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{mockJobDetails.status}</span>
               <span>Posted {formatDate(mockJobDetails.postedDate)}</span>
               <span className="font-semibold text-indigo-700">{mockJobDetails.proposalsCount} Proposals Received</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sticky top-0 bg-slate-50 py-3 z-10 border-y border-slate-200">
         <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['All', 'Pending', 'Shortlisted', 'Hired', 'Rejected'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${filter === f ? 'bg-indigo-950 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                {f}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-2 shrink-0">
           <span className="text-sm font-medium text-slate-500">Sort by:</span>
           <div className="relative">
             <select 
               value={sort} 
               onChange={(e) => setSort(e.target.value)}
               className="appearance-none pl-4 pr-10 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
             >
               <option value="Most Recent">Most Recent</option>
               <option value="Lowest Rate">Lowest Rate</option>
               <option value="Highest Rated">Highest Rated</option>
             </select>
             <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
         </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((proposal) => (
            <div key={proposal.id} className={`bg-white rounded-xl border p-5 sm:p-6 shadow-sm transition-all ${proposal.status === 'Shortlisted' ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'}`}>
               <div className="flex flex-col lg:flex-row gap-6">
                 
                 {/* Left Column: Engineer Info */}
                 <div className="flex-1 min-w-0 flex gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${mapColor(proposal.engineerColor)}`}>
                      {proposal.engineerInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                         <div className="flex items-center gap-2">
                            <Link href={`/engineers/${proposal.engineerId}`} className="text-lg font-bold text-slate-900 hover:text-blue-600 transition truncate">
                              Engr. {proposal.engineerName}
                            </Link>
                            {proposal.prcVerified && (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded" title="PRC License Verified">
                                <ShieldCheck size={12}/> Verified
                              </span>
                            )}
                         </div>
                         {/* Status Badge Positioned Top Right */}
                         <div className="shrink-0">{getStatusBadge(proposal.status)}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mb-3">
                        <span className="font-semibold text-slate-700">{proposal.specialization}</span>
                        <span>{proposal.yearsExperience} yrs experience</span>
                        <div className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star size={14} className="fill-amber-500" />
                          <span>{proposal.rating}</span>
                          <span className="text-slate-400 text-xs font-normal">({proposal.reviewCount})</span>
                        </div>
                      </div>

                      {/* Cover Note Section */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover Note</h4>
                        <p className={`text-sm text-slate-700 leading-relaxed ${expandedNotes[proposal.id] ? '' : 'line-clamp-2'}`}>
                          {proposal.coverNote}
                        </p>
                        {proposal.coverNote.length > 150 && (
                          <button onClick={() => toggleNote(proposal.id)} className="text-xs font-semibold text-blue-600 hover:underline mt-1">
                            {expandedNotes[proposal.id] ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    </div>
                 </div>

                 {/* Right Column: Rate Context & Action Buttons */}
                 <div className="lg:w-64 shrink-0 flex flex-col justify-between pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
                    <div className="mb-4 flex flex-row lg:flex-col items-center justify-between lg:items-start text-right lg:text-left">
                       <div>
                         <div className="text-sm font-medium text-slate-500 mb-1">Proposed Rate</div>
                         <div className="text-2xl font-extrabold text-slate-900">₱{proposal.proposedRate.toLocaleString()}</div>
                       </div>
                       <div className="text-xs text-slate-400 mt-2">
                         Submitted: {formatDate(proposal.dateSubmitted)}
                       </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {proposal.status !== 'Shortlisted' && proposal.status !== 'Hired' && (
                          <button onClick={() => updateStatus(proposal.id, 'Shortlisted')} className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20">
                            Shortlist
                          </button>
                        )}
                        <button onClick={() => setActiveChatEngineer(proposal)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2">
                          <MessageSquare size={16} /> Message
                        </button>
                      </div>
                      <Link href={`/engineers/${proposal.engineerId}`} className="block w-full text-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 transition">
                         View Full Profile
                      </Link>
                      {proposal.status !== 'Rejected' && (
                         <button onClick={() => updateStatus(proposal.id, 'Rejected')} className="text-xs font-semibold text-slate-400 hover:text-rose-600 mt-1 transition">
                           Reject proposal
                         </button>
                      )}
                    </div>
                 </div>

               </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <User size={32} className="text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">No proposals found</h3>
             <p className="text-slate-500">There are no proposals matching this exact filter criterion.</p>
          </div>
        )}
      </div>

      {/* Messaging Slide-Over Panel */}
      {/* Overlay Background */}
      {activeChatEngineer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity" onClick={() => setActiveChatEngineer(null)}></div>
      )}
      
      {/* Slide Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-[110] transform transition-transform duration-300 ease-in-out flex flex-col ${activeChatEngineer ? 'translate-x-0' : 'translate-x-full'}`}>
         
         {activeChatEngineer && (
           <>
             {/* Slide Header */}
             <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${mapColor(activeChatEngineer.engineerColor)}`}>
                    {activeChatEngineer.engineerInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Engr. {activeChatEngineer.engineerName}</h3>
                    <p className="text-[10px] text-slate-500">{activeChatEngineer.specialization}</p>
                  </div>
                </div>
                <button onClick={() => setActiveChatEngineer(null)} className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-md transition shadow-sm"><X size={18}/></button>
             </div>

             {/* Slide Content / Chat Log */}
             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {/* Context Card inside chat */}
                <div className="p-4 bg-white border border-blue-100 rounded-xl shadow-sm text-center">
                   <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Proposal Subject</p>
                   <p className="text-sm font-bold text-slate-800">{mockJobDetails.title}</p>
                   <div className="text-xs text-slate-500 mt-1">Proposed Rate: ₱{activeChatEngineer.proposedRate.toLocaleString()}</div>
                </div>

                {/* Mock Chat Messages */}
                <div className="flex flex-col gap-4">
                   <div className="flex items-end gap-2 max-w-[85%] self-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${mapColor(activeChatEngineer.engineerColor)}`}>
                        {activeChatEngineer.engineerInitials}
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-700 shadow-sm">
                        Hello! Thank you for reviewing my application. Do you have any questions regarding my cover note?
                      </div>
                   </div>
                   <div className="text-center text-[10px] font-bold text-slate-400 my-2 uppercase">Today</div>
                </div>
             </div>

             {/* Slide Input Area */}
             <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <form 
                  onSubmit={(e) => { e.preventDefault(); setChatMessage(''); }} 
                  className="flex items-end gap-2"
                >
                   <textarea
                     value={chatMessage}
                     onChange={(e) => setChatMessage(e.target.value)}
                     placeholder="Type a message..."
                     className="flex-1 max-h-32 min-h-[44px] p-3 bg-slate-50 border border-slate-300 rounded-2xl resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition"
                     rows={1}
                   />
                   <button type="submit" disabled={!chatMessage.trim()} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0 shadow-sm">
                     <Send size={18} />
                   </button>
                </form>
             </div>
           </>
         )}

      </div>
    </div>
  );
}

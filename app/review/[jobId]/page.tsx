'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const QUICK_TAGS = [
  "Responsive",
  "Great communicator",
  "Highly skilled",
  "On time",
  "Would hire again",
  "Detailed work",
  "Needs improvement"
];

// Mock data representing the person being reviewed
const mockReviewee = {
  name: 'Engr. Juan Dela Cruz',
  initials: 'JD',
  role: 'Structural Engineer',
  color: 'bg-blue-100 text-blue-700',
  jobTitle: 'Structural Design for 5-Story Mixed-Use Building'
};

export default function LeaveReviewPage(props: { params: Promise<{ jobId: string }> }) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const reviewee_id = searchParams.get('reviewee');

  const [overallRating, setOverallRating] = useState<number>(0);
  const [hoverOverall, setHoverOverall] = useState<number>(0);
  
  const [catRatings, setCatRatings] = useState({
    Communication: 0,
    Professionalism: 0,
    Quality: 0,
    Delivery: 0
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleCatRating = (category: keyof typeof catRatings, val: number) => {
    setCatRatings(prev => ({ ...prev, [category]: val }));
    if (errors[category]) setErrors(prev => ({ ...prev, [category]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (overallRating === 0) newErrors.overall = "Overall rating is required.";
    if (catRatings.Communication === 0) newErrors.Communication = "Required";
    if (catRatings.Professionalism === 0) newErrors.Professionalism = "Required";
    if (catRatings.Quality === 0) newErrors.Quality = "Required";
    if (catRatings.Delivery === 0) newErrors.Delivery = "Required";
    
    if (feedback.trim().length < 30) {
      newErrors.feedback = `Review must be at least 30 characters (currently ${feedback.trim().length}).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewee_id) {
       setErrors(prev => ({ ...prev, overall: "Missing exact reviewee identity constraint." }));
       return;
    }
    
    if (validateForm()) {
       setIsSubmitting(true);
       try {
           const res = await fetch('/api/reviews', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  reviewee_id,
                  job_id: params.jobId,
                  rating: overallRating,
                  comment: feedback,
                  tags: selectedTags,
                  rating_communication: catRatings.Communication,
                  rating_professionalism: catRatings.Professionalism,
                  rating_quality: catRatings.Quality,
                  rating_timeliness: catRatings.Delivery
               })
           });
           
           setIsSubmitting(false);
           if (!res.ok) {
              const data = await res.json();
              if (res.status === 409) {
                 setErrors({ overall: "You have already reviewed this person for this project." });
              } else {
                 setErrors({ overall: data.error || "Failed to submit review." });
              }
              return;
           }
           
           setSuccess(true);
           window.scrollTo({ top: 0, behavior: 'smooth' });
           
       } catch (err) {
           setIsSubmitting(false);
           setErrors({ overall: "Failed to submit review natively. Try again." });
       }
    }
  };

  // Helper component for star rating
  const StarRating = ({ 
    rating, 
    setRating, 
    size = 24 
  }: { 
    rating: number, 
    setRating: (val: number) => void, 
    size?: number 
  }) => {
    const [hover, setHover] = useState(0);
    return (
      <div className="flex items-center gap-1">
         {[1, 2, 3, 4, 5].map((star) => (
           <Star
             key={star}
             size={size}
             className={`cursor-pointer transition ${star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
             onMouseEnter={() => setHover(star)}
             onMouseLeave={() => setHover(0)}
             onClick={() => setRating(star)}
           />
         ))}
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 max-w-lg w-full text-center animate-fade-in relative overflow-hidden">
           
           <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-50"></div>
              <div className="relative w-full h-full bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                 <CheckCircle2 size={48} className="text-white" />
              </div>
           </div>

           <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 mb-3">Review Submitted!</h2>
           <p className="text-slate-500 mb-8">Thank you for sharing your experience. Your feedback helps build trust within the BuildLinkPH community.</p>
           
           <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-left">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Summary</h4>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                 <span className="text-sm font-semibold text-slate-700">Overall Rating</span>
                 <div className="flex">
                   {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className={s <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />)}
                 </div>
              </div>
              <p className="text-sm text-slate-700 italic border-l-4 border-slate-300 pl-3">"{feedback}"</p>
           </div>

           <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/client" className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-center text-sm">
                Back to Dashboard
              </Link>
              <Link href={`/jobs/${params.jobId}`} className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 text-center text-sm">
                View Job
              </Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 py-12 px-4 sm:px-6">
       <div className="max-w-2xl mx-auto">
          
          <Link href="/dashboard/client" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition mb-6">
            <ArrowLeft size={16} /> Go Back
          </Link>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
             
             {/* Header Context */}
             <div className="bg-indigo-950 p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Star size={120} className="fill-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-6 relative z-10">Rate Your Experience</h1>
                
                <div className="inline-flex items-center gap-4 bg-white/10 border border-white/20 p-4 rounded-xl backdrop-blur-sm relative z-10">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${mockReviewee.color}`}>
                     {mockReviewee.initials}
                   </div>
                   <div className="text-left">
                     <h3 className="text-white font-bold">{mockReviewee.name}</h3>
                     <p className="text-indigo-200 text-xs">{mockReviewee.role}</p>
                   </div>
                </div>
             </div>
             
             <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-slate-600">Project:</span>
                <span className="text-slate-500 truncate font-medium ml-4">{mockReviewee.jobTitle}</span>
             </div>

             {/* Form */}
             <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
                
                {/* Overall Rating */}
                <div className="text-center">
                   <label className="block text-base font-bold text-slate-900 mb-2">Overall, how was your experience?</label>
                   <div className="flex items-center justify-center gap-2 mb-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <Star
                         key={star}
                         size={48}
                         className={`cursor-pointer transition-all duration-200 transform hover:scale-110 ${star <= (hoverOverall || overallRating) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]' : 'text-slate-200'}`}
                         onMouseEnter={() => setHoverOverall(star)}
                         onMouseLeave={() => setHoverOverall(0)}
                         onClick={() => {
                           setOverallRating(star);
                           if (errors.overall) setErrors(prev => ({ ...prev, overall: '' }));
                         }}
                       />
                     ))}
                   </div>
                   {errors.overall && <p className="error-text text-sm flex items-center justify-center gap-1 text-rose-600 animate-fade-in"><AlertCircle size={14} />{errors.overall}</p>}
                </div>

                {/* Sub-categories */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                   <h4 className="text-sm font-bold text-slate-900 mb-6">Rate specific aspects</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.keys(catRatings).map((cat) => (
                        <div key={cat} className="flex flex-col gap-2">
                           <div className="flex items-center justify-between">
                              <label className="text-sm font-semibold text-slate-700">{cat === 'Quality' ? 'Quality of Work' : cat === 'Delivery' ? 'On-time Delivery' : cat}</label>
                              {errors[cat] && <span className="text-[10px] text-rose-600 font-bold bg-rose-100 px-2 rounded-full animate-fade-in">!</span>}
                           </div>
                           <StarRating 
                             rating={catRatings[cat as keyof typeof catRatings]} 
                             setRating={(val) => handleCatRating(cat as keyof typeof catRatings, val)} 
                             size={20}
                           />
                        </div>
                      ))}
                   </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Quick Tags <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span></label>
                  <div className="flex flex-wrap gap-2">
                     {QUICK_TAGS.map(tag => (
                       <button
                         key={tag}
                         type="button"
                         onClick={() => handleTagToggle(tag)}
                         className={`px-4 py-2 rounded-full text-xs font-bold transition border ${
                           selectedTags.includes(tag) 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                         }`}
                       >
                         {tag}
                       </button>
                     ))}
                  </div>
                </div>

                {/* Written Review */}
                <div>
                   <div className="flex items-center justify-between mb-2">
                     <label className="text-sm font-bold text-slate-900">Written Review <span className="text-rose-500">*</span></label>
                     <span className={`text-xs font-bold ${feedback.length < 30 ? 'text-amber-500' : 'text-emerald-500'}`}>{feedback.length} / 30 min</span>
                   </div>
                   <textarea
                     value={feedback}
                     onChange={(e) => {
                       setFeedback(e.target.value);
                       if (errors.feedback && e.target.value.length >= 30) setErrors(prev => ({ ...prev, feedback: '' }));
                     }}
                     placeholder="Tell us what you liked (or didn't like) about working with this engineer..."
                     rows={5}
                     className={`w-full p-4 bg-slate-50 border ${errors.feedback ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} rounded-xl resize-none outline-none transition text-sm text-slate-800`}
                   ></textarea>
                   {errors.feedback && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-2 animate-fade-in"><AlertCircle size={14} />{errors.feedback}</p>}
                </div>

                {/* Submit Action */}
                <div className="pt-6 border-t border-slate-100">
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full sm:w-auto sm:min-w-[200px] float-right py-4 px-8 bg-blue-600 text-white font-extrabold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                   >
                     {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                     ) : 'Submit Review'}
                   </button>
                   <div className="clear-both"></div>
                </div>
             </form>
          </div>
       </div>
    </div>
  );
}

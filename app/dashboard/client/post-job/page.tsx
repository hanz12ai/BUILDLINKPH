'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const PHILIPPINE_PROVINCES = [
  "Metro Manila", "Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Antique", "Apayao", "Aurora", "Basilan",
  "Bataan", "Batanes", "Batangas", "Benguet", "Biliran", "Bohol", "Bukidnon", "Bulacan", "Cagayan", "Camarines Norte",
  "Camarines Sur", "Camiguin", "Capiz", "Catanduanes", "Cavite", "Cebu", "Cotabato", "Davao de Oro", "Davao del Norte",
  "Davao del Sur", "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Eastern Samar", "Guimaras", "Ifugao",
  "Ilocos Norte", "Ilocos Sur", "Iloilo", "Isabela", "Kalinga", "La Union", "Laguna", "Lanao del Norte", "Lanao del Sur",
  "Leyte", "Maguindanao del Norte", "Maguindanao del Sur", "Marinduque", "Masbate", "Misamis Occidental", "Misamis Oriental",
  "Mountain Province", "Negros Occidental", "Negros Oriental", "Northern Samar", "Nueva Ecija", "Nueva Vizcaya", "Occidental Mindoro",
  "Oriental Mindoro", "Palawan", "Pampanga", "Pangasinan", "Quezon", "Quirino", "Rizal", "Romblon", "Samar", "Sarangani",
  "Siquijor", "Sorsogon", "South Cotabato", "Southern Leyte", "Sultan Kudarat", "Sulu", "Surigao del Norte", "Surigao del Sur",
  "Tarlac", "Tawi-Tawi", "Zambales", "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"
];

const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Renovation', 'Other'];
const DISCIPLINES = ['Structural', 'Civil', 'Geotechnical', 'Sanitary', 'Geodetic', 'Project Supervision'];
const WORK_TYPES = ['Design/Plans', 'Site Supervision', 'Inspection', 'Consulting', 'Permit Processing'];
const DURATIONS = ['Less than 1 week', '1–4 weeks', '1–3 months', '3–6 months', '6+ months'];
const PAYMENT_TYPES = ['Fixed price', 'Hourly rate', 'Open to proposals'];

export default function PostJobPage() {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    projectTypes: [] as string[],
    disciplines: [] as string[],
    workTypes: [] as string[],
    province: '',
    city: '',
    startDate: '',
    deadline: '',
    duration: '',
    paymentType: '',
    budgetMin: '',
    budgetMax: '',
    description: '',
    minExperience: '',
    prcRequired: '',
    additionalReqs: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generate a draft ID natively securing dynamic relationships
  const [draftJobId] = useState(() => `draft_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  // File Upload State
  type UploadedFile = { name: string; url: string; path: string; isUploading: boolean; error?: string };
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleToggleArray = (field: 'projectTypes' | 'disciplines' | 'workTypes', value: string) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(value)) {
        return { ...prev, [field]: array.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...array, value] };
      }
    });
    // Clear error if they select something
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on interact
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const uploadJobAttachments = async (newFiles: File[]) => {
      newFiles.forEach(async (file) => {
         if (file.size > 10 * 1024 * 1024) {
             setFiles(prev => [...prev, { name: file.name, url: '', path: '', isUploading: false, error: 'File too large (Max 10MB).' }]);
             return;
         }
         const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
         if (!allowedTypes.includes(file.type)) {
             setFiles(prev => [...prev, { name: file.name, url: '', path: '', isUploading: false, error: 'File type not allowed.' }]);
             return;
         }

         // Valid file, start uploading
         const fileEntry = { name: file.name, url: '', path: '', isUploading: true };
         setFiles(prev => [...prev, fileEntry]);

         const formData = new FormData();
         formData.append('file', file);
         formData.append('type', 'job_attachment');
         formData.append('job_id', draftJobId);

         try {
             const res = await fetch('/api/upload', { method: 'POST', body: formData });
             const data = await res.json();
             
             if (!res.ok) throw new Error(data.error || 'Upload failed');
             
             setFiles(prev => prev.map(f => f.name === file.name ? { ...f, isUploading: false, url: data.url, path: data.path } : f));
         } catch (err: any) {
             setFiles(prev => prev.map(f => f.name === file.name ? { ...f, isUploading: false, error: err.message } : f));
         }
      });
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
       uploadJobAttachments(Array.from(e.dataTransfer.files));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Check required fields
    if (!formData.title.trim()) newErrors.title = "Job title is required.";
    if (formData.projectTypes.length === 0) newErrors.projectTypes = "Select at least one project type.";
    if (formData.disciplines.length === 0) newErrors.disciplines = "Select at least one engineering discipline.";
    if (formData.workTypes.length === 0) newErrors.workTypes = "Select at least one work type.";
    
    if (!formData.province) newErrors.province = "Province is required.";
    if (!formData.city.trim()) newErrors.city = "City/Municipality is required.";
    if (!formData.startDate) newErrors.startDate = "Target start date is required.";
    if (!formData.duration) newErrors.duration = "Project duration is required.";
    
    if (!formData.paymentType) newErrors.paymentType = "Payment type is required.";
    
    if (!formData.description) {
      newErrors.description = "Description is required.";
    } else if (formData.description.length < 80) {
      newErrors.description = `Description is too short. Minimum 80 characters (currently ${formData.description.length}).`;
    }

    if (!formData.minExperience) newErrors.minExperience = "Please select minimum experience.";
    if (!formData.prcRequired) newErrors.prcRequired = "Please select PRC license preference.";

    setErrors(newErrors);
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.error-text');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Sections config for progress bar
  const sections = [
    { title: "Basics" },
    { title: "Location & Timeline" },
    { title: "Budget" },
    { title: "Description" },
    { title: "Requirements" }
  ];

  if (success) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto text-center mt-10">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-indigo-950 mb-2">Job Posted Successfully!</h2>
        <p className="text-slate-600 mb-8">Your job post is now live and visible to civil engineers on BuildLinkPH.</p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard/client" className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition">
            Go to Dashboard
          </Link>
          <Link href="/jobs/101" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            View Job Post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/client" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">Post a New Job</h1>
          <p className="text-slate-500 text-sm mt-1">Fill out the details below to find the perfect civil engineer for your project.</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center min-w-max gap-2 px-1">
          {sections.map((sec, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                {sec.title}
              </div>
              {idx < sections.length - 1 && <div className="w-8 h-px bg-slate-200 mx-2"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basics */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-indigo-950 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">1</span>
             Project Basics
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Job Title <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full p-3 bg-slate-50 border ${errors.title ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} rounded-lg focus:ring-4 outline-none transition`}
                placeholder="e.g. Structural Design for 5-Story Commercial Building" 
              />
              {errors.title && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-1"><AlertCircle size={14} />{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Project Type <span className="text-rose-500">*</span> <span className="text-normal font-normal text-slate-400 ml-2">(Select all that apply)</span></label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPES.map(pt => (
                  <button 
                    key={pt} type="button"
                    onClick={() => handleToggleArray('projectTypes', pt)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition border ${formData.projectTypes.includes(pt) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
              {errors.projectTypes && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-2"><AlertCircle size={14} />{errors.projectTypes}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Engineering Discipline Needed <span className="text-rose-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {DISCIPLINES.map(d => (
                  <button 
                    key={d} type="button"
                    onClick={() => handleToggleArray('disciplines', d)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition border ${formData.disciplines.includes(d) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {errors.disciplines && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-2"><AlertCircle size={14} />{errors.disciplines}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Work Type <span className="text-rose-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {WORK_TYPES.map(wt => (
                  <button 
                    key={wt} type="button"
                    onClick={() => handleToggleArray('workTypes', wt)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition border ${formData.workTypes.includes(wt) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  >
                    {wt}
                  </button>
                ))}
              </div>
              {errors.workTypes && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-2"><AlertCircle size={14} />{errors.workTypes}</p>}
            </div>
          </div>
        </section>

        {/* Section 2: Location & Timeline */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-indigo-950 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">2</span>
             Location & Timeline
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Province <span className="text-rose-500">*</span></label>
              <select name="province" value={formData.province} onChange={handleInputChange} className={`w-full p-3 bg-slate-50 border ${errors.province ? 'border-rose-300' : 'border-slate-200'} rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition text-slate-700`}>
                <option value="">Select Province</option>
                {PHILIPPINE_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.province && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-1"><AlertCircle size={14} />{errors.province}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">City / Municipality <span className="text-rose-500">*</span></label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Quezon City" className={`w-full p-3 bg-slate-50 border ${errors.city ? 'border-rose-300' : 'border-slate-200'} rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition`} />
              {errors.city && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-1"><AlertCircle size={14} />{errors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Target Start Date <span className="text-rose-500">*</span></label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={`w-full p-3 bg-slate-50 border ${errors.startDate ? 'border-rose-300' : 'border-slate-200'} rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition text-slate-700`} />
              {errors.startDate && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-1"><AlertCircle size={14} />{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Application Deadline <span className="font-normal text-slate-400 ml-1">(Optional)</span></label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition text-slate-700" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Project Duration <span className="text-rose-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(dur => (
                <button 
                  key={dur} type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, duration: dur }));
                    if (errors.duration) setErrors(prev => ({ ...prev, duration: '' }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition border ${formData.duration === dur ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  {dur}
                </button>
              ))}
            </div>
            {errors.duration && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-2"><AlertCircle size={14} />{errors.duration}</p>}
          </div>
        </section>

        {/* Section 3: Budget */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-indigo-950 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">3</span>
             Budget Setting
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Payment Type <span className="text-rose-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_TYPES.map(type => (
                <button 
                  key={type} type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, paymentType: type }));
                    if (errors.paymentType) setErrors(prev => ({ ...prev, paymentType: '' }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition border ${formData.paymentType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.paymentType && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-2"><AlertCircle size={14} />{errors.paymentType}</p>}
          </div>

          {formData.paymentType !== 'Open to proposals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Budget (₱) <span className="font-normal text-slate-400 ml-1">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                  <input type="number" name="budgetMin" value={formData.budgetMin} onChange={handleInputChange} placeholder="0" className="w-full py-3 pl-10 pr-4 bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Maximum Budget (₱) <span className="font-normal text-slate-400 ml-1">(Optional)</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                  <input type="number" name="budgetMax" value={formData.budgetMax} onChange={handleInputChange} placeholder="0" className="w-full py-3 pl-10 pr-4 bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Description */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-indigo-950 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">4</span>
             Project Description
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Description <span className="text-rose-500">*</span></label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              rows={8}
              placeholder="Describe your project, the deliverables necessary, and any unique constraints..."
              className={`w-full p-4 bg-slate-50 border ${errors.description ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'} rounded-lg focus:ring-4 outline-none transition resize-none`}
            ></textarea>
            <div className="flex justify-between items-center mt-2">
               {errors.description ? (
                 <p className="error-text text-sm flex items-center gap-1 text-rose-600"><AlertCircle size={14} />{errors.description}</p>
               ) : (
                 <p className="text-xs text-slate-500">Provide as much detail as possible to get accurate proposals.</p>
               )}
               <span className={`text-xs font-bold ${formData.description.length < 80 ? 'text-amber-500' : 'text-emerald-500'}`}>{formData.description.length} / 80 min chars</span>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Attachments <span className="font-normal text-slate-400 ml-1">(Optional)</span></label>
             <div 
               onDragOver={(e) => e.preventDefault()}
               onDrop={handleFileDrop}
               className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer"
               onClick={() => fileInputRef.current?.click()}
             >
               <input 
                 type="file" 
                 hidden 
                 ref={fileInputRef} 
                 multiple 
                 accept=".pdf,.jpg,.jpeg,.png" 
                 onChange={(e) => {
                   if (e.target.files && e.target.files.length > 0) {
                      uploadJobAttachments(Array.from(e.target.files));
                   }
                   if (fileInputRef.current) fileInputRef.current.value = "";
                 }} 
               />
               <UploadCloud className="mx-auto text-slate-400 mb-3" size={32} />
               <p className="text-sm font-bold text-slate-700 mb-1">Click to upload or drag and drop</p>
               <p className="text-xs text-slate-500">PDF, JPG, or PNG (max. 10MB each)</p>
             </div>
             
             {/* Selected Files List */}
             {files.length > 0 && (
               <div className="mt-4 space-y-2">
                 {files.map((file, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                     <div className="flex items-center gap-3 w-full overflow-hidden">
                        {file.isUploading ? (
                           <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                        ) : file.error ? (
                           <AlertCircle size={16} className="text-rose-500 shrink-0" />
                        ) : (
                           <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        )}
                        <span className="truncate text-slate-700 font-medium flex-1">
                           {file.name}
                           {file.error && <span className="text-rose-500 ml-2 text-xs font-bold">({file.error})</span>}
                        </span>
                     </div>
                     <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700 font-bold ml-4 shrink-0 transition">Remove</button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </section>

        {/* Section 5: Requirements */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-indigo-950 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">5</span>
             Engineer Requirements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Level of Experience <span className="text-rose-500">*</span></label>
              <select name="minExperience" value={formData.minExperience} onChange={handleInputChange} className={`w-full p-3 bg-slate-50 border ${errors.minExperience ? 'border-rose-300' : 'border-slate-200'} rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition text-slate-700`}>
                <option value="">Select requirement</option>
                <option value="Any">Any Experience</option>
                <option value="1+">1+ Years</option>
                <option value="3+">3+ Years</option>
                <option value="5+">5+ Years</option>
                <option value="10+">10+ Years</option>
              </select>
              {errors.minExperience && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-1"><AlertCircle size={14} />{errors.minExperience}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">PRC License Required? <span className="text-rose-500">*</span></label>
              <select name="prcRequired" value={formData.prcRequired} onChange={handleInputChange} className={`w-full p-3 bg-slate-50 border ${errors.prcRequired ? 'border-rose-300' : 'border-slate-200'} rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition text-slate-700`}>
                <option value="">Select preference</option>
                <option value="Yes - licensed only">Yes — Licensed Only (Strict)</option>
                <option value="Preferred">Preferred, but not required</option>
                <option value="Not required">Not required</option>
              </select>
              {errors.prcRequired && <p className="error-text text-sm flex items-center gap-1 text-rose-600 mt-1"><AlertCircle size={14} />{errors.prcRequired}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Additional Requirements <span className="font-normal text-slate-400 ml-1">(Optional)</span></label>
            <input type="text" name="additionalReqs" value={formData.additionalReqs} onChange={handleInputChange} placeholder="e.g. Must have experience with high-rise buildings." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition" />
          </div>
        </section>

        {/* Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 p-4 sm:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
           <div className="max-w-4xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
             <button type="button" className="w-full sm:w-auto px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition">
               Save as Draft
             </button>
             <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
               {isSubmitting ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Posting...
                 </>
               ) : (
                 'Post Job'
               )}
             </button>
           </div>
        </div>

      </form>
    </div>
  );
}

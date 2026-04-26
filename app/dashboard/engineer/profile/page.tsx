'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  User, 
  Briefcase, 
  Image as ImageIcon, 
  ShieldCheck, 
  Camera, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit2, 
  UploadCloud, 
  X,
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

const SPECIALIZATIONS = ['Structural', 'Civil', 'Geotechnical', 'Sanitary', 'Geodetic', 'Project Supervision'];
const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Renovation'];

export default function EditProfilePage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: '', type: 'success' });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingPrc, setIsUploadingPrc] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    fullName: 'Juan Dela Cruz',
    headline: 'Licensed Structural Engineer | 8 years experience',
    bio: 'Highly experienced in designing resilient multi-story commercial and residential buildings across the Philippines.',
    city: 'Quezon City',
    province: 'Metro Manila',
    hourlyRate: 600,
    isAvailable: true,
  });

  // Professional State
  const [profInfo, setProfInfo] = useState({
    specializations: ['Structural', 'Civil'] as string[],
    yearsExperience: 8,
    projectTypes: ['Commercial', 'Residential'] as string[],
  });
  
  const [skills, setSkills] = useState<string[]>(['AutoCAD', 'ETABS', 'STAAD.Pro', 'SAFE']);
  const [skillInput, setSkillInput] = useState('');

  // Portfolio State
  const [portfolioItems, setPortfolioItems] = useState([
    { id: 1, title: '5-Story Commercial Plaza', type: 'Commercial', year: 2023 },
    { id: 2, title: 'Bautista Residence', type: 'Residential', year: 2022 },
  ]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);

  // PRC State
  const [prcInfo, setPrcInfo] = useState({
    prcNumber: '0123456',
    status: 'Pending',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      setUser(authData.user);

      // Fetch user from public.users to get full name
      const { data: userData } = await supabase.from('users').select('full_name').eq('id', authData.user.id).single();

      const { data } = await supabase
        .from('engineer_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      const profile = data as any;

      if (profile) {
        setBasicInfo(prev => ({
           ...prev,
           fullName: userData?.full_name || authData.user.user_metadata?.full_name || 'Engineer',
           headline: profile.headline || '',
           bio: profile.bio || '',
           city: profile.city || '',
           province: profile.province || '',
           hourlyRate: profile.hourly_rate || 0,
        }));
        setProfInfo(prev => ({
           ...prev,
           specializations: profile.specializations || [],
           yearsExperience: profile.years_experience || 0,
           projectTypes: profile.project_types || [],
        }));
        setSkills(profile.skills || []);
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
      } else if (userData) {
         setBasicInfo(prev => ({ ...prev, fullName: userData.full_name || 'Engineer' }));
      }
    };
    fetchProfile();
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastConfig({ message: msg, type });
    setTimeout(() => setToastConfig({ message: '', type: 'success' }), 3000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     if (file.size > 5 * 1024 * 1024) {
        triggerToast("Upload failed. Please try a smaller image.", "error");
        return;
     }

     const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
     if (!allowedTypes.includes(file.type)) {
        triggerToast("Upload failed. File type not allowed.", "error");
        return;
     }

     setIsUploadingAvatar(true);
     const formData = new FormData();
     formData.append('file', file);
     formData.append('type', 'avatar');

     try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error();
        
        const data = await res.json();
        setAvatarUrl(data.url);
        triggerToast('Profile picture updated!');
     } catch (err) {
        triggerToast("Upload failed. Please try a smaller image.", "error");
     } finally {
        setIsUploadingAvatar(false);
     }
  };

  const handlePrcUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     if (file.size > 10 * 1024 * 1024) {
        triggerToast("File too large. Max size is 10MB.", "error");
        return;
     }

     const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
     if (!allowedTypes.includes(file.type)) {
        triggerToast("File type not allowed.", "error");
        return;
     }

     setIsUploadingPrc(true);
     const formData = new FormData();
     formData.append('file', file);
     formData.append('type', 'prc_doc');

     try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error();
        
        setPrcInfo({ ...prcInfo, status: 'Pending Verification' });
        triggerToast('Document uploaded. Verification is pending.');
     } catch (err) {
        triggerToast("Upload failed.", "error");
     } finally {
        setIsUploadingPrc(false);
     }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
       triggerToast('You must be logged in to save.', 'error');
       return;
    }
    setIsSaving(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase.from('engineer_profiles').upsert({
         user_id: user.id,
         headline: basicInfo.headline,
         bio: basicInfo.bio,
         city: basicInfo.city,
         province: basicInfo.province,
         hourly_rate: basicInfo.hourlyRate,
         years_experience: profInfo.yearsExperience,
         specializations: profInfo.specializations,
         project_types: profInfo.projectTypes,
         skills: skills,
         avatar_url: avatarUrl || null
      });
      
      if (error) throw error;
      
      // Update full name in users table just in case
      await supabase.from('users').update({ full_name: basicInfo.fullName }).eq('id', user.id);

      triggerToast('Changes saved successfully! Your profile is now public in search.');
    } catch (err: any) {
      triggerToast('Failed to save: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArrayToggle = (field: 'specializations' | 'projectTypes', value: string) => {
    setProfInfo(prev => {
      const array = prev[field];
      if (array.includes(value)) return { ...prev, [field]: array.filter(v => v !== value) };
      return { ...prev, [field]: [...array, value] };
    });
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillInput.trim() && !skills.includes(skillInput.trim())) {
        setSkills(prev => [...prev, skillInput.trim()]);
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };


  const TABS = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'professional', label: 'Professional Details', icon: Briefcase },
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
    { id: 'prc', label: 'PRC License', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 relative">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">Edit Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your public presence and professional credentials.</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Navigation Tabs Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold transition text-left min-w-max md:min-w-0 ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
            
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <form onSubmit={handleSave} className="animate-fade-in">
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-indigo-950 mb-6">Basic Information</h2>
                  
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6 mb-8">
                    <label className="w-24 h-24 rounded-full bg-blue-100 border-2 border-dashed border-blue-300 flex items-center justify-center text-blue-600 relative group cursor-pointer overflow-hidden shrink-0">
                       {isUploadingAvatar ? (
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                          <span className="font-bold text-2xl group-hover:hidden uppercase">{basicInfo.fullName.match(/\b(\w)/g)?.join('').slice(0, 2) || 'JD'}</span>
                       )}
                       {!isUploadingAvatar && (
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Camera className="text-white" size={24} />
                         </div>
                       )}
                       <input type="file" hidden accept="image/jpeg, image/png, image/webp" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                    </label>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">Profile Picture</h3>
                      <p className="text-xs text-slate-500 mb-3">JPG, PNG or WEBP. Max size 5MB.</p>
                      <label className={`px-4 py-1.5 border border-slate-300 rounded text-sm font-bold transition inline-block cursor-pointer ${isUploadingAvatar ? 'text-slate-400 bg-slate-50' : 'text-slate-700 hover:bg-slate-50'}`}>
                        {isUploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                        <input type="file" hidden accept="image/jpeg, image/png, image/webp" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Legal Name</label>
                      <input type="text" value={basicInfo.fullName} onChange={e => setBasicInfo({...basicInfo, fullName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Professional Headline</label>
                      <input type="text" value={basicInfo.headline} onChange={e => setBasicInfo({...basicInfo, headline: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                      <p className="text-xs text-slate-500 mt-1">Include your specialization and years of experience.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Bio / Summary</label>
                      <textarea rows={4} value={basicInfo.bio} onChange={e => setBasicInfo({...basicInfo, bio: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none" required></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Province</label>
                        <select value={basicInfo.province} onChange={e => setBasicInfo({...basicInfo, province: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700" required>
                          {PHILIPPINE_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">City / Municipality</label>
                        <input type="text" value={basicInfo.city} onChange={e => setBasicInfo({...basicInfo, city: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Hourly Rate (₱)</label>
                        <input type="number" value={basicInfo.hourlyRate} onChange={e => setBasicInfo({...basicInfo, hourlyRate: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" required />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">Availability Status</label>
                         <div className="flex items-center gap-3 mt-3">
                           <button type="button" onClick={() => setBasicInfo({...basicInfo, isAvailable: true})} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition ${basicInfo.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Available</button>
                           <button type="button" onClick={() => setBasicInfo({...basicInfo, isAvailable: false})} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition ${!basicInfo.isAvailable ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Not Available</button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:px-8 bg-slate-50 rounded-b-xl flex justify-end">
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* PROFESSIONAL INFO TAB */}
            {activeTab === 'professional' && (
              <form onSubmit={handleSave} className="animate-fade-in">
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-indigo-950 mb-6">Professional Details</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Primary Specializations</label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALIZATIONS.map(spec => (
                          <button key={spec} type="button" onClick={() => handleArrayToggle('specializations', spec)} className={`px-4 py-2 rounded-full text-sm font-medium transition border ${profInfo.specializations.includes(spec) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Years of Field Experience</label>
                      <input type="number" value={profInfo.yearsExperience} onChange={e => setProfInfo({...profInfo, yearsExperience: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" required />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Past Project Types Handled</label>
                      <div className="flex flex-wrap gap-2">
                        {PROJECT_TYPES.map(type => (
                          <button key={type} type="button" onClick={() => handleArrayToggle('projectTypes', type)} className={`px-4 py-2 rounded-full text-sm font-medium transition border ${profInfo.projectTypes.includes(type) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Technical Skills & Software</label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg min-h-[100px]">
                         <div className="flex flex-wrap gap-2 mb-2">
                           {skills.map(s => (
                             <span key={s} className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 shadow-sm">
                               {s}
                               <button type="button" onClick={() => removeSkill(s)} className="text-slate-400 hover:text-rose-500"><X size={14}/></button>
                             </span>
                           ))}
                         </div>
                         <input 
                           type="text" 
                           value={skillInput}
                           onChange={e => setSkillInput(e.target.value)}
                           onKeyDown={addSkill}
                           placeholder="Type a skill and press Enter..." 
                           className="bg-transparent outline-none text-sm w-full pt-1" 
                         />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:px-8 bg-slate-50 rounded-b-xl flex justify-end">
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
              <div className="animate-fade-in">
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-indigo-950">Portfolio Gallery</h2>
                    {!showPortfolioForm && (
                      <button onClick={() => setShowPortfolioForm(true)} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition px-3 py-1.5 bg-blue-50 rounded-md">
                        <Plus size={16} /> Add Item
                      </button>
                    )}
                  </div>
                  
                  {/* View Active Items */}
                  {!showPortfolioForm ? (
                    <div className="space-y-4">
                      {portfolioItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                           <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                              <ImageIcon className="text-slate-400" size={24} />
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                             <p className="text-sm text-slate-500">{item.type} • {item.year}</p>
                           </div>
                           <div className="flex items-center gap-2">
                             <button className="p-2 text-slate-400 hover:text-blue-600 transition"><Edit2 size={18}/></button>
                             <button className="p-2 text-slate-400 hover:text-rose-600 transition"><Trash2 size={18}/></button>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Add Form */
                    <form onSubmit={(e) => { e.preventDefault(); setShowPortfolioForm(false); triggerToast('Portfolio item saved!'); }} className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-slide-in-up">
                       <h3 className="text-sm font-bold text-indigo-950 mb-4">Add New Portfolio Item</h3>
                       <div className="space-y-4 mb-6">
                         <div>
                           <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
                           <input type="text" className="w-full p-2 bg-white border border-slate-200 rounded focus:border-blue-500 outline-none" required />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-bold text-slate-700 mb-1">Project Type</label>
                             <input type="text" className="w-full p-2 bg-white border border-slate-200 rounded focus:border-blue-500 outline-none" required />
                           </div>
                           <div>
                             <label className="block text-xs font-bold text-slate-700 mb-1">Year Completed</label>
                             <input type="number" className="w-full p-2 bg-white border border-slate-200 rounded focus:border-blue-500 outline-none" required />
                           </div>
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                           <textarea rows={3} className="w-full p-2 bg-white border border-slate-200 rounded focus:border-blue-500 outline-none resize-none" required></textarea>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Image</label>
                            <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                               <div className="text-center">
                                 <UploadCloud className="mx-auto text-slate-400 mb-2" size={24} />
                                 <span className="text-sm font-medium text-slate-600">Click to upload image</span>
                               </div>
                               <input type="file" hidden />
                            </label>
                         </div>
                       </div>
                       <div className="flex gap-3 justify-end">
                         <button type="button" onClick={() => setShowPortfolioForm(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded shadow-sm hover:bg-slate-50 transition">Cancel</button>
                         <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded shadow-sm hover:bg-blue-700 transition">Save Item</button>
                       </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* PRC LICENSE TAB */}
            {activeTab === 'prc' && (
              <form onSubmit={handleSave} className="animate-fade-in">
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-indigo-950">PRC License Verification</h2>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1 ${prcInfo.status.includes('Pending') ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                      <AlertCircle size={12}/> {prcInfo.status}
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-bold text-blue-900 mb-1">Why do we need this?</h4>
                    <p className="text-xs text-blue-800">Verifying your Professional Regulation Commission (PRC) License grants you a "Verified" badge, giving clients confidence and allowing you to apply for strict, high-budget private projects. Your ID is kept securely and never publicly shared.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">PRC License Number</label>
                      <input type="text" value={prcInfo.prcNumber} onChange={e => setPrcInfo({...prcInfo, prcNumber: e.target.value})} className="w-full sm:w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none tracking-widest font-mono" required />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Upload License ID Document</label>
                       <label className={`flex items-center justify-center w-full sm:w-2/3 p-8 border-2 border-dashed ${isUploadingPrc ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'} rounded-xl cursor-pointer transition group`}>
                          <div className="text-center">
                            {isUploadingPrc ? (
                               <div className="mx-auto w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                            ) : (
                               <UploadCloud className="mx-auto text-slate-400 group-hover:text-blue-500 transition mb-3" size={32} />
                            )}
                            <span className="block text-sm font-bold text-slate-700 mb-1">{isUploadingPrc ? 'Uploading...' : 'Click to upload valid ID (Front)'}</span>
                            <span className="text-xs text-slate-500">PDF, JPG, PNG (Max 10MB)</span>
                          </div>
                          <input type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={handlePrcUpload} disabled={isUploadingPrc} />
                       </label>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:px-8 bg-slate-50 rounded-b-xl flex justify-end">
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                    {isSaving ? 'Submitting...' : 'Submit to Verification'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>

      {/* Global Toast Notification */}
      {toastConfig.message && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in-up z-50 ${toastConfig.type === 'error' ? 'bg-rose-600 shadow-rose-600/20 text-white' : 'bg-emerald-600 shadow-emerald-600/20 text-white'}`}>
           {toastConfig.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-semibold text-sm">{toastConfig.message}</span>
        </div>
      )}

    </div>
  );
}

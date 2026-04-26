'use client';

import { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Camera, 
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

export default function EditClientProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: '', type: 'success' });
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Basic Info State
  const [clientInfo, setClientInfo] = useState({
    companyName: 'Apex Development Corp.',
    contactPerson: 'Maria Santos',
    description: 'A leading real estate development company in the Philippines specializing in commercial and residential properties.',
    industry: 'Real Estate & Construction',
    companySize: '51-200 employees',
    city: 'Makati City',
    province: 'Metro Manila',
    address: '12th Floor, Apex Tower, Ayala Avenue',
    email: 'contact@apexdevcorp.com.ph',
    phone: '+63 917 123 4567',
    website: 'https://apexdevcorp.com.ph',
  });

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastConfig({ message: msg, type });
    setTimeout(() => setToastConfig({ message: '', type: 'success' }), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

     setIsUploadingLogo(true);
     const formData = new FormData();
     formData.append('file', file);
     formData.append('type', 'avatar');

     try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error();
        
        const data = await res.json();
        setLogoUrl(data.url);
        triggerToast('Company logo updated!');
     } catch (err) {
        triggerToast("Upload failed. Please try a smaller image.", "error");
     } finally {
        setIsUploadingLogo(false);
     }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerToast('Company profile saved successfully!');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 relative">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">Company Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your company information visible to engineers when you post jobs.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
        <form onSubmit={handleSave} className="animate-fade-in">
          <div className="p-6 sm:p-8 border-b border-slate-100">
            
            {/* Logo Upload */}
            <div className="flex items-center gap-6 mb-10">
              <label className="w-24 h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-500 relative group cursor-pointer overflow-hidden shrink-0">
                 {isUploadingLogo ? (
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 ) : logoUrl ? (
                    <img src={logoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                 ) : (
                    <Building className="text-slate-400 group-hover:hidden" size={32} />
                 )}
                 {!isUploadingLogo && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Camera className="text-white" size={24} />
                   </div>
                 )}
                 <input type="file" hidden accept="image/jpeg, image/png, image/webp" onChange={handleLogoUpload} disabled={isUploadingLogo} />
              </label>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Company Logo</h3>
                <p className="text-xs text-slate-500 mb-3">Square image recommended. JPG, PNG or WEBP. Max size 5MB.</p>
                <label className={`px-4 py-1.5 border border-slate-300 rounded text-sm font-bold transition inline-block cursor-pointer ${isUploadingLogo ? 'text-slate-400 bg-slate-50' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" hidden accept="image/jpeg, image/png, image/webp" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                </label>
              </div>
            </div>

            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                  <input type="text" value={clientInfo.companyName} onChange={e => setClientInfo({...clientInfo, companyName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact Person</label>
                  <input type="text" value={clientInfo.contactPerson} onChange={e => setClientInfo({...clientInfo, contactPerson: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">About the Company</label>
                <textarea rows={4} value={clientInfo.description} onChange={e => setClientInfo({...clientInfo, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none" placeholder="Briefly describe what your company does..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                  <input type="text" value={clientInfo.industry} onChange={e => setClientInfo({...clientInfo, industry: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company Size</label>
                  <select value={clientInfo.companySize} onChange={e => setClientInfo({...clientInfo, companySize: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700">
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="500+ employees">500+ employees</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-slate-400"/> Location & Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Province</label>
                    <select value={clientInfo.province} onChange={e => setClientInfo({...clientInfo, province: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700" required>
                      {PHILIPPINE_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">City / Municipality</label>
                    <input type="text" value={clientInfo.city} onChange={e => setClientInfo({...clientInfo, city: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Complete Address</label>
                  <input type="text" value={clientInfo.address} onChange={e => setClientInfo({...clientInfo, address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <Mail className="absolute left-3 top-[38px] text-slate-400" size={18} />
                    <input type="email" value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <Phone className="absolute left-3 top-[38px] text-slate-400" size={18} />
                    <input type="tel" value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Website (Optional)</label>
                    <Globe className="absolute left-3 top-[38px] text-slate-400" size={18} />
                    <input type="url" value={clientInfo.website} onChange={e => setClientInfo({...clientInfo, website: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" placeholder="https://" />
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <div className="p-4 sm:px-8 bg-slate-50 rounded-b-xl flex justify-end">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-70 shadow-sm">
              {isSaving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
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

'use client';

import { useState } from 'react';
import { 
  Bell, 
  Lock, 
  Shield, 
  CreditCard, 
  Trash2, 
  Save,
  CheckCircle2
} from 'lucide-react';

export default function ClientSettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: '', visible: false });

  // Mock State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setToastConfig({ message: 'Settings saved successfully!', visible: true });
      setTimeout(() => setToastConfig({ message: '', visible: false }), 3000);
    }, 800);
  };

  const TABS = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'danger', label: 'Danger Zone', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 relative">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences, security, and billing details.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
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
                    isActive 
                      ? tab.id === 'danger' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? (tab.id === 'danger' ? 'text-rose-600' : 'text-blue-600') : 'text-slate-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
            <form onSubmit={handleSave} className="animate-fade-in">
              <div className="p-6 sm:p-8 border-b border-slate-100">
                
                {/* NOTIFICATIONS */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-indigo-950 mb-4">Notification Preferences</h2>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-200 rounded-lg">
                      <div>
                        <h4 className="font-bold text-slate-900">Email Notifications</h4>
                        <p className="text-xs text-slate-500 mt-1">Receive updates about new proposals and messages.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailNotifs ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-200 rounded-lg">
                      <div>
                        <h4 className="font-bold text-slate-900">Marketing & Newsletters</h4>
                        <p className="text-xs text-slate-500 mt-1">Receive tips, trends, and promotional offers from BuildLinkPH.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMarketingEmails(!marketingEmails)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${marketingEmails ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${marketingEmails ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* SECURITY */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-indigo-950 mb-4">Security & Password</h2>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                          <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${twoFactorAuth ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${twoFactorAuth ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BILLING */}
                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-indigo-950 mb-4">Billing & Subscription</h2>
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-blue-800 uppercase tracking-widest mb-1">Current Plan</div>
                        <h3 className="text-2xl font-extrabold text-blue-900">Free Tier</h3>
                        <p className="text-sm text-blue-700 mt-2 max-w-sm">You currently have access to standard job postings and engineer browsing.</p>
                      </div>
                      <button type="button" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm whitespace-nowrap">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                )}

                {/* DANGER ZONE */}
                {activeTab === 'danger' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-rose-600 mb-4">Danger Zone</h2>
                    <div className="p-6 border border-rose-200 rounded-xl bg-white flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900">Deactivate Account</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">This will temporarily disable your account. Your jobs will be paused and profile hidden.</p>
                      </div>
                      <button type="button" className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition shadow-sm whitespace-nowrap">
                        Deactivate
                      </button>
                    </div>
                    <div className="p-6 border border-rose-200 rounded-xl bg-rose-50 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-rose-900">Delete Account Permanently</h4>
                        <p className="text-xs text-rose-700 mt-1 max-w-sm">Once you delete your account, there is no going back. Please be certain.</p>
                      </div>
                      <button type="button" className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition shadow-sm whitespace-nowrap flex items-center gap-2">
                        <Trash2 size={16} /> Delete Account
                      </button>
                    </div>
                  </div>
                )}

              </div>
              
              {activeTab !== 'danger' && (
                <div className="p-4 sm:px-8 bg-slate-50 rounded-b-xl flex justify-end">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-70 shadow-sm">
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {toastConfig.visible && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in-up z-50 bg-emerald-600 shadow-emerald-600/20 text-white">
          <CheckCircle2 size={20} />
          <span className="font-semibold text-sm">{toastConfig.message}</span>
        </div>
      )}

    </div>
  );
}

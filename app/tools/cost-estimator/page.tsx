'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  MapPin, 
  Building2, 
  Home, 
  Gem,
  ArrowRight,
  Info
} from 'lucide-react';

const REGIONS = [
  { label: 'NCR - National Capital Region', multiplier: 1.15 },
  { label: 'Region III - Central Luzon', multiplier: 1.0 },
  { label: 'Region IV-A - CALABARZON', multiplier: 1.1 },
  { label: 'Visayas', multiplier: 0.95 },
  { label: 'Mindanao', multiplier: 0.9 },
  { label: 'Other', multiplier: 1.0 }
];

const CONST_TYPES = [
  { id: 'economy', label: 'Economy', desc: 'Basic finishes, simple layout', range: '₱15,000 – 18,000/sqm', rate: 16500, icon: Home },
  { id: 'standard', label: 'Standard', desc: 'Average materials, standard fixtures', range: '₱20,000 – 25,000/sqm', rate: 22500, icon: Building2 },
  { id: 'semi-luxury', label: 'Semi-Luxury', desc: 'Premium tiles, custom cabinets', range: '₱30,000 – 40,000/sqm', rate: 35000, icon: Gem },
  { id: 'luxury', label: 'Luxury', desc: 'Imported materials, smart home tech', range: '₱50,000+/sqm', rate: 55000, icon: Gem }
];

export default function CostEstimatorPage() {
  const [area, setArea] = useState<number>(100);
  const [floors, setFloors] = useState<number>(1);
  const [type, setType] = useState('standard');
  const [region, setRegion] = useState(REGIONS[0].label);
  const [includeFees, setIncludeFees] = useState(true);

  // Calculation Results
  const [hasCalculated, setHasCalculated] = useState(false);
  const [estimateTotal, setEstimateTotal] = useState(0);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedType = CONST_TYPES.find(t => t.id === type) || CONST_TYPES[1];
    const selectedRegion = REGIONS.find(r => r.label === region) || REGIONS[5];

    let baseCost = area * floors * selectedType.rate * selectedRegion.multiplier;
    
    // Add professional fees if toggled (~10% addition)
    if (includeFees) {
       baseCost = baseCost * 1.1;
    }

    setEstimateTotal(baseCost);
    setHasCalculated(true);

    // If mobile, scroll to results after a short delay
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);
  };

  // Derive Min/Max bounds logic
  const minCost = estimateTotal * 0.9;
  const maxCost = estimateTotal * 1.1;

  // Breakdown Logic
  const breakdown = includeFees 
    ? [
        { label: 'Materials', pct: 55, color: '#3b82f6', value: estimateTotal * 0.55 },
        { label: 'Labor', pct: 30, color: '#10b981', value: estimateTotal * 0.30 },
        { label: 'Professional Fees', pct: 10, color: '#8b5cf6', value: estimateTotal * 0.10 },
        { label: 'Contingency', pct: 5, color: '#f59e0b', value: estimateTotal * 0.05 },
      ]
    : [
        { label: 'Materials', pct: 60, color: '#3b82f6', value: estimateTotal * 0.60 },
        { label: 'Labor', pct: 35, color: '#10b981', value: estimateTotal * 0.35 },
        { label: 'Contingency', pct: 5, color: '#f59e0b', value: estimateTotal * 0.05 },
      ];

  const handleAreaChange = (val: string) => {
     let num = parseInt(val);
     if (isNaN(num)) num = 0;
     if (num > 10000) num = 10000;
     setArea(num);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
       
       {/* Public Header */}
       <div className="bg-indigo-950 text-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                  <Calculator size={24} />
               </div>
               <span className="text-blue-400 font-bold tracking-widest text-sm uppercase">Free Tool</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Construction Cost Estimator</h1>
             <p className="text-indigo-200 text-lg max-w-2xl">
               Get an instant rough estimate for your dream home or commercial building in the Philippines based on current regional construction rates.
             </p>
          </div>
       </div>

       {/* Main Content Area */}
       <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
             
             {/* LEFT PANEL - Form */}
             <div className="w-full lg:w-7/12 bg-white rounded-2xl rounded-tl-none border border-slate-200 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
                <form onSubmit={handleCalculate} className="space-y-8">
                   
                   {/* Dimensions */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                       <div className="flex items-center justify-between mb-2">
                         <label className="text-sm font-bold text-slate-700">Floor Area (sqm)</label>
                         <span className="text-indigo-600 font-bold">{area} sqm</span>
                       </div>
                       <input 
                         type="number" 
                         value={area || ''}
                         onChange={(e) => handleAreaChange(e.target.value)}
                         className="w-full mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                       />
                       <input 
                         type="range" 
                         min="20" 
                         max="2000" 
                         step="10"
                         value={area}
                         onChange={(e) => setArea(Number(e.target.value))}
                         className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                       />
                     </div>
                     
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Number of Floors</label>
                       <input 
                         type="number" 
                         min="1" 
                         max="5"
                         value={floors}
                         onChange={(e) => setFloors(Number(e.target.value))}
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                       />
                       <p className="text-xs text-slate-400 mt-2">Maximum 5 floors for basic estimates.</p>
                     </div>
                   </div>

                   {/* Type */}
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-4">Construction Quality / Type</label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {CONST_TYPES.map(t => {
                         const Icon = t.icon;
                         const isSelected = type === t.id;
                         return (
                           <button
                             key={t.id}
                             type="button"
                             onClick={() => setType(t.id)}
                             className={`text-left p-4 rounded-xl border transition flex flex-col gap-1 ${isSelected ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                           >
                              <div className="flex items-center justify-between font-bold">
                                <span className={isSelected ? 'text-indigo-900' : 'text-slate-800'}>{t.label}</span>
                                <Icon size={18} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                              </div>
                              <span className="text-[10px] sm:text-xs font-semibold text-slate-500">{t.range}</span>
                              <span className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-snug">{t.desc}</span>
                           </button>
                         );
                       })}
                     </div>
                   </div>

                   {/* Region */}
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Location / Region</label>
                     <div className="relative">
                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select 
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none font-medium cursor-pointer"
                        >
                          {REGIONS.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                        </select>
                     </div>
                   </div>

                   {/* Addons */}
                   <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Include Professional Fees?</h4>
                        <p className="text-xs text-slate-500">Adds roughly 10% to cover structural plans, permits, and licensed engineering signatures.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" checked={includeFees} onChange={() => setIncludeFees(!includeFees)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                   </div>

                   <button type="submit" className="w-full py-4 bg-blue-600 text-white font-extrabold text-lg rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
                      Calculate Estimate
                   </button>
                </form>
             </div>

             {/* RIGHT PANEL - Results */}
             <div id="results-panel" className="w-full lg:w-5/12">
                {hasCalculated ? (
                   <div className="bg-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl animate-fade-in sticky top-6">
                      <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1">Estimated Cost Range</h3>
                      
                      <div className="mb-8">
                        <div className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight">
                           {formatCurrency(minCost)} <br className="hidden lg:block xl:hidden"/><span className="text-indigo-400 font-medium">to</span> {formatCurrency(maxCost)}
                        </div>
                        <p className="text-sm text-indigo-200">Based on {area * floors} sqm total area ({region})</p>
                      </div>

                      {/* Bar Chart Component */}
                      <div className="mb-6">
                         <div className="flex h-4 rounded-full overflow-hidden bg-indigo-900/50 mb-3 shadow-inner">
                           {breakdown.map((item, idx) => (
                              <div key={idx} style={{ width: `${item.pct}%`, backgroundColor: item.color }} className="h-full" title={`${item.label}: ${item.pct}%`}></div>
                           ))}
                         </div>
                         
                         {/* Breakdown Table Items */}
                         <div className="space-y-3">
                           {breakdown.map((item, idx) => (
                             <div key={idx} className="flex items-center justify-between text-sm">
                               <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                                 <span className="text-indigo-100 font-medium">{item.label} <span className="opacity-60">({item.pct}%)</span></span>
                               </div>
                               <span className="font-bold">{formatCurrency(item.value)}</span>
                             </div>
                           ))}
                         </div>
                      </div>

                      <div className="bg-indigo-900/40 p-4 rounded-lg flex gap-3 text-xs text-indigo-200 leading-relaxed mb-8">
                         <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                         <p>This is a rough estimate for preliminary planning purposes only. It is not an actual quote. True costs vary heavily based on material fluctuations, site conditions, exact finishes, and contractor availability.</p>
                      </div>

                      <div className="bg-white rounded-xl p-5 text-center text-slate-800">
                         <h4 className="font-bold text-base mb-1">Want an accurate quote?</h4>
                         <p className="text-xs text-slate-500 mb-4">Post your requirements for precise proposals.</p>
                         <Link href="/search" className="inline-flex w-full justify-center items-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">
                            Find Engineers <ArrowRight size={16} />
                         </Link>
                      </div>
                   </div>
                ) : (
                   <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                         <Calculator size={40} className="text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Awaiting Parameters</h3>
                      <p className="text-slate-500 max-w-xs mx-auto">Fill out the form on the left and hit calculate to generate an instant project cost breakdown.</p>
                   </div>
                )}
             </div>

          </div>
       </div>
    </div>
  );
}

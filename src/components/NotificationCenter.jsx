// In your Dashboard or Layout component
<header className="flex items-center justify-between p-6 border-b border-slate-800/40 bg-[#06080B]/50 backdrop-blur-md sticky top-0 z-20">
  <div>
    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Current Sector</h2>
    <p className="text-xl font-bold text-white tracking-tight">Mainframe Dashboard</p>
  </div>
  
  <div className="flex items-center gap-4">
    {/* SEARCH BAR (Optional) */}
    <div className="relative hidden md:block">
       <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
       <input className="bg-slate-900/40 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 w-64" placeholder="Search systems..." />
    </div>

    {/* THE BELL SYSTEM */}
    <NotificationCenter />
  </div>
</header>
import React from 'react';
import { Link } from 'react-router-dom';
import * as Icon from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  // Helper to prevent 'undefined' crashes for direct Icon.Name calls
  const getIcon = (name, props = {}) => {
    const IconComponent = Icon[name] || Icon.HelpCircle;
    return <IconComponent {...props} />;
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-white selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      
      {/* 1. PERSISTENT GRID BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
        }}
      />

      {/* 2. NAVBAR SECTION */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform">
            {getIcon("Zap", { size: 22, className: "text-white fill-white" })}
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">ShadowOps</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Sign In</Link>
          <Link to="/signup" className="bg-white text-black px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-indigo-600 hover:text-white hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all">Start Free</Link>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-indigo-500 text-[11px] font-black uppercase tracking-[0.4em] mb-6">Tactical Workspace</p>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
            Operate at <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">peak performance</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16 text-lg font-medium leading-relaxed">
            A unified command center for communication, projects, and team operations. 
            Engineered for high-stakes environments.
          </p>
        </motion.div>

        {/* --- GLASS COMMAND CENTER MOCKUP --- */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative max-w-6xl mx-auto rounded-2xl border border-white/10 bg-[#0A0C10]/60 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden text-left"
        >
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.03]">
            <div className="flex gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] shadow-inner" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] shadow-inner" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] shadow-inner" />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Command Center v4.0.2</div>
            <div className="w-12" />
          </div>

          <div className="grid md:grid-cols-12 min-h-[500px]">
            <div className="md:col-span-3 p-8 border-r border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2 text-indigo-400 mb-8 font-black text-[10px] uppercase tracking-widest">
                {getIcon("MessageSquare", { size: 16 })} Comms Hub
              </div>
              <div className="space-y-8">
                <MockChatMessage user="Alex" msg="Sprint targeting 100% completion" delay={0.2} color="bg-indigo-600" />
                <MockChatMessage user="Sarah" msg="Replication nodes stabilized" delay={0.4} color="bg-emerald-600" />
                <MockChatMessage user="Marcus" msg="New design system live" delay={0.6} color="bg-orange-600" />
              </div>
            </div>

            <div className="md:col-span-6 p-8 border-r border-white/5">
              <div className="flex items-center gap-2 text-indigo-400 mb-8 font-black text-[10px] uppercase tracking-widest">
                {getIcon("CheckSquare", { size: 16 })} Operations Pipeline
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }} 
                    className="h-24 bg-white/[0.04] rounded-xl border border-white/5 border-dashed flex items-center justify-center"
                  >
                    <div className="w-8 h-1 bg-white/10 rounded-full" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 p-8 bg-indigo-600/[0.02]">
              <div className="flex items-center gap-2 text-indigo-400 mb-10 font-black text-[10px] uppercase tracking-widest">
                {getIcon("BarChart3", { size: 16 })} Load Metrics
              </div>
              <div className="flex items-end justify-between h-40 gap-2">
                {[60, 40, 85, 55, 100, 70, 90].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    whileInView={{ height: `${h}%` }} 
                    transition={{ delay: i * 0.1, duration: 1, ease: "circOut" }}
                    className="w-full bg-gradient-to-t from-indigo-700 to-indigo-400 rounded-t-md shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* 6. FEATURES SECTION */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard iconName="MessageSquare" title="Live Comms" desc="Sub-12ms message propagation via Realtime pulse." />
          <FeatureCard iconName="CheckSquare" title="Task Ops" desc="Drag-and-drop mission priority management." />
          <FeatureCard iconName="Shield" title="Vault Storage" desc="Encrypted file storage for mission critical assets." />
          <FeatureCard iconName="Activity" title="Live Status" desc="Monitor team presence and system health instantly." />
        </div>
      </section>

      {/* 8. PRICING SECTION */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid md:grid-cols-3 gap-10">
          <PricingCard tier="Starter" price="0" subtitle="Essential kit for solo ops" features={['Up to 5 nodes', 'Internal channels', 'Standard support']} />
          <PricingCard tier="Pro" price="12" recommended subtitle="Advanced team capabilities" features={['Unlimited nodes', 'Private Ops chat', 'Analytics API', '99.9% Uptime SLA']} />
          <PricingCard tier="Enterprise" price="89" subtitle="Full spectrum dominance" features={['SSO / SAML Sync', 'On-prem deployment', 'Custom Security Layer']} />
        </div>
      </section>

      {/* 9. FOOTER SECTION */}
      <footer className="relative z-10 border-t border-white/5 py-20 bg-[#040608]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-16 mb-20 text-left">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              {getIcon("Zap", { size: 20, className: "text-indigo-500 fill-indigo-500" })}
              <span className="text-xl font-black uppercase tracking-tighter">ShadowOps</span>
            </div>
            <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase tracking-widest">Engineered for the elite. Tactical software for high-output teams.</p>
          </div>
          <FooterCol title="System" links={['Mainframe', 'Nodes', 'Replication']} />
          <FooterCol title="HQ" links={['About', 'Security', 'Protocols']} />
          <div className="flex flex-col gap-6">
            <h4 className="font-black uppercase tracking-widest text-slate-500 text-[10px]">Transmission</h4>
            <div className="flex gap-4">
              {/* FIXED: Github and Linkedin casing */}
              {getIcon("Github", { size: 20, className: "text-slate-600 hover:text-white transition-colors cursor-pointer" })}
              {getIcon("Twitter", { size: 20, className: "text-slate-600 hover:text-white transition-colors cursor-pointer" })}
              {getIcon("Linkedin", { size: 20, className: "text-slate-600 hover:text-white transition-colors cursor-pointer" })}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.5em]">System Status: All Nodes Active — © 2026 ShadowOps</p>
        </div>
      </footer>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const MockChatMessage = ({ user, msg, delay, color }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }} 
    whileInView={{ opacity: 1, x: 0 }} 
    transition={{ delay, duration: 0.5 }}
    className="flex gap-4 items-start"
  >
    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-[11px] font-black shadow-lg`}>{user[0]}</div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{user}</p>
      <p className="text-xs text-slate-400 font-medium leading-snug">{msg}</p>
    </div>
  </motion.div>
);

const FeatureCard = ({ iconName, title, desc }) => {
  const IconComponent = Icon[iconName] || Icon.HelpCircle;
  return (
    <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 transition-all group text-left">
      <div className="text-indigo-500 mb-6 bg-indigo-500/10 w-fit p-4 rounded-2xl group-hover:scale-110 transition-all">
        <IconComponent size={24} />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest mb-3 text-white">{title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed font-bold uppercase tracking-tight">{desc}</p>
    </div>
  );
};

const PricingCard = ({ tier, price, features, subtitle, recommended }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className={`p-12 rounded-3xl border ${recommended ? 'border-indigo-500 bg-indigo-500/[0.04] shadow-[0_0_50px_rgba(79,70,229,0.1)]' : 'border-white/5 bg-white/[0.01]'} relative text-left`}
  >
    {recommended && <div className="absolute -top-3 left-10 bg-indigo-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest shadow-lg">Recommended</div>}
    <h3 className="text-2xl font-black uppercase mb-2 tracking-tighter">{tier}</h3>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">{subtitle}</p>
    <div className="flex items-baseline gap-1 mb-12">
      <span className="text-6xl font-black tracking-tighter">${price}</span>
      <span className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">/month</span>
    </div>
    <ul className="space-y-5 mb-12">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
          <Icon.Check size={16} className="text-indigo-500" /> {f}
        </li>
      ))}
    </ul>
    <button className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${recommended ? 'bg-indigo-600 text-white shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:bg-indigo-500' : 'bg-white/5 text-white hover:bg-white/10'}`}>Deploy Access</button>
  </motion.div>
);

const FooterCol = ({ title, links }) => (
  <div>
    <h4 className="font-black uppercase tracking-widest text-slate-500 text-[10px] mb-8">{title}</h4>
    <ul className="space-y-4">
      {links.map((link, i) => (
        <li key={i} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-500 cursor-pointer transition-colors">{link}</li>
      ))}
    </ul>
  </div>
);

export default LandingPage;
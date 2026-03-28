import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as Icon from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Vault = ({ user }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  
  // NEW ASSET STATE
  const [newAsset, setNewAsset] = useState({
    title: '',
    category: 'Keys',
    content: '',
    project: '',
    is_secret: false
  });

  const categories = ['All', 'Keys', 'SOPs', 'Snippets', 'Media'];

  const fetchAssets = async () => {
    setLoading(true);
    let query = supabase.from('vault_assets').select('*').order('created_at', { ascending: false });
    if (filter !== 'All') query = query.eq('category', filter);
    
    const { data, error } = await query;
    if (!error) setAssets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('vault_assets').insert([
      { ...newAsset, user_id: user.id }
    ]);
    if (!error) {
      setIsAdding(false);
      setNewAsset({ title: '', category: 'Keys', content: '', project: '', is_secret: false });
      fetchAssets();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a "Copied!" toast here
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 relative">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">The Vault</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Accessing Secure Data Strata</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
        >
          <Icon.Plus size={14} /> Initialize Asset
        </button>
      </header>

      {/* FILTERS */}
      <div className="flex gap-2 border-b border-slate-800/60 pb-4">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30' : 'text-slate-600 hover:text-slate-400'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ASSET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {assets.map((asset) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={asset.id}
              className="bg-[#0B0F14] border border-slate-800/60 p-6 rounded-[2rem] group hover:border-blue-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:text-blue-400 transition-colors">
                  {asset.category === 'Keys' && <Icon.Key size={18} />}
                  {asset.category === 'Snippets' && <Icon.Code size={18} />}
                  {asset.category === 'SOPs' && <Icon.FileText size={18} />}
                  {asset.category === 'Media' && <Icon.Image size={18} />}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{asset.category}</span>
                  <span className="text-[7px] font-bold text-blue-500/50 uppercase">{asset.project || 'Global'}</span>
                </div>
              </div>

              <h3 className="text-white font-black text-xs uppercase mb-4 truncate">{asset.title}</h3>
              
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between group-hover:bg-black/40 transition-all">
                <code className="text-[10px] text-slate-400 font-mono truncate mr-2">
                  {asset.is_secret ? '••••••••••••••••' : asset.content}
                </code>
                <button 
                  onClick={() => copyToClipboard(asset.content)}
                  className="text-slate-600 hover:text-white transition-colors p-1"
                >
                  <Icon.Copy size={14}/>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ADD ASSET MODAL */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0B0F14] border-l border-slate-800 p-8 z-[60] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">New Asset</h2>
                <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white"><Icon.X size={20}/></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Name</label>
                  <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-bold" value={newAsset.title} onChange={e => setNewAsset({...newAsset, title: e.target.value})} placeholder="e.g. AWS Production Key" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold uppercase" value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})}>
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sector (Project)</label>
                    <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold uppercase" value={newAsset.project} onChange={e => setNewAsset({...newAsset, project: e.target.value})} placeholder="Project Name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Content / Secret</label>
                  <textarea required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono min-h-[120px]" value={newAsset.content} onChange={e => setNewAsset({...newAsset, content: e.target.value})} placeholder="Paste key or snippet here..." />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                   <input type="checkbox" id="is_secret" className="w-4 h-4 rounded border-slate-800 bg-slate-950" checked={newAsset.is_secret} onChange={e => setNewAsset({...newAsset, is_secret: e.target.checked})} />
                   <label htmlFor="is_secret" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">Mask content (Secret Mode)</label>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase text-[10px] tracking-[0.2em] transition-all">Secure in Vault</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vault;
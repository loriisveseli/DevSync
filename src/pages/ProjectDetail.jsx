import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, GitCommit, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const ProjectDetail = ({ user }) => {
  const { repoName } = useParams();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      try {
        const res = await axios.get(`https://api.github.com/repos/${user.user_metadata.user_name}/${repoName}/commits`, {
          headers: { Authorization: `Bearer ${session.provider_token}` }
        });
        setCommits(res.data.slice(0, 10));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCommits();
  }, [repoName]);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 mb-10 font-bold transition-colors">
        <ArrowLeft size={20} /> DASHBOARD
      </Link>

      <div className="bg-gradient-to-r from-slate-900 to-slate-900/20 border border-slate-800 p-10 rounded-[2.5rem] mb-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="text-green-500" size={20} />
            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Repository Connected</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">{repoName}</h1>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 text-sm text-slate-300 font-medium">
              10 Latest Commits
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-0 relative">
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/50 via-slate-800 to-transparent"></div>
        
        {loading ? (
          <div className="pl-20 space-y-8 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-900/40 rounded-3xl" />)}
          </div>
        ) : (
          commits.map((c, i) => (
            <div key={i} className="relative pl-20 pb-10 group">
              <div className="absolute left-4 top-1 w-7 h-7 bg-[#020617] border-4 border-blue-600 rounded-full z-10 shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
              
              <div className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-3xl hover:bg-slate-800/40 transition-all hover:border-slate-700 shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                      {c.commit.message.split('\n')[0]}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/30">
                        <img src={c.author?.avatar_url} className="w-5 h-5 rounded-md" alt="" />
                        {c.commit.author.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(c.commit.author.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <a href={c.html_url} target="_blank" rel="noreferrer" className="p-3 bg-slate-800 rounded-2xl hover:text-blue-400 transition-all">
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
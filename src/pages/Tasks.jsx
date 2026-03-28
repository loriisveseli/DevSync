import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as Icon from 'lucide-react';

const Tasks = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [now, setNow] = useState(new Date());
  
  // --- NEW STATES FOR EDITING ---
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const fileInputRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const selectedProject = queryParams.get('project');

  const [newTask, setNewTask] = useState({ 
    title: '', project: selectedProject || '', difficulty: 'Medium', description: '', due_date: '' 
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LOGIC: HELPER FOR FILE ICONS ---
  const getFileIcon = (url) => {
    if (!url) return <Icon.File size={18} />;
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return <Icon.Image size={18} className="text-purple-400" />;
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return <Icon.FolderArchive size={18} className="text-yellow-500" />;
    if (ext === 'pdf') return <Icon.FileText size={18} className="text-red-400" />;
    return <Icon.FileCode size={18} className="text-blue-400" />;
  };

  // --- LOGIC: PRIORITY WEIGHTING ---
  const sortTasks = (taskList) => {
    const weights = { 'Hard': 3, 'Medium': 2, 'Easy': 1 };
    return [...taskList].sort((a, b) => {
      if (weights[b.difficulty] !== weights[a.difficulty]) {
        return weights[b.difficulty] - weights[a.difficulty];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const getProgressInfo = (createdAt, dueDate) => {
    if (!dueDate) return 100;
    const start = Date.parse(createdAt);
    const end = Date.parse(dueDate);
    const current = Date.parse(now);
    const totalDuration = end - start;
    const elapsed = current - start;
    return Math.max(0, Math.min(100, 100 - (elapsed / totalDuration) * 100));
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return null;
    const total = Date.parse(dueDate) - Date.parse(now);
    if (total <= 0) return { label: "EXPIRED", color: "text-red-500 border-red-500/20 bg-red-500/10" };

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { 
      label: `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`,
      color: total < 3600000 ? "text-orange-500 border-orange-500/20 bg-orange-500/10 animate-pulse" : "text-cyan-400 border-cyan-400/20 bg-cyan-400/10"
    };
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('tasks').select('*');
    if (selectedProject) query = query.eq('project', selectedProject);
    const { data, error } = await query;
    if (!error) setTasks(sortTasks(data || []));
    setLoading(false);
  }, [selectedProject]);

  useEffect(() => {
    fetchTasks();
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('name');
      if (data) setProjectList(data.map(p => p.name));
    };
    fetchProjects();
  }, [selectedProject, fetchTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !user) return;
    const { error } = await supabase.from('tasks').insert([{ ...newTask, status: 'Ongoing', user_id: user.id }]);
    if (!error) {
      setNewTask({ title: '', project: selectedProject || '', difficulty: 'Medium', description: '', due_date: '' });
      fetchTasks();
    }
  };

  // --- NEW FUNCTIONS FOR EDITING AND DELETING ---
  const deleteTask = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this task?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete the task.");
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditForm({ ...task });
  };

  const saveEdit = async () => {
    try {
      const { error } = await supabase.from('tasks').update({
        title: editForm.title,
        description: editForm.description,
        difficulty: editForm.difficulty,
        due_date: editForm.due_date,
        project: editForm.project
      }).eq('id', editingId);

      if (error) throw error;
      setTasks(prev => sortTasks(prev.map(t => t.id === editingId ? { ...t, ...editForm } : t)));
      setEditingId(null);
    } catch (err) {
      alert("Failed to update task.");
    }
  };
  // ----------------------------------------------

  const handleFileUpload = async (e, taskId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${taskId}_${Date.now()}.${fileExt}`;
      const filePath = `artifacts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('task-files').getPublicUrl(filePath);

      await supabase.from('tasks').update({ 
        status: 'Deployed', 
        submission_url: urlData.publicUrl, 
        completed_at: new Date().toISOString() 
      }).eq('id', taskId);

      setSubmittingId(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Ensure 'task-files' bucket exists.");
    } finally {
      setUploading(false);
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'Deployed');
  const deployedTasks = tasks.filter(t => t.status === 'Deployed');

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-12 pb-20">
      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
          <Icon.ShieldAlert size={20} className="text-red-500" />
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">High Priority</p>
            <p className="text-xl font-black text-white">{activeTasks.filter(t => t.difficulty === 'Hard').length}</p>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
          <Icon.Archive size={20} className="text-green-500" />
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Deployed</p>
            <p className="text-xl font-black text-white">{deployedTasks.length}</p>
          </div>
        </div>
      </div>

      {/* NEW TASK FORM */}
      <form onSubmit={addTask} className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem] space-y-4 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="Task Name..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
          <select className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" value={newTask.project} onChange={e => setNewTask({...newTask, project: e.target.value})}>
            <option value="">Global System</option>
            {projectList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" value={newTask.difficulty} onChange={e => setNewTask({...newTask, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select>
          <input type="datetime-local" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-400" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
        </div>
        <textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white min-h-[60px]" placeholder="Mission Briefing..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-500/20">Engage Operation</button>
      </form>

      {/* ACTIVE MISSIONS */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Active Tactical Feed</h2>
        {activeTasks.map(task => {
          const timeLeft = getTimeRemaining(task.due_date);
          const progress = getProgressInfo(task.created_at, task.due_date);
          const isHard = task.difficulty === 'Hard';
          const isEditing = editingId === task.id;

          return (
            <div key={task.id} className={`group relative bg-slate-900/20 border rounded-3xl overflow-hidden transition-all ${isHard ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-slate-800 hover:border-blue-500/40'}`}>
              {isHard && <div className="absolute top-0 left-0 w-1 h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
              <div className="h-1 w-full bg-slate-800/50">
                <div className={`h-full transition-all duration-1000 ${isHard ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="p-6">
                {isEditing ? (
                  /* --- EDIT FORM UI --- */
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      <select className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" value={editForm.difficulty} onChange={e => setEditForm({...editForm, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select>
                      <input type="datetime-local" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-400" value={editForm.due_date} onChange={e => setEditForm({...editForm, due_date: e.target.value})} />
                    </div>
                    <textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white min-h-[60px]" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Save Changes</button>
                      <button onClick={() => setEditingId(null)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* --- STANDARD TASK VIEW --- */
                  <>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`font-black text-lg uppercase italic ${isHard ? 'text-white' : 'text-slate-200'}`}>{task.title}</h3>
                          {timeLeft && <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border tabular-nums ${timeLeft.color}`}>{timeLeft.label}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isHard ? 'bg-red-600/20 text-red-500 border border-red-500/20' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>{task.difficulty} Priority</span>
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{task.project || 'Global'}</span>
                        </div>
                      </div>
                      
                      {/* ACTION BUTTONS */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(task)} className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all" title="Edit">
                          <Icon.Edit3 size={18} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-xl transition-all" title="Delete">
                          <Icon.Trash2 size={18} />
                        </button>
                        <button onClick={() => setSubmittingId(task.id)} className="ml-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-blue-600/20">
                          Finish Task
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-4 italic leading-relaxed pl-4 border-l border-slate-800">{task.description}</p>
                    
                    {submittingId === task.id && (
                      <div className="mt-6 p-6 border-2 border-dashed border-blue-500/30 rounded-2xl bg-slate-950/50 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <Icon.UploadCloud size={30} className={uploading ? "animate-bounce text-blue-500" : "text-slate-500"} />
                        <input type="file" ref={fileInputRef} className="hidden" multiple webkitdirectory="true" onChange={(e) => handleFileUpload(e, task.id)} />
                        <div className="flex gap-2 w-full max-w-xs">
                          <button disabled={uploading} onClick={() => fileInputRef.current.click()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-blue-600/20">
                            {uploading ? "Syncing..." : "Upload Files/Folder"}
                          </button>
                          <button onClick={() => setSubmittingId(null)} className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"><Icon.X size={14} /></button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* DEPLOYED MISSIONS (ARCHIVE) */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
          <Icon.CheckCircle2 size={14} className="text-green-500" /> Completed Artifacts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deployedTasks.map(task => (
            <div key={task.id} className="bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex items-center justify-between group hover:border-green-500/40 transition-all shadow-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-slate-900 rounded-xl flex-shrink-0">{getFileIcon(task.submission_url)}</div>
                <div className="overflow-hidden">
                  <h4 className="text-white font-bold text-xs uppercase truncate">{task.title}</h4>
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Done {new Date(task.completed_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <a href={task.submission_url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all">
                  <Icon.Download size={16} />
                </a>
                <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Delete Artifact">
                  <Icon.Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Tasks;
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Toaster } from 'sonner'; // Global alert container

// Pages
import Vault from './pages/Vault';
import Tasks from './pages/Tasks'; 
import Landing from './pages/Landing'; 
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import Projects from './pages/Projects'; 
import Comms from './pages/Comms'; 
import Settings from './pages/Settings';

// Components
import Auth from './components/Login';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import TopNav from './components/TopNav'; // Import the new TopNav with the Bell

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (session) {
      const fetchTasks = async () => {
        const { data } = await supabase
          .from('tasks')
          .select('id, title, difficulty, project, status')
          .order('created_at', { ascending: false });
        if (data) setTasks(data);
      };
      fetchTasks();
      
      const channel = supabase
        .channel('app-task-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [session]);

  if (loading) return null; 

  return (
    <Router>
      {/* Global Toast Alerts - positioned top-center for tactical feel */}
      <Toaster theme="dark" position="top-center" richColors />

      {session && (
        <CommandPalette 
          isOpen={isPaletteOpen} 
          onClose={() => setIsPaletteOpen(false)} 
          tasks={tasks}
        />
      )}

      <Routes>
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />

        {/* PROTECTED APP SHELL */}
        <Route 
          path="/*" 
          element={
            session ? (
              <div className="flex min-h-screen bg-[#06080B] text-slate-200 overflow-hidden">
                <Sidebar user={session.user} />
                
                {/* Main Content Container */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                  
                  {/* GLOBAL TOP NAV (Bell is inside here) */}
                  <TopNav user={session.user} />

                  {/* Scrollable Page Area */}
                  <main className="flex-1 overflow-y-auto no-scrollbar relative">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard user={session.user} />} />
                      <Route path="/tasks" element={<Tasks user={session.user} />} />
                      <Route path="/projects" element={<Projects user={session.user} />} />
                      <Route path="/comms" element={<Comms user={session.user} />} />
                      <Route path="/vault" element={<Vault user={session.user} />} />
                      <Route path="/integrations" element={<Integrations user={session.user} />} />
                      <Route path="/settings" element={<Settings user={session.user} />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </main>
                </div>

              </div>
            ) : (
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
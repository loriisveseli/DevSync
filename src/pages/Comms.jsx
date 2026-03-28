import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as Icon from 'lucide-react';
import { motion } from 'framer-motion';

const Comms = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomParam = searchParams.get('room');

  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(roomParam || 'GLOBAL');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  // 1. Sync active channel with URL
  useEffect(() => {
    if (roomParam) setActiveChannel(roomParam);
  }, [roomParam]);

  // 2. Fetch Project Sectors for the Sidebar
  useEffect(() => {
    const fetchSectors = async () => {
      const { data } = await supabase.from('projects').select('name');
      const sectorNames = data?.map(p => p.name) || [];
      setChannels(['GLOBAL', ...sectorNames]);
    };
    fetchSectors();
  }, []);

  // 3. LIVE REALTIME SUBSCRIPTION
  useEffect(() => {
    // A. Fetch existing messages for the current room
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', activeChannel)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };

    fetchMessages();

    // B. Setup Realtime Channel
    // IMPORTANT: Go to Supabase > Database > Replication > Enable 'messages' table
    const channel = supabase
      .channel(`room-direct-${activeChannel}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `room_id=eq.${activeChannel}` 
        },
        (payload) => {
          // Use functional update to ensure we have latest state
          setMessages((currentMessages) => {
            // Prevent duplicates (if insert response and realtime hit at same time)
            const exists = currentMessages.find(m => m.id === payload.new.id);
            if (exists) return currentMessages;
            return [...currentMessages, payload.new];
          });
        }
      )
      .subscribe();

    // C. Cleanup subscription on room change or unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  // 4. Auto-Scroll to Bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageToPulse = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    const { error } = await supabase.from('messages').insert([{
      text: messageToPulse, 
      user_id: user.id, 
      user_email: user.email, 
      room_id: activeChannel
    }]);

    if (error) {
      console.error("Transmission failed:", error.message);
      setNewMessage(messageToPulse); // Restore text if failed
    }
  };

  return (
    <div className="flex h-screen bg-[#06080B] overflow-hidden">
      {/* SIDEBAR: FREQUENCY SELECTOR */}
      <div className="w-64 border-r border-white/5 flex flex-col bg-slate-950/20">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Frequency</h2>
          <Icon.Activity size={14} className="text-indigo-500 animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {channels.map(chan => (
            <button
              key={chan}
              onClick={() => {
                setActiveChannel(chan);
                setSearchParams({ room: chan });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                activeChannel === chan 
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-white' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              <Icon.Hash size={14} className={activeChannel === chan ? "text-indigo-400" : "text-slate-700 group-hover:text-slate-500"} />
              <span className="text-xs font-black uppercase tracking-tight">{chan}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MAIN AREA */}
      <div className="flex-1 flex flex-col relative">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#06080B]/50 backdrop-blur-md">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-indigo-500 font-normal">#</span> {activeChannel}
          </h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-slate-500 uppercase">Live Connection</span>
          </div>
        </div>

        {/* MESSAGES VIEWPORT */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar pb-32">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase">{msg.user_email?.split('@')[0]}</span>
                  <span className="text-[8px] text-slate-800 font-bold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.user_id === user.id 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#06080B] via-[#06080B] to-transparent">
          <form onSubmit={sendMessage} className="relative max-w-5xl mx-auto">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Transmit to ${activeChannel}...`}
              className="w-full bg-[#0D0F14] border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs text-white outline-none focus:border-indigo-500/50 shadow-2xl transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20">
              <Icon.Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Comms;
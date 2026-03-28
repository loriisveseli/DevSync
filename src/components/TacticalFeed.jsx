import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import * as Icon from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TacticalFeed = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
      setMessages(data || []);
    };
    fetchMessages();

    const channel = supabase.channel('tactical-comms')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        payload => setMessages(prev => [...prev, payload.new]))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const { error } = await supabase.from('messages').insert([{ text: newMessage, user_id: user.id, user_email: user.email }]);
    if (!error) setNewMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-screen w-80 bg-[#0B0F14] border-l border-slate-800 shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-white uppercase tracking-widest">Tactical Comms</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon.X size={18} /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3 py-2 rounded-2xl text-xs ${msg.user_id === user.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-slate-800">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Transmit..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 text-xs text-white outline-none focus:border-indigo-500" />
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TacticalFeed;
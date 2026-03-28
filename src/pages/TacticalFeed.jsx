import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import * as Icon from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TacticalFeed = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch and Subscribe
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel('tactical-comms')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        payload => setMessages(prev => [...prev, payload.new])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageObj = {
      text: newMessage,
      user_id: user.id,
      user_email: user.email,
    };

    const { error } = await supabase.from('messages').insert([messageObj]);
    if (!error) setNewMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Chat Drawer */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-80 bg-[#0B0F14] border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Icon.MessageSquare size={16} className="text-indigo-500" />
                <h2 className="text-[10px] font-black text-white uppercase tracking-widest">Tactical Comms</h2>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <Icon.X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg) => {
                const isMe = msg.user_id === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[8px] font-black text-slate-600 uppercase mb-1 px-1">
                      {isMe ? 'You' : msg.user_email?.split('@')[0]}
                    </span>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-950/50">
              <div className="relative">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Transmit message..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-4 pr-10 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 outline-none transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-400 p-1">
                  <Icon.Send size={14} />
                </button>
              </div>
              <p className="text-[7px] text-center text-slate-700 mt-2 font-black uppercase tracking-tighter">
                Secure Channel // End-to-End Encrypted
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TacticalFeed;
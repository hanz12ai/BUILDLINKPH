'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Paperclip, 
  Send, 
  ArrowLeft, 
  FileText, 
  MoreVertical,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function MessagesDashboard() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  
  // Mobile responsive state: null means showing list, ID means showing chat
  const [mobileViewChat, setMobileViewChat] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     const init = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setCurrentUser(session.user.id);

        try {
           const res = await fetch('/api/messages/conversations');
           if (res.ok) {
              const data = await res.json();
              setConversations(data.conversations || []);
           }
        } catch (err) {
           console.error("Failed to load conversations");
        }
     };
     init();
  }, [supabase]);

  useEffect(() => {
     if (!activeChatId) return;
     
     const fetchMessages = async () => {
        try {
           const res = await fetch(`/api/messages?other_user_id=${activeChatId}`);
           if (res.ok) {
              const data = await res.json();
              setActiveMessages(data.messages || []);
              
              setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, unread_count: 0 } : c));
           }
        } catch(err) {
           console.error("Failed to fetch messages", err);
        }
     };
     fetchMessages();
  }, [activeChatId]);

  useEffect(() => {
     if (!currentUser) return;
     
     const channel = supabase.channel('messages_changes')
       .on('postgres_changes', { 
           event: 'INSERT', 
           schema: 'public', 
           table: 'messages',
           filter: `receiver_id=eq.${currentUser}` 
       }, (payload: any) => {
           const newMsg = payload.new;
           
           if (activeChatId === newMsg.sender_id) {
               setActiveMessages(prev => [...prev, newMsg]);
               fetch(`/api/messages?other_user_id=${newMsg.sender_id}`).catch(()=>{});
           } else {
               setConversations(prev => {
                   const exists = prev.find(c => c.id === newMsg.sender_id);
                   if (exists) {
                       return prev.map(c => c.id === newMsg.sender_id 
                         ? { ...c, unread_count: (c.unread_count || 0) + 1, last_message: { content: newMsg.content, sent_at: newMsg.sent_at } } 
                         : c
                       );
                   } else {
                       fetch('/api/messages/conversations')
                         .then(r => r.json())
                         .then(data => setConversations(data.conversations || []))
                         .catch(()=>{});
                       return prev;
                   }
               });
           }
       })
       .subscribe();

     return () => {
        supabase.removeChannel(channel);
     };
  }, [currentUser, activeChatId, supabase]);

  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const activeChat = conversations.find(c => c.id === activeChatId);
  const filteredConversations = conversations.filter(c => (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setMobileViewChat(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !currentUser) return;

    const tmpId = `temp-${Date.now()}`;
    const newMsg = {
      id: tmpId,
      sender_id: currentUser,
      receiver_id: activeChatId,
      content: inputText.trim(),
      sent_at: new Date().toISOString()
    };
    
    setActiveMessages(prev => [...prev, newMsg]);
    setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, last_message: { content: newMsg.content, sent_at: newMsg.sent_at } } : c));
    
    setInputText('');

    try {
      const res = await fetch('/api/messages', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            receiver_id: activeChatId,
            content: newMsg.content
         })
      });

      if (!res.ok) throw new Error("Failed");
      
      const realMsg = await res.json();
      setActiveMessages(prev => prev.map(m => m.id === tmpId ? realMsg : m));

    } catch (err) {
      console.error(err);
      setActiveMessages(prev => prev.filter(m => m.id !== tmpId));
      alert("Failed to send message.");
    }
  };

  const formatTimeStr = (isoStr: string) => {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoStr: string) => {
     if (!isoStr) return '';
     return new Date(isoStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDateGroup = (isoStr: string) => {
     const d = new Date(isoStr);
     const now = new Date();
     const yesterday = new Date();
     yesterday.setDate(now.getDate() - 1);
     
     if (d.toDateString() === now.toDateString()) return 'Today';
     if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
     return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const groupedMessages: { date: string, messages: any[] }[] = [];
  activeMessages.forEach(msg => {
     const g = formatDateGroup(msg.sent_at);
     let lastGroup = groupedMessages[groupedMessages.length - 1];
     if (lastGroup && lastGroup.date === g) {
        lastGroup.messages.push(msg);
     } else {
        groupedMessages.push({ date: g, messages: [msg] });
     }
  });

  const mapColor = (color: string) => {
     const cm: Record<string, string> = {
       blue: 'text-blue-700 bg-blue-100',
       sky: 'text-sky-700 bg-sky-100',
       emerald: 'text-emerald-700 bg-emerald-100',
       amber: 'text-amber-700 bg-amber-100',
       violet: 'text-violet-700 bg-violet-100'
     };
     return cm[color] || cm.blue;
  };

  return (
    <div className="flex h-[calc(100vh-[80px])] md:h-[calc(100vh-[60px])] lg:h-[80vh] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 lg:my-0 lg:mx-0 overflow-hidden bg-white lg:rounded-xl lg:border lg:border-slate-200 lg:shadow-sm">
      
      {/* LEFT PANEL - CONVERSATION LIST */}
      <div className={`w-full lg:w-80 shrink-0 border-r border-slate-200 flex flex-col bg-white ${mobileViewChat ? 'hidden lg:flex' : 'flex'}`}>
         
         <div className="p-4 border-b border-slate-200 shrink-0">
           <h2 className="text-xl font-extrabold text-indigo-950 mb-4 tracking-tight">Messages</h2>
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search conversations..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
             />
           </div>
         </div>

         <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => {
                const isActive = conv.id === activeChatId;
                const initials = (conv.full_name || 'U').split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase();
                return (
                  <button 
                    key={conv.id} 
                    onClick={() => handleSelectChat(conv.id)}
                    className={`w-full text-left p-4 border-b border-slate-100 flex gap-3 transition ${isActive ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                  >
                     <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${mapColor('blue')}`}>
                          {initials}
                        </div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                           <h4 className="font-bold text-slate-900 truncate text-sm">{conv.full_name}</h4>
                           <span className={`text-[10px] shrink-0 font-medium ${conv.unread_count > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                             {formatTimeStr(conv.last_message?.sent_at)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                           <p className={`text-xs truncate ${conv.unread_count > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                             {conv.last_message?.content || 'Sent a message'}
                           </p>
                           {conv.unread_count > 0 && (
                             <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm">
                               {conv.unread_count}
                             </span>
                           )}
                        </div>
                     </div>
                  </button>
                );
              })
            ) : (
               <div className="p-8 text-center text-sm text-slate-500">No conversations found.</div>
            )}
         </div>
      </div>

      {/* RIGHT PANEL - ACTIVE CHAT THREAD */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${!mobileViewChat ? 'hidden lg:flex' : 'flex'}`}>
         
         {activeChat ? (
           <>
             {/* Chat Header */}
             <div className="h-[73px] lg:h-[73px] px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-[0_4px_10px_-10px_rgba(0,0,0,0.1)] z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setMobileViewChat(false)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 transition">
                     <ArrowLeft size={20} />
                  </button>
                  <div className="relative shrink-0">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${mapColor('blue')}`}>
                       {(activeChat.full_name || 'U').split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase()}
                     </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activeChat.full_name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] sm:text-xs text-slate-500">Active</span>
                       <span className="text-slate-300">•</span>
                       <Link href={`/engineers/${activeChat.id}`} className="text-[10px] sm:text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                          View Profile <ExternalLink size={10} />
                       </Link>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-700 transition">
                   <MoreVertical size={20} />
                </button>
             </div>

             {/* Job Context Banner */}
             {activeChat.last_message?.job_id && (
             <div className="bg-indigo-50 border-b border-indigo-100 px-4 sm:px-6 py-2.5 shrink-0 flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-800 shrink-0">Ref Job ID:</span>
                <Link href={`/jobs/${activeChat.last_message.job_id}`} className="text-sm font-semibold text-indigo-900 hover:underline hover:text-blue-600 truncate transition">
                  {activeChat.last_message.job_id}
                </Link>
             </div>
             )}

             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
                
                {groupedMessages.map((group, gIdx) => (
                   <div key={gIdx} className="space-y-6">
                      <div className="flex justify-center my-2">
                        <span className="bg-white border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                          {group.date}
                        </span>
                      </div>
                      
                      {group.messages.map(msg => {
                        const isMe = msg.sender_id === currentUser;
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                       {!isMe && (
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${mapColor(activeChat.participantColor)}`}>
                           {activeChat.participantInitials}
                         </div>
                       )}
                       
                       <div className="group relative flex flex-col gap-1">
                          <div 
                            className={`px-4 py-2.5 text-sm shadow-sm ${
                              isMe 
                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm'
                            }`}
                          >
                             <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          
                          {/* Hover Timestamp */}
                          <span className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 font-semibold absolute -bottom-5 ${isMe ? 'right-1' : 'left-1'}`}>
                            {formatTime(msg.sent_at)}
                          </span>
                       </div>
                    </div>
                  );
                })}
             </div>
             ))}
             <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                   <button type="button" className="p-2 sm:p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition shrink-0">
                     <Paperclip size={20} />
                   </button>
                   <textarea
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSendMessage(e);
                       }
                     }}
                     placeholder="Write your message... (Shift+Enter for newline)"
                     className="flex-1 min-h-[44px] max-h-32 p-3 bg-slate-50 border border-slate-300 rounded-xl sm:rounded-2xl resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition"
                     rows={1}
                   />
                   <button type="submit" disabled={!inputText.trim()} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0 shadow-sm">
                     <Send size={18} />
                   </button>
                </form>
             </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Your Messages</h3>
              <p className="text-sm text-slate-500 max-w-sm">Select a conversation from the sidebar to view your message history and chat directly.</p>
           </div>
         )}

      </div>
    </div>
  );
}

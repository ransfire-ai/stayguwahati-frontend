'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Home, Send } from 'lucide-react';

const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

interface Message {
  _id?: string;
  senderName: string;
  guestName: string;
  propertyTitle: string;
  message: string;
  createdAt?: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const guestName = searchParams.get('guest') || 'Guest';
  const property = searchParams.get('property') || 'Green Villa';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Fetch messages from MongoDB API
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/messages?propertyTitle=${encodeURIComponent(
          property
        )}&guestName=${encodeURIComponent(guestName)}`
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setMessages(result.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Initial fetch and 3-second live polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [guestName, property]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = inputText.trim();
    if (!msg) return;

    setInputText('');

    try {
      await fetch(`${BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: guestName,
          guestName: guestName,
          propertyTitle: property,
          message: msg,
        }),
      });

      // Immediately fetch to render new message
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="fixed inset-0 sm:relative sm:inset-auto bg-white w-full h-full sm:h-[620px] sm:max-w-md flex flex-col sm:rounded-2xl sm:shadow-2xl sm:border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-teal-700 text-white px-4 py-3 sm:py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center font-bold text-white shrink-0">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-sm leading-tight">
              StayGuwahati Host Chat
            </h1>
            <p className="text-xs text-teal-100 opacity-90">{property}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[11px] text-teal-100 font-medium">Online</span>
        </div>
      </div>

      {/* Chat History Container */}
      <div
        ref={chatBoxRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 overscroll-contain text-sm sm:text-xs"
      >
        {messages.length === 0 ? (
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 text-gray-700 shadow-xs max-w-[85%] rounded-tl-none">
            <p className="leading-relaxed">
              Hello! Welcome to StayGuwahati. How can we help you today?
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSelf = msg.senderName === guestName;
            return (
              <div
                key={msg._id || index}
                className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
              >
                {isSelf ? (
                  <div className="bg-teal-700 text-white p-3.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-xs">
                    <p className="leading-relaxed break-words">{msg.message}</p>
                  </div>
                ) : (
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-gray-200 text-gray-700 shadow-xs max-w-[85%]">
                    <p className="font-bold text-[11px] text-teal-700 mb-1">
                      {msg.senderName || 'Host'}
                    </p>
                    <p className="leading-relaxed break-words">{msg.message}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Mobile Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-[16px] sm:text-xs focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-medium bg-gray-50 focus:bg-white transition"
          autoComplete="off"
          required
        />
        <button
          type="submit"
          className="bg-teal-700 text-white font-bold h-10 w-10 sm:w-auto sm:px-5 rounded-full text-xs hover:bg-teal-800 active:scale-95 transition flex items-center justify-center shrink-0 shadow-sm"
          aria-label="Send message"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-4 h-4 sm:hidden text-white" />
        </button>
      </form>
    </div>
  );
}

export default function HostChatPage() {
  return (
    <div className="bg-gray-100 min-h-screen w-full flex items-center justify-center p-0 sm:p-4 antialiased selection:bg-teal-100">
      <Suspense fallback={<div className="p-4 text-slate-500 text-sm">Loading chat...</div>}>
        <ChatContent />
      </Suspense>
    </div>
  );
}
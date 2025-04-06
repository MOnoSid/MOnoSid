import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Volume2, Clock, CheckCheck, Settings, X, Sparkles, Heart, MessageSquare, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
import './TherapyChat.css';

interface Message {
  text: string;
  isUser: boolean;
  timestamp?: string;
}

interface TherapyChatProps {
  messages: Message[];
  onSendMessage?: (text: string) => void;
  isTyping?: boolean;
  visible?: boolean;
  onToggleVisibility?: () => void;
}

const TherapyChat: React.FC<TherapyChatProps> = ({ 
  messages, 
  onSendMessage, 
  isTyping = false,
  visible = false, // Default to hidden, especially on mobile
  onToggleVisibility
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);    
  const [sessionTime, setSessionTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle button that's always visible but positioned differently on mobile
  const ChatToggleButton = () => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggleVisibility}
      className={`chat-toggle-button absolute ${visible ? 'left-2 md:left-4' : 'right-2 md:right-4'} ${isMobile ? 'bottom-20' : 'top-4'} p-2 md:p-3 rounded-full bg-indigo-500/70 hover:bg-indigo-600/80 text-white shadow-lg backdrop-blur-sm z-50 transition-all duration-300`}
    >
      {visible ? <ChevronRight className="w-4 h-4 md:w-5 md:h-5" /> : <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />}
    </motion.button>
  );

  // If chat is not visible, only show the toggle button
  if (!visible) {
    return <ChatToggleButton />;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="chat-panel flex flex-col h-full w-full md:w-96 absolute right-0 top-0 bottom-0 bg-white/5 backdrop-blur-md shadow-xl border-l border-white/10 z-40"
      >
        <ChatToggleButton />
        
        {/* Chat Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="header-animate-in flex-shrink-0 px-4 md:px-6 py-3 md:py-4 bg-transparent"
        >
          <div className="flex items-center gap-3 md:gap-4 ml-6 md:ml-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="interactive-element p-2 md:p-2.5 bg-indigo-100/5 rounded-xl"
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-indigo-600/50" />
            </motion.div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900/70">Therapeutic Conversation</h2>
              <p className="text-xs md:text-sm text-slate-500/70">Your safe space for dialogue</p>
            </div>
          </div>
        </motion.div>

        {/* Messages Area with Fixed Height */}
        <ScrollArea className="custom-scrollbar flex-1 px-4 md:px-6 py-3 md:py-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-15rem)] bg-transparent" ref={scrollRef}>
          <div className="space-y-4 md:space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"} group message ${message.isUser ? "message-user" : "message-bot"}`}
                >
                  {!message.isUser && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="interactive-element flex-shrink-0 mr-3 md:mr-4"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 rounded-xl flex items-center justify-center shadow-sm">
                        <Brain className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
                      </div>
                    </motion.div>
                  )}
                  
                  <div className={`max-w-[80%] space-y-1 ${message.isUser ? "items-end" : "items-start"}`}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`interactive-element relative px-4 md:px-5 py-2 md:py-3 rounded-2xl shadow-sm ${
                        message.isUser
                          ? "bg-gradient-to-r from-slate-600/80 to-slate-700/80 text-white backdrop-blur-sm"
                          : "bg-white/10 border border-white/10 backdrop-blur-sm"
                      }`}
                    >
                      <p className={`text-sm md:text-[15px] leading-relaxed ${
                        message.isUser ? "text-white/90" : "text-slate-700/90"
                      }`}>
                        {message.text}
                      </p>
                      
                      {!message.isUser && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="action-button absolute -right-8 md:-right-10 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-white/10 hover:bg-indigo-50/30 text-indigo-600/70 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                        >
                          <Volume2 className="w-3 h-3 md:w-4 md:h-4" />
                        </motion.button>
                      )}
                    </motion.div>
                    
                    <div className={`message-status flex items-center gap-2 px-1 ${
                      message.isUser ? "justify-end" : "justify-start"
                    }`}>
                      <span className="text-[10px] md:text-xs text-slate-400/70">
                        {message.timestamp || "Just now"}
                      </span>
                      {message.isUser && (
                        <CheckCheck className="message-status-icon w-3 h-3 md:w-4 md:h-4 text-indigo-500/50" />
                      )}
                    </div>
                  </div>

                  {message.isUser && (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="interactive-element flex-shrink-0 ml-3 md:ml-4"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm">
                        <span className="text-xs md:text-sm font-medium text-white/90">You</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 md:gap-4 ml-11 md:ml-14"
              >
                <div className="voice-wave flex gap-1">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      backgroundColor: ['#818cf8', '#a78bfa', '#818cf8']
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="voice-wave-bar w-1.5 h-1.5 md:w-2 md:h-2 rounded-full opacity-50"
                  />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      backgroundColor: ['#818cf8', '#a78bfa', '#818cf8']
                    }}
                    transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                    className="voice-wave-bar w-1.5 h-1.5 md:w-2 md:h-2 rounded-full opacity-50"
                  />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      backgroundColor: ['#818cf8', '#a78bfa', '#818cf8']
                    }}
                    transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
                    className="voice-wave-bar w-1.5 h-1.5 md:w-2 md:h-2 rounded-full opacity-50"
                  />
                </div>
                <span className="text-xs md:text-sm text-slate-400/70">Composing response...</span>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area with Fixed Position */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="input-area flex-shrink-0 p-4 md:p-6 bg-transparent"
        >
          <div className="flex items-end gap-3 md:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRecording(!isRecording)}
              className={`action-button p-2 md:p-3 rounded-xl transition-all duration-200 ${
                isRecording 
                  ? "bg-rose-500/70 text-white shadow-lg shadow-rose-500/20 backdrop-blur-sm" 
                  : "bg-slate-200/20 text-slate-600/70 hover:bg-slate-300/30 backdrop-blur-sm"
              }`}
            >
              <Mic className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
            
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share your thoughts..."
                className="input-field w-full px-4 md:px-5 py-2 md:py-3 bg-white/10 hover:bg-white/20 focus:bg-white/30 pr-10 md:pr-12 resize-none transition-colors duration-200 rounded-2xl border border-white/10 text-slate-700/90 placeholder:text-slate-400/70 focus:ring-2 focus:ring-slate-500/20 backdrop-blur-sm text-sm md:text-base"
                rows={1}
                style={{ minHeight: "40px", maxHeight: "100px" }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                className="action-button absolute right-2 md:right-3 bottom-2 md:bottom-3 p-1.5 md:p-2 text-indigo-600/70 hover:text-indigo-700/90 transition-colors duration-200"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TherapyChat;
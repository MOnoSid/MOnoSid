import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Volume2, Clock, CheckCheck, Settings, X, Sparkles, Heart } from 'lucide-react';
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
}

const TherapyChat = ({ messages, onSendMessage, isTyping = false }: TherapyChatProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-background">
      {/* Chat Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b"
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg"
          >
            <Heart className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold">Therapy Session</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full mr-2"
              />
              Session Active
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(sessionTime)}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-muted-foreground hover:text-primary"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-4`}
            >
              {!message.isUser && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 mr-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              )}
              <div className={`group max-w-[70%] ${message.isUser ? "items-end" : "items-start"}`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`relative px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
                    message.isUser
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground"
                      : "bg-card border"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                  {!message.isUser && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-primary/10 text-primary rounded-full shadow-sm transition-all duration-200"
                    >
                      <Volume2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
                <div className={`mt-1 flex items-center gap-2 text-xs text-muted-foreground ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}>
                  <span>{message.timestamp || "Just now"}</span>
                  {message.isUser && (
                    <CheckCheck className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>
              {message.isUser && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 ml-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/80 to-primary/60 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">You</span>
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
            className="flex items-center space-x-2 ml-12"
          >
            <div className="flex space-x-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="w-2 h-2 bg-primary rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, repeatType: "reverse" }}
                className="w-2 h-2 bg-primary rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.4, repeat: Infinity, repeatType: "reverse" }}
                className="w-2 h-2 bg-primary rounded-full"
              />
            </div>
            <span className="text-sm text-muted-foreground">AI is thinking...</span>
          </motion.div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 bg-white border-t"
      >
        <div className="flex items-end space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-xl transition-colors duration-200 ${
              isRecording 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            <Mic className="w-5 h-5" />
          </motion.button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-white hover:bg-gray-50 focus:bg-white pr-12 resize-none transition-all duration-200 max-h-32 rounded-xl border text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={1}
              style={{ minHeight: "44px" }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              className="absolute right-2 bottom-2 p-2 text-primary hover:text-primary/80 transition-colors duration-200"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="absolute top-0 right-0 w-80 h-full bg-white border-l shadow-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Add settings options here */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TherapyChat;
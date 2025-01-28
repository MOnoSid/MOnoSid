import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Message {
  text: string;
  isUser: boolean;
}

interface TherapyChatProps {
  messages: Message[];
}

const TherapyChat = ({ messages }: TherapyChatProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b border-therapy-border-light/10">
        <h2 className="text-lg font-semibold text-therapy-text-primary">Therapy Session</h2>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-none"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {!message.isUser && (
              <div className="flex-shrink-0 mr-4 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-therapy-gradient-start to-therapy-gradient-end p-[2px] hover:p-[3px] transition-all duration-300">
                  <div className="w-full h-full rounded-xl bg-therapy-card flex items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-therapy-gradient-start to-therapy-gradient-end text-transparent bg-clip-text">
                      Dr
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div 
              className={`group max-w-[70%] ${message.isUser ? "items-end" : "items-start"}`}
              style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
            >
              <div
                className={`relative px-4 py-3 rounded-2xl transform transition-transform duration-200 hover:scale-[1.02] ${
                  message.isUser
                    ? "bg-gradient-to-r from-therapy-gradient-start to-therapy-gradient-end text-white hover:shadow-lg hover:shadow-therapy-gradient-start/20"
                    : "bg-therapy-surface text-therapy-text-primary hover:shadow-lg hover:shadow-therapy-surface/20"
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                {/* Message tail */}
                <div
                  className={`absolute bottom-0 ${
                    message.isUser ? "-right-2" : "-left-2"
                  } w-4 h-4 ${
                    message.isUser
                      ? "bg-gradient-to-r from-therapy-gradient-start to-therapy-gradient-end"
                      : "bg-therapy-surface"
                  } transform ${message.isUser ? "rotate-45" : "-rotate-45"}`}
                ></div>
                {/* Audio control for bot messages */}
                {!message.isUser && (
                  <button
                    className={`
                      absolute -right-10 top-1/2 -translate-y-1/2
                      p-2 rounded-full
                      text-therapy-text-muted hover:text-therapy-gradient-start
                      transition-colors duration-200
                    `}
                    aria-label="Speak message"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                )}
              </div>
              <div
                className={`mt-1 flex items-center gap-2 text-xs text-therapy-text-muted opacity-0 group-hover:opacity-100 transition-opacity ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <span>12:34 PM</span>
                {message.isUser && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            {message.isUser && (
              <div className="flex-shrink-0 ml-4 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-therapy-secondary to-therapy-tertiary p-[2px] hover:p-[3px] transition-all duration-300">
                  <div className="w-full h-full rounded-xl bg-therapy-card flex items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-therapy-secondary to-therapy-tertiary text-transparent bg-clip-text">
                      You
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapyChat;
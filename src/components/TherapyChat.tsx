import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MoreVertical, Brain } from "lucide-react";

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="bg-[#1A1F2C] border-0 h-[600px]">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold">Conversation</h2>
          <span className="text-gray-400 text-sm">{messages.length} messages</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <ScrollArea className="h-[calc(600px-4rem)] p-6" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl ${
                  message.isUser
                    ? "bg-blue-600 text-white ml-12"
                    : "bg-[#2A2F3C] text-white mr-12"
                }`}
              >
                {!message.isUser && (
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Dr. Sky</span>
                  </div>
                )}
                <p className="leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TherapyChat;
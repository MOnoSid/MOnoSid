import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Message {
  text: string;
  isUser: boolean;
}

interface TherapyChatProps {
  messages: Message[];
}

const TherapyChat = ({ messages }: TherapyChatProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAITyping, setIsAITyping] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-[600px] bg-white shadow-lg rounded-2xl border border-gray-100">
      <ScrollArea className="h-full p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  message.isUser
                    ? "bg-therapy-primary text-white"
                    : "bg-gray-50 text-therapy-text border border-gray-100"
                }`}
              >
                <p className="leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}
          {isAITyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-2xl">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-500">AI is typing...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TherapyChat;
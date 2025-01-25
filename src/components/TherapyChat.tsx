import React from "react";
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
  return (
    <Card className="h-[400px] p-4 bg-white shadow-lg">
      <ScrollArea className="h-full pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? "bg-therapy-primary text-white"
                    : "bg-gray-100 text-therapy-text"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TherapyChat;
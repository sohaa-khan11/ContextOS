"use client";
import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AskTab() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi Soha! Ready to answer questions about the codebase architecture." }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setMessages([...messages, { role: "user", content: query }]);
    setQuery("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "Analyzing context dependencies..." }]);
    }, 600);
  };

  return (
    <Card className="flex flex-col h-[700px] max-h-[80vh] bg-[#180e10] border-[#2c1a1e] premium-shadow overflow-hidden">
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "assistant" 
                  ? "bg-[#261619] text-primary" 
                  : "bg-primary text-white"
              }`}>
                {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              
              <div className={`p-4 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#261619] text-white rounded-[20px] rounded-tr-[4px]"
                  : "bg-transparent text-[#f3e8e8] border border-[#2c1a1e] rounded-[20px] rounded-tl-[4px]"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 bg-[#11090a] border-t border-[#2c1a1e]">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about project architecture, decisions..."
            className="flex-1 bg-[#180e10] border-[#2c1a1e] h-12 focus-visible:ring-primary/40 text-sm"
          />
          <Button 
            type="submit"
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}

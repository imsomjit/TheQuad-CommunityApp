import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, RefreshCw, ChevronLeft } from "lucide-react";
import { chatApi } from "../../services/api";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function AIGuideChat({ onClose }) {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(true); // Start typing immediately on mount
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good evening";
    if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";

    const greetings = [
      `${timeGreeting}! I am your guide to The Quad. If you need any help, you can ask me—I am available for you anytime.`,
      `${timeGreeting}! I'm the official AI Guide for The Quad. I know all about our features, journals, and rules. How can I help you today?`,
      `Hi there, ${timeGreeting.toLowerCase()}! I'm here to help you navigate The Quad. Feel free to ask me any questions about the platform!`
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  useEffect(() => {
    // Simulate initial typing delay
    const timer = setTimeout(() => {
      setMessages([{ role: "ai", content: getGreeting() }]);
      setIsTyping(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleReset = () => {
    setMessages([]);
    setIsTyping(true);
    
    const resetMessages = [
      "Session reset. I'm ready for your next question!",
      "Starting fresh! What would you like to explore next?",
      "Memory cleared. How can I assist you now?",
      "New session started. What's on your mind?"
    ];
    const randomMessage = resetMessages[Math.floor(Math.random() * resetMessages.length)];

    setTimeout(() => {
      setMessages([
        {
          role: "ai",
          content: randomMessage
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue;
    setInputValue("");
    
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    if (!isAuthenticated) {
      const currentCount = guestMessageCount + 1;
      setGuestMessageCount(currentCount);

      if (currentCount >= 3) {
        setTimeout(() => {
          setMessages([
            ...newMessages,
            { 
              role: "ai", 
              content: "I'm glad I could help! To continue our conversation and unlock all features of The Quad (including unlimited AI chats, posting, and saving resources), please **[create a free account](/register)** or **[login](/login)**." 
            }
          ]);
          setIsTyping(false);
        }, 1500);
        return;
      }
    }

    try {
      // Pass the previous history (excluding the new user message)
      const res = await chatApi.generateGuideChat(userMessage, messages);
      setMessages([...newMessages, { role: "ai", content: res.data }]);
    } catch (err) {
      setMessages([
        ...newMessages, 
        { role: "ai", content: "I'm having trouble connecting right now. Please try again later." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-paper/50 relative z-10">
      <div className="flex items-center justify-between border-b border-rule bg-paper-2/50 p-3 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="rounded p-1.5 text-ink-3 hover:bg-rule hover:text-ink transition-colors mr-1"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-syntax-cyan/20 text-syntax-cyan">
            <Bot size={18} />
          </div>
          <span className="font-semibold text-ink">AI Guide</span>
        </div>
        <button
          onClick={handleReset}
          className="p-1.5 text-ink-3 hover:text-ink hover:bg-rule rounded-md transition-colors"
          title="Reset Conversation"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-3" style={{ touchAction: 'pan-y' }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={`flex max-w-[90%] flex-col ${isUser ? "self-end items-end" : "self-start items-start"}`}>
              {!isUser && (
                <span className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-syntax-cyan ml-1 flex items-center gap-1">
                  <Bot size={10} /> The Quad Guide
                </span>
              )}
              <div className={`rounded-2xl px-4 py-2 text-base md:text-sm ${isUser ? "bg-accent text-paper rounded-tr-sm" : "bg-paper-3 text-ink rounded-tl-sm border border-rule shadow-sm"}`}>
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none text-ink">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex self-start items-start flex-col max-w-[85%]">
            <span className="mb-1 text-[11px] font-semibold tracking-wider uppercase text-syntax-cyan ml-1 flex items-center gap-1">
              <Bot size={10} /> The Quad Guide
            </span>
            <div className="flex bg-paper-3 rounded-2xl px-4 py-2 border border-rule items-center gap-1.5 h-[36px] rounded-tl-sm shadow-sm">
              <span className="w-1.5 h-1.5 bg-syntax-cyan rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-syntax-cyan rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-syntax-cyan rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-rule bg-paper-2/50 p-3 backdrop-blur-sm shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping || (!isAuthenticated && guestMessageCount >= 3)}
            placeholder={!isAuthenticated && guestMessageCount >= 3 ? "Please login to continue chatting..." : "Ask about the platform..."}
            className="flex-1 rounded-full border border-rule bg-paper-2 px-4 py-2.5 text-base md:text-sm text-ink placeholder-ink-3 focus:border-syntax-cyan focus:outline-none focus:ring-1 focus:ring-syntax-cyan pr-10 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping || (!isAuthenticated && guestMessageCount >= 3)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-syntax-cyan text-paper transition-all hover:bg-syntax-cyan/90 disabled:opacity-50 disabled:hover:bg-syntax-cyan"
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

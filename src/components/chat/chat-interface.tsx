"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/primarybutton";
import { Textarea } from "@/components/ui/textarea";
import { useGeolocation, getNeighbourhood } from "@/src/hooks/use-geolocation";
import { Send, MapPin, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; category: string }[];
}

interface ChatInterfaceProps {
  userAvatar?: string;
  userName?: string;
}

export function ChatInterface({ userAvatar, userName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [neighbourhood, setNeighbourhood] = useState<string>("Unknown");
  const [seeding, setSeeding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { latitude, longitude, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      getNeighbourhood(latitude, longitude).then(setNeighbourhood);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          neighbourhood,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            sources: data.sources,
          },
        ]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLocation = async () => {
    if (!latitude || !longitude) return;

    setSeeding(true);
    try {
      const response = await fetch("/api/seed-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Loaded ${data.documentsCreated} local data points for ${data.neighbourhood}!`,
        );
      }
    } catch (error) {
      console.error("Seeding failed:", error);
    } finally {
      setSeeding(false);
    }
  };

  const suggestedQueries = [
    "What events are happening nearby?",
    "Find local restaurants",
    "Community news updates",
    "Parks and recreation",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Location badge */}
      <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-sm text-slate-300">
              {geoLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Detecting...
                </span>
              ) : (
                neighbourhood
              )}
            </span>
          </div>
        </div>

        {latitude && longitude && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeedLocation}
            disabled={seeding}
            className="text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
          >
            {seeding ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Refresh local data
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            {/* Welcome icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center animate-bounce">
                <span className="text-xs">👋</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to NeighbourHub
            </h3>
            <p className="text-slate-400 max-w-md mb-8">
              Ask me about local events, businesses, services, or community news
              in your area!
            </p>

            {/* Suggested queries */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {suggestedQueries.map((query, i) => (
                <button
                  key={i}
                  onClick={() => setInput(query)}
                  className="px-4 py-2 text-sm bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-full border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} animate-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-md shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800/80 text-slate-200 rounded-bl-md border border-slate-700/50"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.sources.map((source, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-800/50 text-slate-400 rounded-full border border-slate-700/30"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                      {source.title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-600 flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-300">
                    {(userName?.[0] || "U").toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 bg-slate-800/80 rounded-2xl rounded-bl-md border border-slate-700/50">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-slate-800/50">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-3 p-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 focus-within:border-emerald-500/30 focus-within:shadow-lg focus-within:shadow-emerald-500/5 transition-all duration-200">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your neighbourhood..."
              className="flex-1 min-h-[48px] max-h-[120px] px-3 py-3 bg-transparent border-0 resize-none text-slate-200 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 "
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="icon"
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:shadow-none transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-slate-600">
            Press Enter to send • Shift + Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}

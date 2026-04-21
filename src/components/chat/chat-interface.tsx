"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useGeolocation, getNeighbourhood } from "@/src/hooks/use-geolocation";
import { 
  Send, 
  MapPin, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Coffee, 
  TreePine, 
  Calendar, 
  Shield,
  CheckCircle2,
  AlertCircle,
  Search
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; category: string }[];
}

interface ChatInterfaceProps {
  userAvatar?: string;
  userName?: string;
}

interface SeedingStatus {
  isSeeding: boolean;
  success: boolean | null;
  message: string;
  details?: {
    documentsCreated: number;
    neighbourhood: string;
    categories: Record<string, number>;
  };
}

export function ChatInterface({ userAvatar, userName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [neighbourhood, setNeighbourhood] = useState<string>("Unknown");
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [postcode, setPostcode] = useState("");
  const [showPostcodeInput, setShowPostcodeInput] = useState(false);
  const [seedingStatus, setSeedingStatus] = useState<SeedingStatus>({
    isSeeding: false,
    success: null,
    message: "",
  });
  const [hasSeededLocation, setHasSeededLocation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      setCoordinates({ lat: latitude, lng: longitude });
      getNeighbourhood(latitude, longitude).then(setNeighbourhood);
    } else if (geoError) {
      // Show postcode input if geolocation fails
      setShowPostcodeInput(true);
    }
  }, [latitude, longitude, geoError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Look up postcode and get coordinates
  const handlePostcodeLookup = async () => {
    if (!postcode.trim()) return;
    
    setSeedingStatus({
      isSeeding: true,
      success: null,
      message: "Looking up postcode...",
    });

    try {
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`
      );
      const data = await response.json();
      
      if (data.status === 200 && data.result) {
        const { latitude: lat, longitude: lng, admin_ward, admin_district } = data.result;
        setCoordinates({ lat, lng });
        setNeighbourhood(admin_ward || admin_district || "Unknown");
        setShowPostcodeInput(false);
        
        setSeedingStatus({
          isSeeding: false,
          success: true,
          message: `Found: ${admin_ward || admin_district}`,
        });
        
        // Auto-trigger data load
        setTimeout(() => handleSeedLocation(lat, lng), 500);
      } else {
        setSeedingStatus({
          isSeeding: false,
          success: false,
          message: "Invalid postcode. Please try again.",
        });
      }
    } catch (error) {
      setSeedingStatus({
        isSeeding: false,
        success: false,
        message: "Failed to look up postcode.",
      });
    }
  };

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
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Sorry, I encountered an issue: ${data.error}`,
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
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLocation = async (lat?: number, lng?: number) => {
    const useLat = lat || coordinates?.lat || latitude;
    const useLng = lng || coordinates?.lng || longitude;
    
    if (!useLat || !useLng) {
      setShowPostcodeInput(true);
      return;
    }

    setSeedingStatus({
      isSeeding: true,
      success: null,
      message: "Fetching local data from OpenStreetMap, Police UK, and more...",
    });

    try {
      const response = await fetch("/api/seed-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: useLat, longitude: useLng }),
      });

      const data = await response.json();

      if (data.success) {
        setSeedingStatus({
          isSeeding: false,
          success: true,
          message: `Found ${data.documentsCreated} local places and services!`,
          details: data,
        });
        setHasSeededLocation(true);
        setNeighbourhood(data.neighbourhood || neighbourhood);
        
        setTimeout(() => {
          setSeedingStatus(prev => ({ ...prev, success: null, message: "" }));
        }, 5000);
      } else {
        throw new Error(data.error || "Failed to load data");
      }
    } catch (error) {
      console.error("Seeding failed:", error);
      setSeedingStatus({
        isSeeding: false,
        success: false,
        message: `Error: ${error}`,
      });
    }
  };

  const suggestedQueries = [
    { icon: Coffee, text: "Best cafes nearby", color: "text-amber-400" },
    { icon: TreePine, text: "Parks and green spaces", color: "text-emerald-400" },
    { icon: Calendar, text: "Local events this week", color: "text-blue-400" },
    { icon: Shield, text: "Is this area safe?", color: "text-purple-400" },
  ];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: "🍽️",
      leisure: "🌳",
      event: "📅",
      safety: "🛡️",
      service: "🏛️",
      health: "🏥",
      shopping: "🛒",
      transport: "🚌",
      overview: "📍",
    };
    return icons[category] || "📌";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px]">
      {/* Header with location */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-800/50 bg-slate-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Location badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-full border border-slate-700/50">
              {geoLoading ? (
                <>
                  <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                  <span className="text-sm text-slate-400">Detecting location...</span>
                </>
              ) : geoError && !coordinates ? (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-amber-400">Location unavailable</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-slate-200">{neighbourhood}</span>
                </>
              )}
            </div>

            {hasSeededLocation && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400">Data loaded</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Manual postcode button */}
            {!coordinates && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPostcodeInput(!showPostcodeInput)}
                className="text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full px-4"
              >
                <Search className="h-4 w-4 mr-2" />
                Enter postcode
              </Button>
            )}
            
            {/* Load data button - ALWAYS visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSeedLocation()}
              disabled={seedingStatus.isSeeding || (!coordinates && !latitude)}
              className="text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full px-4"
            >
              {seedingStatus.isSeeding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {hasSeededLocation ? "Refresh data" : "Load local data"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Postcode input */}
        {showPostcodeInput && (
          <div className="mt-3 flex gap-2">
            <Input
              type="text"
              placeholder="Enter UK postcode (e.g., SW1A 1AA)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handlePostcodeLookup()}
              className="flex-1 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
            <Button
              onClick={handlePostcodeLookup}
              disabled={!postcode.trim() || seedingStatus.isSeeding}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {seedingStatus.isSeeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Look up"
              )}
            </Button>
          </div>
        )}

        {/* Status notification */}
        {(seedingStatus.isSeeding || seedingStatus.success !== null) && (
          <div className={`mt-3 px-4 py-3 rounded-xl border ${
            seedingStatus.isSeeding 
              ? "bg-blue-500/10 border-blue-500/20" 
              : seedingStatus.success 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-red-500/10 border-red-500/20"
          }`}>
            <div className="flex items-center gap-2">
              {seedingStatus.isSeeding && <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />}
              {seedingStatus.success === true && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {seedingStatus.success === false && <AlertCircle className="h-4 w-4 text-red-400" />}
              <span className={`text-sm ${
                seedingStatus.isSeeding ? "text-blue-300" : seedingStatus.success ? "text-emerald-300" : "text-red-300"
              }`}>
                {seedingStatus.message}
              </span>
            </div>
            
            {seedingStatus.details?.categories && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(seedingStatus.details.categories).map(([cat, count]) => (
                  <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-800/50 text-slate-300 rounded-md">
                    <span>{getCategoryIcon(cat)}</span>
                    {count} {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Welcome section */}
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
                <Sparkles className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-sm">👋</span>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-3">
              Welcome to NeighbourHub
            </h3>
            <p className="text-slate-400 max-w-md mb-4 leading-relaxed">
              Your AI-powered guide to local events, businesses, and community news.
            </p>

            {/* First-time prompt */}
            {!hasSeededLocation && (
              <div className="mb-8 px-5 py-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 max-w-md">
                {coordinates || latitude ? (
                  <p className="text-sm text-emerald-300">
                    📍 Click <strong>"Load local data"</strong> above to fetch information about {neighbourhood}
                  </p>
                ) : (
                  <p className="text-sm text-amber-300">
                    📍 Click <strong>"Enter postcode"</strong> above to set your location manually
                  </p>
                )}
              </div>
            )}

            {/* Suggested queries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full">
              {suggestedQueries.map((query, i) => (
                <button
                  key={i}
                  onClick={() => setInput(query.text)}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-left rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-200 group"
                >
                  <query.icon className={`w-5 h-5 ${query.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm text-slate-300 group-hover:text-white">{query.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`max-w-[80%] sm:max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-lg shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/80 text-slate-200 rounded-bl-lg border border-slate-700/50"
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.sources.slice(0, 5).map((source, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800/60 text-slate-400 rounded-lg border border-slate-700/30">
                      <span>{getCategoryIcon(source.category)}</span>
                      {source.title.length > 20 ? source.title.slice(0, 20) + "..." : source.title}
                    </span>
                  ))}
                  {msg.sources.length > 5 && (
                    <span className="text-xs text-slate-500 px-2 py-1">+{msg.sources.length - 5} more</span>
                  )}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-600 flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-slate-300">{(userName?.[0] || "U").toUpperCase()}</span>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="px-5 py-4 bg-slate-800/80 rounded-2xl rounded-bl-lg border border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-sm text-slate-500 ml-2">Searching...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 sm:px-6 py-4 border-t border-slate-800/50 bg-slate-900/50">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-3 p-2 bg-slate-800/60 rounded-2xl border border-slate-700/50 focus-within:border-emerald-500/40 focus-within:shadow-lg focus-within:shadow-emerald-500/10 transition-all duration-200">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${neighbourhood !== "Unknown" ? neighbourhood : "your neighbourhood"}...`}
              className="flex-1 min-h-[52px] max-h-[150px] px-4 py-3 bg-transparent border-0 resize-none text-slate-200 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px]"
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
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:shadow-none transition-all duration-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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

import { LoginButton } from '@/src/components/auth/login-button'
import { MapPin, Sparkles, Coffee, TreePine, Calendar, Shield } from 'lucide-react'

export default function LoginPage() {
  const features = [
    { icon: Coffee, text: "Discover local cafes & restaurants" },
    { icon: TreePine, text: "Find parks and green spaces" },
    { icon: Calendar, text: "Stay updated on local events" },
    { icon: Shield, text: "Get neighbourhood safety info" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">NeighbourHub</h1>
          <p className="text-slate-400 text-center">
            Your AI-powered community assistant
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/60 shadow-2xl overflow-hidden">
          {/* Features */}
          <div className="p-6 border-b border-slate-800/50">
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 rounded-xl"
                >
                  <feature.icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Login section */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-sm text-slate-500">Sign in to continue</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            
            <LoginButton />

            <p className="mt-6 text-center text-xs text-slate-600">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-600">
          Powered by OpenStreetMap, Police UK API & Gemini AI
        </p>
      </div>
    </div>
  )
}
import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/src/components/chat/chat-interface'
import { MapPin, LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl" />
      </div>
      
      {/* Main container - CENTERED */}
      <div className="relative z-10 min-h-screen flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          {/* Logo section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                NeighbourHub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                AI-powered local assistant
              </p>
            </div>
          </div>
          
          {/* User section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-200">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 truncate max-w-[150px]">
                {user.email}
              </p>
            </div>
            
            {/* Avatar */}
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-700 group-hover:ring-emerald-500/50 flex items-center justify-center overflow-hidden cursor-pointer transition-all">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-300">
                    {initials}
                  </span>
                )}
              </div>
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-2 border-b border-slate-700/50 sm:hidden">
                  <p className="text-sm font-medium text-slate-200 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="px-2 pt-1 sm:pt-0">
                  <form action="/auth/signout" method="post">
                    <button 
                      type="submit" 
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main chat container */}
        <main className="flex-1 relative flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-teal-500/5 rounded-3xl blur-2xl" />
          
          <div className="relative flex-1 flex flex-col bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/60 shadow-2xl shadow-black/20 overflow-hidden">
            <ChatInterface 
              userAvatar={profile?.avatar_url}
              userName={profile?.full_name}
            />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-slate-600">
            Powered by OpenStreetMap, Police UK API & Gemini AI
          </p>
        </footer>
      </div>
    </div>
  )
}

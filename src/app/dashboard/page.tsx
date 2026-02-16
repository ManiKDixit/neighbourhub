/*import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/src/components/chat/chat-interface'

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

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NeighbourHub</h1>
          <p className="text-muted-foreground">Your AI community assistant</p>
        </div>
        <div className="text-sm text-right">
          <p>{profile?.full_name || user.email}</p>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-muted-foreground hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <ChatInterface 
        userAvatar={profile?.avatar_url}
        userName={profile?.full_name}
      />
    </div>
  )
} */

  import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/src/components/chat/chat-interface'
import { MapPin } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI1MmIiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      
      {/* Gradient orbs for depth */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 container max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                NeighbourHub
              </h1>
              <p className="text-sm text-slate-400">
                Your AI community assistant
              </p>
            </div>
          </div>
          
          {/* User section */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-200">
                {profile?.full_name || user.email}
              </p>
              <form action="/auth/signout" method="post">
                <button 
                  type="submit" 
                  className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-700 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-slate-300">
                    {(profile?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main chat area */}
        <main className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-3xl blur-xl" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/50 shadow-2xl overflow-hidden">
            <ChatInterface 
              userAvatar={profile?.avatar_url}
              userName={profile?.full_name}
            />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className="text-xs text-slate-600">
            Powered by local community data • Built with ❤️ for neighbourhoods
          </p>
        </footer>
      </div>
    </div>
  )
}

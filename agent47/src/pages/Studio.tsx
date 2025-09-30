import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BotPanel from '@/components/BotPanel'
import DocumentSidebar from '@/components/DocumentSidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Settings,
  FileText,
  Users,
  Grid3X3,
  Maximize2,
  Minimize2,
  LogOut
} from 'lucide-react'

interface BotActivity {
  [key: number]: string
}

interface User {
  id: string
  email: string
}

export default function Studio() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [botActivity, setBotActivity] = useState<BotActivity>({})
  const [showDocuments, setShowDocuments] = useState(true)
  const [maximizedBot, setMaximizedBot] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          navigate('/login')
          return
        }

        // TODO: Validate token with backend
        // For now, mock user data
        setUser({
          id: 'user-1',
          email: 'user@example.com'
        })
      } catch (error) {
        console.error('Auth check failed:', error)
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  const handleBotActivity = (botNumber: number, topic: string) => {
    setBotActivity(prev => ({
      ...prev,
      [botNumber]: topic
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/')
  }

  const toggleMaximize = (botNumber: number) => {
    setMaximizedBot(maximizedBot === botNumber ? null : botNumber)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Grid3X3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading Author's Studio...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getOtherBotsActivity = (currentBot: number) => {
    const other = { ...botActivity }
    delete other[currentBot]
    return other
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50 sticky top-0 z-20">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Author's Studio</h1>
                <p className="text-xs text-muted-foreground">
                  Multi-Agent Writing Platform
                </p>
              </div>
            </div>

            {/* Active Bot Indicator */}
            <div className="hidden md:flex items-center space-x-4">
              {[1, 2, 3, 4].map((botNum) => (
                <div key={botNum} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    botActivity[botNum] && botActivity[botNum] !== 'Idle' && botActivity[botNum] !== 'Ready'
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-muted-foreground/30'
                  }`}></div>
                  <span className="text-xs text-muted-foreground">Bot {botNum}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDocuments(!showDocuments)}
            >
              <FileText className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Document Sidebar */}
        {showDocuments && (
          <div className="w-80 border-r border-border/50 bg-card/30">
            <DocumentSidebar userId={user.id} />
          </div>
        )}

        {/* Main Bot Grid */}
        <div className="flex-1 p-4">
          {maximizedBot ? (
            // Maximized Single Bot View
            <div className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Bot {maximizedBot} - Maximized View
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMaximizedBot(null)}
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Show All Bots
                </Button>
              </div>
              <BotPanel
                botNumber={maximizedBot as 1 | 2 | 3 | 4}
                userId={user.id}
                onActivityUpdate={handleBotActivity}
                otherBotsActivity={getOtherBotsActivity(maximizedBot)}
              />
            </div>
          ) : (
            // 4-Panel Grid View
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {[1, 2, 3, 4].map((botNumber) => (
                <div key={botNumber} className="relative group">
                  {/* Maximize Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => toggleMaximize(botNumber)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>

                  <BotPanel
                    botNumber={botNumber as 1 | 2 | 3 | 4}
                    userId={user.id}
                    onActivityUpdate={handleBotActivity}
                    otherBotsActivity={getOtherBotsActivity(botNumber)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-border/50 bg-background/50 backdrop-blur-sm px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Connected to NeonDB</span>
            <span>•</span>
            <span>4 Bots Active</span>
            <span>•</span>
            <span>Google Search Enabled</span>
          </div>
          <div className="hidden md:block">
            Author's Studio v1.0.0
          </div>
        </div>
      </div>
    </div>
  )
}
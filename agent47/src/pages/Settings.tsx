import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Key, Database, Palette, Info } from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState('')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-primary" />
                <CardTitle>API Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure your Google Gemini API key to enable AI functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                  Google Gemini API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key here..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Get your API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
              <Button>Save API Key</Button>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-500" />
                <CardTitle>Database Status</CardTitle>
              </div>
              <CardDescription>
                Your conversation data is stored securely in NeonDB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Connected to NeonDB</span>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-blue-500" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize the look and feel of your AI agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Currently enabled by default
                  </p>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-purple-500" />
                <CardTitle>About Agent 47</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>AI Model:</strong> Google Gemini 1.5 Flash</p>
                <p><strong>Database:</strong> NeonDB (PostgreSQL)</p>
                <p><strong>Deployment:</strong> Netlify Functions</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Built with React, TypeScript, Tailwind CSS, and Vite for the ultimate
                  development experience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
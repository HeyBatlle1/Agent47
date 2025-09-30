import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Sparkles, Zap, Shield, Brain, Rocket, UserPlus, LogIn } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Agent 47</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            Settings
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            Author's Studio
            <br />
            Multi-Agent AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Write with 4 specialized AI assistants working together.
            Upload documents, generate images, and craft amazing content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="text-lg px-8 py-6 animate-slide-up"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-6 animate-slide-up"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powered by Google Gemini
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced AI capabilities at your fingertips with a beautiful, responsive interface.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="animate-slide-up border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Instant responses powered by Gemini 1.5 Flash with conversation memory
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-slide-up border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>Image Generation</CardTitle>
              <CardDescription>
                Create stunning visuals from text descriptions using advanced AI models
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-slide-up border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your conversations are stored securely with your own database instance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-slide-up border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>
                Never lose track of important discussions with persistent chat history
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-slide-up border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle>One-Click Deploy</CardTitle>
              <CardDescription>
                Clone, configure, and deploy your own instance in minutes with Netlify
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-slide-up border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-pink-500" />
              </div>
              <CardTitle>Smart & Adaptive</CardTitle>
              <CardDescription>
                Context-aware AI that learns from your conversation patterns
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users already exploring the possibilities with their personal AI agent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="text-lg px-8 py-6"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Launch Studio
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-6"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Built with ❤️ using React, Vite, Tailwind CSS, and Google Gemini</p>
        </div>
      </footer>
    </div>
  )
}
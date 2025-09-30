import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid3X3, Mail, Lock, UserPlus, AlertCircle, CheckCircle, Users } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userCount, setUserCount] = useState(0)

  // Check user count on component mount
  useState(() => {
    const checkUserCount = async () => {
      try {
        const response = await fetch('/.netlify/functions/auth-signup', {
          method: 'GET'
        })
        const data = await response.json()
        setUserCount(data.userCount || 0)
      } catch (error) {
        console.error('Failed to check user count:', error)
      }
    }

    checkUserCount()
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (userCount >= 10) {
      setError('Maximum user limit reached. This is a MVP with a 10-user limit.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/.netlify/functions/auth-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Signup failed')
      }

      const { token, user } = await response.json()

      // Store auth token
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Redirect to studio
      navigate('/studio')

    } catch (error) {
      console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isLimitReached = userCount >= 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Grid3X3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Join Author's Studio</h1>
          <p className="text-muted-foreground">
            Create your account to access the multi-agent writing platform
          </p>
        </div>

        {/* User Limit Warning */}
        <Card className="mb-6 bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  MVP Limited Access
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {isLimitReached
                    ? 'User limit reached (10/10). No new signups available.'
                    : `${10 - userCount} spots remaining (${userCount}/10 users)`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signup Form */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              {isLimitReached
                ? 'Signup is currently disabled due to user limit'
                : 'Start your journey with 4 AI writing assistants'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLimitReached ? (
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  We've reached our MVP user limit of 10 users. Please check back later
                  or contact us if you're interested in early access to the full version.
                </p>
                <Link to="/login">
                  <Button variant="outline">
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password (min 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        {!isLimitReached && (
          <Card className="mt-6 bg-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  What you'll get:
                </span>
              </div>
              <ul className="text-xs text-green-600 dark:text-green-400 space-y-1 ml-6">
                <li>• 4 simultaneous AI writing assistants</li>
                <li>• Document upload & semantic search</li>
                <li>• Image generation with Bot #1</li>
                <li>• Cross-bot awareness & collaboration</li>
                <li>• Google Search integration</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
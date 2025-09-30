import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Send,
  Bot,
  User,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Copy,
  Check
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'model'
  content: string
  images?: string[]
  timestamp: Date
}

interface BotPanelProps {
  botNumber: 1 | 2 | 3 | 4
  userId: string
  onActivityUpdate?: (botNumber: number, topic: string) => void
  otherBotsActivity?: { [key: number]: string }
}

const BOT_CONFIGS = {
  1: {
    name: 'Image Bot',
    description: 'Creative Assistant with Image Generation',
    color: 'from-purple-500 to-pink-500',
    capabilities: ['Text Generation', 'Image Creation', 'Visual Editing'],
    model: 'gemini-2.5-flash-image-preview'
  },
  2: {
    name: 'Research Bot',
    description: 'Research & Analysis Assistant',
    color: 'from-blue-500 to-cyan-500',
    capabilities: ['Research', 'Analysis', 'Fact-Checking'],
    model: 'gemini-2.5-flash'
  },
  3: {
    name: 'Writing Bot',
    description: 'Creative Writing Assistant',
    color: 'from-green-500 to-emerald-500',
    capabilities: ['Creative Writing', 'Editing', 'Style Guidance'],
    model: 'gemini-2.5-flash'
  },
  4: {
    name: 'Structure Bot',
    description: 'Plot & Structure Assistant',
    color: 'from-orange-500 to-red-500',
    capabilities: ['Plot Development', 'Story Structure', 'Character Arcs'],
    model: 'gemini-2.5-flash'
  }
}

export default function BotPanel({ botNumber, userId, onActivityUpdate, otherBotsActivity }: BotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const config = BOT_CONFIGS[botNumber]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = input.trim()
    setInput('')
    setIsLoading(true)

    // Update activity
    onActivityUpdate?.(botNumber, `Discussing: ${messageText.slice(0, 50)}...`)

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationId,
          botNumber,
          userId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.response,
        images: data.images || [],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      onActivityUpdate?.(botNumber, 'Idle')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearConversation = () => {
    setMessages([])
    setConversationId(null)
    onActivityUpdate?.(botNumber, 'Ready')
  }

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
      {/* Bot Header */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center`}>
              {botNumber === 1 ? (
                <ImageIcon className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{config.name}</h3>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {botNumber === 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageUpload(!showImageUpload)}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => {/* TODO: document search */}}>
              <FileText className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearConversation}>
              Clear
            </Button>
          </div>
        </div>

        {/* Bot Capabilities */}
        <div className="flex flex-wrap gap-1 mt-2">
          {config.capabilities.map((capability) => (
            <span
              key={capability}
              className="px-2 py-1 text-xs bg-secondary/50 rounded-md text-secondary-foreground"
            >
              {capability}
            </span>
          ))}
        </div>

        {/* Other Bots Activity */}
        {otherBotsActivity && Object.keys(otherBotsActivity).length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Other bots:</span>
            </div>
            {Object.entries(otherBotsActivity).map(([botNum, activity]) => (
              <div key={botNum} className="ml-4 truncate">
                Bot {botNum}: {activity}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 animate-fade-in">
            <div className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
              {botNumber === 1 ? (
                <ImageIcon className="w-6 h-6 text-white" />
              ) : (
                <Bot className="w-6 h-6 text-white" />
              )}
            </div>
            <h4 className="font-medium mb-2">{config.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {config.description}
            </p>
            <div className="space-y-2 text-xs">
              {botNumber === 1 && (
                <p className="text-purple-400">• Can generate and edit images</p>
              )}
              <p className="text-blue-400">• Access to uploaded documents</p>
              <p className="text-green-400">• Aware of other bot conversations</p>
              <p className="text-orange-400">• Google Search enabled</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 animate-slide-up ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : `bg-gradient-to-br ${config.color} text-white`
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : botNumber === 1 ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div className={`flex-1 ${
                  message.role === 'user' ? 'flex justify-end' : ''
                }`}>
                  <Card className={`p-3 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  }`}>
                    <div className="space-y-2">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      {message.images && message.images.length > 0 && (
                        <div className="grid grid-cols-1 gap-2">
                          {message.images.map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`Generated image ${idx + 1}`}
                              className="rounded-lg max-w-full h-auto"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${
                          message.role === 'user'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.role === 'model' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="h-5 px-1"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3 animate-slide-up">
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} text-white flex items-center justify-center`}>
                  {botNumber === 1 ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <Card className="p-3 bg-card">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-muted-foreground text-xs">{config.name} is thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Image Upload Area (Bot 1 only) */}
      {botNumber === 1 && showImageUpload && (
        <div className="border-t border-border/50 p-4 bg-secondary/20">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Upload images for editing or analysis
            </p>
            <Button variant="outline" size="sm">
              Choose Images
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border/50 p-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${config.name}...`}
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className={`bg-gradient-to-br ${config.color} hover:opacity-90`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          @ to reference documents • Enter to send
        </p>
      </div>
    </Card>
  )
}
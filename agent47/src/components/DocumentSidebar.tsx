import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Upload,
  FileText,
  Search,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileIcon
} from 'lucide-react'

interface Document {
  id: string
  filename: string
  fileType: string
  fileSize: number
  uploadedAt: Date
  content?: string
}

interface DocumentSidebarProps {
  userId: string
}

export default function DocumentSidebar({ userId }: DocumentSidebarProps) {
  const [documents, setDocuments] = useState<Document[]>([
    // Mock data for development
    {
      id: '1',
      filename: 'Character Development Guide.pdf',
      fileType: 'pdf',
      fileSize: 245760,
      uploadedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      filename: 'Plot Outline Draft.md',
      fileType: 'md',
      fileSize: 12480,
      uploadedAt: new Date('2024-01-14')
    },
    {
      id: '3',
      filename: 'Research Notes.txt',
      fileType: 'txt',
      fileSize: 8192,
      uploadedAt: new Date('2024-01-13')
    }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-600" />
      default:
        return <FileIcon className="w-4 h-4 text-muted-foreground" />
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      for (const file of files) {
        // Validate file type
        const allowedTypes = ['pdf', 'txt', 'md', 'docx']
        const fileExtension = file.name.split('.').pop()?.toLowerCase()

        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          alert(`File type .${fileExtension} not supported. Please use PDF, TXT, MD, or DOCX files.`)
          continue
        }

        // Read file content
        const content = await readFileContent(file)

        // TODO: Upload to backend
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', userId)

        // Mock upload for now
        const newDocument: Document = {
          id: Date.now().toString(),
          filename: file.name,
          fileType: fileExtension,
          fileSize: file.size,
          uploadedAt: new Date(),
          content
        }

        setDocuments(prev => [newDocument, ...prev])
      }
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const handleDocumentDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // TODO: Delete from backend
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  const handleDocumentView = (document: Document) => {
    // TODO: Open document viewer/editor
    console.log('View document:', document)
  }

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <span className="text-xs text-muted-foreground">
            {documents.length} files
          </span>
        </div>

        {/* Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full mb-3"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Documents'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? (
              <>
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No documents found matching "{searchQuery}"
                </p>
              </>
            ) : (
              <>
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  No documents uploaded yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload PDF, TXT, MD, or DOCX files to share with all bots
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="bg-card/50 hover:bg-card/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(document.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {document.filename}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {document.uploadedAt.toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDocumentView(document)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDocumentDelete(document.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Reference Hint */}
                  <div className="mt-3 pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono bg-secondary/50 px-1 rounded">
                        @{document.filename}
                      </span>{' '}
                      to reference in chat
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Usage Info */}
      <div className="p-4 border-t border-border/50 bg-secondary/20">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> All 4 bots can access these documents</p>
          <p>🔍 Use @ to reference documents in conversations</p>
          <p>📊 Vector search enabled for semantic queries</p>
        </div>
      </div>
    </div>
  )
}
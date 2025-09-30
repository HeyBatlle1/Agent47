# Author's Studio - Multi-Agent Writing Platform

A production-ready, visually stunning writing platform with 4 specialized AI agents working together. Built with React, Vite, Netlify Functions, and Google Gemini.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/HeyBatlle1/Agent47)

**🔗 Repository**: [https://github.com/HeyBatlle1/Agent47](https://github.com/HeyBatlle1/Agent47)

## 🌟 Features

### 🤖 Four Specialized AI Agents
- **Bot 1 - Image Bot**: Creative writing with image generation and editing (Gemini 2.5 Flash Image Preview)
- **Bot 2 - Research Bot**: Research and analysis with Google Search grounding (Gemini 2.5 Flash)
- **Bot 3 - Writing Bot**: Creative writing and editing assistance (Gemini 2.5 Flash)
- **Bot 4 - Structure Bot**: Plot development and story structure (Gemini 2.5 Flash)

### 📚 Advanced Document Management
- Upload PDF, TXT, MD, and DOCX files
- Vector embeddings for semantic search
- Shared access across all 4 bots
- Reference documents with `@filename` syntax

### 🔄 Cross-Bot Awareness
- Bots are aware of each other's activities
- Shared context and document access
- Real-time activity indicators
- Independent conversation threads

### 🎨 Beautiful UI/UX
- Dark mode by default with light mode toggle
- Mobile-first responsive design
- Smooth animations and micro-interactions
- Professional typography with Inter font
- shadcn/ui component library

### 🔐 Secure Authentication
- Email/password authentication with bcrypt
- JWT tokens for session management
- Hard limit of 10 users for MVP
- User session persistence

## 🚀 One-Click Setup

### Prerequisites
- Node.js 18+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- NeonDB account ([Sign up here](https://neon.tech))

### Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/HeyBatlle1/Agent47.git
   cd Agent47
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:
   ```env
   GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
   NEON_DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require&channel_binding=require
   ```

3. **Database Setup**
   ```bash
   node db/migrate.cjs
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   ```

## 🌐 Netlify Deployment

### Automatic Deployment

1. **Click the Deploy button above** or manually deploy:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**

   Add these in Netlify Dashboard → Site Settings → Environment Variables:
   ```
   GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
   NEON_DATABASE_URL=your_neon_database_connection_string
   ```

3. **Functions Configuration**

   Netlify automatically detects the `netlify/functions` directory for serverless functions.

### Manual Deployment

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 🏗️ Architecture

### Frontend Stack
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Zustand** for state management
- **React Router** for navigation

### Backend Stack
- **Netlify Functions** (serverless)
- **NeonDB** (PostgreSQL) with vector extensions
- **Google Gemini 2.5 Flash** for AI
- **bcrypt** for password hashing
- **JWT** for authentication

### Database Schema

```sql
-- Core tables
users (id, email, password_hash, created_at)
documents (id, user_id, filename, content, embedding[768])
conversations (id, user_id, bot_number, title, created_at)
messages (id, conversation_id, role, content, images[], timestamp)
bot_activity (id, user_id, bot_number, current_topic, status)
user_preferences (id, user_id, key, value)
```

## 🛠️ API Endpoints

### Authentication
- `POST /.netlify/functions/auth-signup` - User registration
- `POST /.netlify/functions/auth-login` - User login
- `GET /.netlify/functions/auth-signup` - Check user count

### AI Chat
- `POST /.netlify/functions/chat` - Send message to any bot (1-4)
- `POST /.netlify/functions/generate-image` - Generate images (Bot 1 only)

### Documents
- `POST /.netlify/functions/document-upload` - Upload documents
- `POST /.netlify/functions/document-retrieve` - Semantic document search

### Conversations
- `GET /.netlify/functions/conversations` - List user conversations
- `POST /.netlify/functions/conversations` - Create new conversation
- `DELETE /.netlify/functions/conversations/:id` - Delete conversation

## 🎯 Gemini Configuration

Each bot uses specific Gemini models and configurations:

```javascript
// Bot 1 (Image Generation)
{
  model: "gemini-2.5-flash-image-preview",
  temperature: 1.1,
  topP: 0.9,
  tools: [
    { googleSearch: {} },
    { functionDeclarations: [documentRetrieval, crossBotAwareness] }
  ]
}

// Bots 2-4 (Text Only)
{
  model: "gemini-2.5-flash",
  temperature: 1.1,
  topP: 0.9,
  tools: [
    { googleSearch: {} },
    { functionDeclarations: [documentRetrieval, crossBotAwareness] }
  ]
}
```

## 📱 Usage Guide

### Getting Started
1. **Sign up** (limited to 10 users in MVP)
2. **Upload documents** for shared context
3. **Start conversations** with any of the 4 bots
4. **Reference documents** using `@filename` syntax
5. **Switch between bots** or use multiple simultaneously

### Document References
```
@research-notes.pdf - Reference entire document
@character-guide.md - Reference character development guide
```

### Bot Specializations
- **Image Bot**: "Generate a book cover for my fantasy novel"
- **Research Bot**: "Research medieval castle architecture for my story"
- **Writing Bot**: "Help me write a compelling dialogue scene"
- **Structure Bot**: "Outline the three-act structure for my screenplay"

## 🔧 Development

### Project Structure
```
/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── BotPanel.tsx  # Reusable bot interface
│   │   └── DocumentSidebar.tsx
│   ├── pages/
│   │   ├── auth/         # Login/Signup pages
│   │   ├── Landing.tsx   # Marketing landing page
│   │   ├── Studio.tsx    # Main 4-panel interface
│   │   └── Settings.tsx  # User settings
│   └── lib/              # Utilities and helpers
├── netlify/functions/    # Serverless API endpoints
├── db/                   # Database schema and migrations
└── docs/                 # Additional documentation
```

### Local Development

```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```bash
# Required
GOOGLE_GENAI_API_KEY=your_api_key
NEON_DATABASE_URL=postgresql://...

# Optional
NODE_ENV=development
```

## 🚨 Limitations (MVP)

- **User Limit**: Maximum 10 users
- **No File Storage**: Images are stored as base64 in database
- **No User Management**: No admin panel or user deletion
- **Basic Auth**: No OAuth, password reset, or email verification
- **No Rate Limiting**: Unlimited API calls per user

## 🔮 Future Enhancements

- [ ] Remove 10-user limit
- [ ] Add file storage (AWS S3/CloudFlare R2)
- [ ] OAuth authentication (Google, GitHub)
- [ ] Admin dashboard
- [ ] Usage analytics and billing
- [ ] Real-time collaboration
- [ ] Custom bot personalities
- [ ] Export conversations to various formats
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://deepmind.google/technologies/gemini/) for powerful AI capabilities
- [NeonDB](https://neon.tech) for serverless PostgreSQL
- [Netlify](https://netlify.com) for seamless deployment
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Tailwind CSS](https://tailwindcss.com) for rapid styling

---

**Built with ❤️ for writers, by writers**

*Author's Studio - Where creativity meets AI innovation*

**Repository**: https://github.com/HeyBatlle1/Agent47
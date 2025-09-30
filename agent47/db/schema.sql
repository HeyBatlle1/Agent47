-- Author's Studio Database Schema
-- Multi-Agent Writing Platform with NeonDB PostgreSQL

-- Enable UUID and vector extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table with authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Documents table with vector embeddings for semantic search
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    file_type VARCHAR(10) NOT NULL, -- pdf, txt, docx, md
    file_size INTEGER,
    embedding VECTOR(768), -- for semantic search
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Conversations table for each bot (1-4)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_number INTEGER NOT NULL CHECK (bot_number BETWEEN 1 AND 4),
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Messages within conversations
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    images TEXT[], -- base64 or URLs, only for bot 1
    function_calls JSONB DEFAULT '[]', -- for document retrieval, cross-bot awareness
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot activity tracking for cross-bot awareness
CREATE TABLE bot_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_number INTEGER NOT NULL CHECK (bot_number BETWEEN 1 AND 4),
    current_topic TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'thinking', 'responding'))
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, key)
);

-- Create indexes for performance
CREATE INDEX idx_messages_conversation_timestamp ON messages(conversation_id, timestamp DESC);
CREATE INDEX idx_conversations_user_bot ON conversations(user_id, bot_number);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_documents_user_uploaded ON documents(user_id, uploaded_at DESC);
CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_bot_activity_user_bot ON bot_activity(user_id, bot_number);
CREATE INDEX idx_users_email ON users(email);

-- Function to check user limit (max 10 users)
CREATE OR REPLACE FUNCTION check_user_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM users WHERE is_active = true) >= 10 THEN
        RAISE EXCEPTION 'User limit reached. Maximum 10 users allowed for MVP.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce user limit
CREATE TRIGGER enforce_user_limit
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_user_limit();

-- Initialize bot activity for all 4 bots when user is created
CREATE OR REPLACE FUNCTION init_user_bots()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bot_activity (user_id, bot_number, current_topic, status)
    VALUES
        (NEW.id, 1, 'Ready for image generation and writing', 'idle'),
        (NEW.id, 2, 'Ready for writing assistance', 'idle'),
        (NEW.id, 3, 'Ready for writing assistance', 'idle'),
        (NEW.id, 4, 'Ready for writing assistance', 'idle');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize bots for new users
CREATE TRIGGER init_bots_for_user
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION init_user_bots();
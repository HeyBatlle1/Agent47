-- =====================================
-- ToS Salad NeonDB Migration Script
-- CONVERTED FROM SUPABASE TO NEONDB
-- =====================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table for authentication (simplified version for NeonDB)
-- Note: This replaces auth.users from Supabase
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Core Companies Table
CREATE TABLE tos_analysis_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  industry TEXT,
  headquarters TEXT,
  founded_year INTEGER,
  employee_count_range TEXT,
  revenue_range TEXT,
  stock_symbol TEXT,
  business_model TEXT,
  primary_services TEXT[],
  tos_url TEXT,
  privacy_policy_url TEXT,
  data_policy_url TEXT,
  community_guidelines_url TEXT,
  corporate_website TEXT,
  last_scraped_at TIMESTAMPTZ,
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Documents Table
CREATE TABLE tos_analysis_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES tos_analysis_companies(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('terms_of_service', 'privacy_policy', 'data_policy', 'community_guidelines', 'cookie_policy', 'other')) NOT NULL,
  title TEXT,
  url TEXT NOT NULL,
  raw_content TEXT,
  cleaned_content TEXT,
  content_hash TEXT,
  scraped_at TIMESTAMPTZ NOT NULL,
  http_status INTEGER,
  content_length INTEGER,
  content_type TEXT,
  last_modified_header TEXT,
  etag TEXT,
  is_analyzed BOOLEAN DEFAULT FALSE,
  analysis_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Analysis Results Table
CREATE TABLE tos_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES tos_analysis_documents(id) ON DELETE CASCADE,
  company_id UUID REFERENCES tos_analysis_companies(id) ON DELETE CASCADE,
  transparency_score INTEGER,
  user_friendliness_score INTEGER,
  privacy_score INTEGER,
  manipulation_risk_score INTEGER,
  data_collection_risk TEXT CHECK (data_collection_risk IN ('low', 'medium', 'high', 'critical')),
  data_sharing_risk TEXT CHECK (data_sharing_risk IN ('low', 'medium', 'high', 'critical')),
  account_termination_risk TEXT CHECK (account_termination_risk IN ('low', 'medium', 'high', 'critical')),
  legal_jurisdiction_risk TEXT CHECK (legal_jurisdiction_risk IN ('low', 'medium', 'high', 'critical')),
  concerning_clauses JSONB,
  manipulation_tactics JSONB,
  user_rights_analysis JSONB,
  data_retention_analysis JSONB,
  third_party_sharing JSONB,
  gdpr_compliance_status TEXT,
  ccpa_compliance_status TEXT,
  coppa_compliance_status TEXT,
  regulatory_notes TEXT,
  ai_model_used TEXT NOT NULL,
  analysis_version TEXT NOT NULL,
  analyzed_at TIMESTAMPTZ NOT NULL,
  analysis_duration_ms INTEGER,
  executive_summary TEXT,
  key_concerns TEXT[],
  recommendations TEXT[],
  red_flags JSONB,
  summary TEXT,
  full_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Bookmarks Table (references local users table instead of auth.users)
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES tos_analysis_results(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for Performance
CREATE INDEX idx_companies_domain ON tos_analysis_companies(domain);
CREATE INDEX idx_companies_updated ON tos_analysis_companies(updated_at DESC);
CREATE INDEX idx_documents_company ON tos_analysis_documents(company_id);
CREATE INDEX idx_documents_scraped ON tos_analysis_documents(scraped_at DESC);
CREATE INDEX idx_analysis_company ON tos_analysis_results(company_id);
CREATE INDEX idx_analysis_document ON tos_analysis_results(document_id);
CREATE INDEX idx_analysis_date ON tos_analysis_results(analyzed_at DESC);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_analysis ON bookmarks(analysis_id);
CREATE INDEX idx_users_email ON users(email);

-- Functions for updated_at triggers (replacing Supabase's automatic handling)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at columns
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON tos_analysis_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON tos_analysis_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- MIGRATION COMPLETE - SCHEMA READY
-- =====================================
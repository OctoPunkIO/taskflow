-- GitHub Integration Tables
-- This migration adds support for linking TaskFlow tasks with GitHub issues and pull requests

-- Table for storing GitHub OAuth integrations per user
CREATE TABLE github_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    github_user_id BIGINT NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one integration per user
    UNIQUE(user_id)
);

-- Table for storing links between tasks and GitHub items
CREATE TABLE github_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    github_type VARCHAR(20) NOT NULL CHECK (github_type IN ('issue', 'pull_request')),
    github_repo VARCHAR(255) NOT NULL, -- Format: "owner/repo"
    github_number INTEGER NOT NULL,
    github_url TEXT NOT NULL,
    sync_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate links for the same GitHub item to the same task
    UNIQUE(task_id, github_repo, github_number, github_type)
);

-- Indexes for performance
CREATE INDEX idx_github_integrations_user_id ON github_integrations(user_id);
CREATE INDEX idx_github_integrations_github_user_id ON github_integrations(github_user_id);
CREATE INDEX idx_github_links_task_id ON github_links(task_id);
CREATE INDEX idx_github_links_repo_number ON github_links(github_repo, github_number);
CREATE INDEX idx_github_links_sync_enabled ON github_links(sync_enabled) WHERE sync_enabled = true;

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_github_integrations_updated_at 
    BEFORE UPDATE ON github_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_links_updated_at 
    BEFORE UPDATE ON github_links 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE github_integrations IS 'Stores GitHub OAuth tokens and user mappings';
COMMENT ON TABLE github_links IS 'Links between TaskFlow tasks and GitHub issues/PRs';
COMMENT ON COLUMN github_links.github_repo IS 'Repository in "owner/repo" format';
COMMENT ON COLUMN github_links.sync_enabled IS 'Whether to sync status changes bidirectionally';

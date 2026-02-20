-- Create github_integrations table
CREATE TABLE github_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  github_id VARCHAR(255) NOT NULL,
  github_username VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create github_links table
CREATE TABLE github_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  github_url TEXT NOT NULL,
  github_owner VARCHAR(255) NOT NULL,
  github_repo VARCHAR(255) NOT NULL,
  github_number INTEGER NOT NULL,
  github_type VARCHAR(50) NOT NULL CHECK (github_type IN ('issue', 'pull_request')),
  is_auto_sync BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
-- Add indexes for performance
CREATE INDEX IDX_github_links_task_id ON github_links(task_id);
CREATE UNIQUE INDEX IDX_github_links_unique ON github_links(task_id, github_owner, github_repo, github_number);

-- Add comments
COMMENT ON TABLE github_integrations IS 'GitHub OAuth integration credentials for users';
COMMENT ON TABLE github_links IS 'Links between tasks and GitHub issues/PRs';

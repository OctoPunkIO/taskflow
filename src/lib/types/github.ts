export interface GitHubIntegration {
  id: string;
  userId: string;
  githubUserId: number;
  githubUsername: string;
  accessToken: string;
  refreshToken: string | null;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubLink {
  id: string;
  taskId: string;
  githubUrl: string;
  githubType: 'issue' | 'pull_request';
  githubOwner: string;
  githubRepo: string;
  githubNumber: number;
  title: string;
  state: string;
  syncEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

export interface GitHubPullRequest extends GitHubIssue {
  draft: boolean;
  merged: boolean;
  merged_at: string | null;
  merge_commit_sha: string | null;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
}

export interface CreateGitHubLinkInput {
  taskId: string;
  githubUrl: string;
  syncEnabled?: boolean;
}

export interface GitHubUrlParts {
  owner: string;
  repo: string;
  type: 'issue' | 'pull_request';
  number: number;
}

export type GitHubOAuthState = {
  taskId?: string;
  returnUrl?: string;
};
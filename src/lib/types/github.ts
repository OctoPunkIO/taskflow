// GitHub Integration Types
export interface GitHubIntegration {
  id: string;
  userId: string;
  githubId: string;
  githubUsername: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubLink {
  id: string;
  taskId: string;
  githubUrl: string;
  githubOwner: string;
  githubRepo: string;
  githubNumber: number;
  githubType: 'issue' | 'pull_request';
  isAutoSync: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubItem {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  labels?: Array<{
    name: string;
    color: string;
  }>;
}

export interface GitHubIssue extends GitHubItem {
  // Issue-specific fields
}

export interface GitHubPullRequest extends GitHubItem {
  // PR-specific fields
  merged: boolean;
  draft: boolean;
  base: {
    ref: string;
  };
  head: {
    ref: string;
  };
}

export interface GitHubUrlParseResult {
  owner: string;
  repo: string;
  number: number;
  type: 'issue' | 'pull_request';
}

export type GitHubStatus = 'open' | 'closed' | 'merged';


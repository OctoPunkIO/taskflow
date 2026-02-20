export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string | null;
  createdBy: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId: string;
  assigneeId?: string;
  dueDate?: Date;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
}

// GitHub Integration Types
export interface GitHubIntegration {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  githubUserId: number;
  githubUsername: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubLink {
  id: string;
  taskId: string;
  githubType: 'issue' | 'pull_request';
  githubRepo: string;
  githubNumber: number;
  githubUrl: string;
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
  html_url: string;
  created_at: string;
  updated_at: string;
  repository: {
    full_name: string;
  };
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  merged: boolean;
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  created_at: string;
  updated_at: string;
  repository: {
    full_name: string;
  };
}

export type GitHubItem = GitHubIssue | GitHubPullRequest;

export interface CreateGitHubLinkInput {
  taskId: string;
  githubUrl: string;
  syncEnabled?: boolean;
}
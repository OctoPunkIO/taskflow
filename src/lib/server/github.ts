import type { GitHubIssue, GitHubPullRequest, GitHubIntegration } from '$lib/types';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export class GitHubService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TaskFlow-GitHub-Integration',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUser() {
    return this.request<{ id: number; login: string; name: string; avatar_url: string }>('/user');
  }

  async getIssue(owner: string, repo: string, number: number): Promise<GitHubIssue> {
    const issue = await this.request<any>(`/repos/${owner}/${repo}/issues/${number}`);
    return {
      ...issue,
      repository: { full_name: `${owner}/${repo}` }
    };
  }

  async getPullRequest(owner: string, repo: string, number: number): Promise<GitHubPullRequest> {
    const pr = await this.request<any>(`/repos/${owner}/${repo}/pulls/${number}`);
    return {
      ...pr,
      repository: { full_name: `${owner}/${repo}` }
    };
  }

  async updateIssueState(owner: string, repo: string, number: number, state: 'open' | 'closed'): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/issues/${number}`, {
      method: 'PATCH',
      body: JSON.stringify({ state }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async closePullRequest(owner: string, repo: string, number: number): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/pulls/${number}`, {
      method: 'PATCH',
      body: JSON.stringify({ state: 'closed' }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    scope: string;
  }> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  static parseGitHubUrl(url: string): {
    owner: string;
    repo: string;
    type: 'issue' | 'pull_request';
    number: number;
  } | null {
    // Match GitHub URLs like:
    // https://github.com/owner/repo/issues/123
    // https://github.com/owner/repo/pull/456
    const match = url.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)(?:[/?#].*)?$/
    );

    if (!match) {
      return null;
    }

    const [, owner, repo, type, numberStr] = match;
    const number = parseInt(numberStr, 10);

    if (isNaN(number)) {
      return null;
    }

    return {
      owner,
      repo,
      type: type === 'pull' ? 'pull_request' : 'issue',
      number,
    };
  }

  // Status mapping between TaskFlow and GitHub
  static mapTaskStatusToGitHub(status: string): 'open' | 'closed' {
    switch (status) {
      case 'done':
        return 'closed';
      default:
        return 'open';
    }
  }

  static mapGitHubStatusToTask(state: string, type: 'issue' | 'pull_request'): string {
    if (state === 'closed') {
      return 'done';
    }
    return 'todo'; // Default for open issues/PRs
  }
}

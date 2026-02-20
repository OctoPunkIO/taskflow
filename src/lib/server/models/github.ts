import { query, transaction } from '../db';
import type { GitHubIntegration, GitHubLink, CreateGitHubLinkInput } from '$lib/types';
import { GitHubService } from '../github';

// GitHub Integration Management
export async function createGitHubIntegration(
  userId: string,
  accessToken: string,
  refreshToken: string | null,
  githubUserId: number,
  githubUsername: string
): Promise<GitHubIntegration> {
  const [integration] = await query<GitHubIntegration>(
    `INSERT INTO github_integrations (user_id, access_token, refresh_token, github_user_id, github_username)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET
       access_token = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       github_user_id = EXCLUDED.github_user_id,
       github_username = EXCLUDED.github_username,
       updated_at = NOW()
     RETURNING *`,
    [userId, accessToken, refreshToken, githubUserId, githubUsername]
  );
  return integration;
}

export async function getGitHubIntegration(userId: string): Promise<GitHubIntegration | null> {
  const [integration] = await query<GitHubIntegration>(
    'SELECT * FROM github_integrations WHERE user_id = $1',
    [userId]
  );
  return integration ?? null;
}

export async function deleteGitHubIntegration(userId: string): Promise<void> {
  await query('DELETE FROM github_integrations WHERE user_id = $1', [userId]);
}

// GitHub Link Management
export async function createGitHubLink(input: CreateGitHubLinkInput): Promise<GitHubLink> {
  const parsed = GitHubService.parseGitHubUrl(input.githubUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub URL');
  }

  const [link] = await query<GitHubLink>(
    `INSERT INTO github_links (task_id, github_type, github_repo, github_number, github_url, sync_enabled)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.taskId,
      parsed.type,
      `${parsed.owner}/${parsed.repo}`,
      parsed.number,
      input.githubUrl,
      input.syncEnabled ?? false
    ]
  );
  return link;
}

export async function getGitHubLinks(taskId: string): Promise<GitHubLink[]> {
  return query<GitHubLink>(
    'SELECT * FROM github_links WHERE task_id = $1 ORDER BY created_at DESC',
    [taskId]
  );
}

export async function getGitHubLink(linkId: string): Promise<GitHubLink | null> {
  const [link] = await query<GitHubLink>(
    'SELECT * FROM github_links WHERE id = $1',
    [linkId]
  );
  return link ?? null;
}

export async function updateGitHubLinkSync(
  linkId: string,
  syncEnabled: boolean
): Promise<GitHubLink> {
  const [link] = await query<GitHubLink>(
    `UPDATE github_links SET sync_enabled = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [syncEnabled, linkId]
  );
  return link;
}

export async function deleteGitHubLink(linkId: string): Promise<void> {
  await query('DELETE FROM github_links WHERE id = $1', [linkId]);
}

// Find links that need syncing when task status changes
export async function getLinksForSync(taskId: string): Promise<GitHubLink[]> {
  return query<GitHubLink>(
    'SELECT * FROM github_links WHERE task_id = $1 AND sync_enabled = true',
    [taskId]
  );
}

// Get all links for a GitHub item (to sync back to TaskFlow)
export async function getLinksByGitHubItem(
  githubRepo: string,
  githubNumber: number,
  githubType: 'issue' | 'pull_request'
): Promise<GitHubLink[]> {
  return query<GitHubLink>(
    'SELECT * FROM github_links WHERE github_repo = $1 AND github_number = $2 AND github_type = $3 AND sync_enabled = true',
    [githubRepo, githubNumber, githubType]
  );
}

// Enhanced task search with GitHub links
export async function getTasksWithGitHubLinks(projectId: string): Promise<Array<{
  id: string;
  title: string;
  status: string;
  github_links: GitHubLink[];
}>> {
  return query<{
    id: string;
    title: string;
    status: string;
    github_links: GitHubLink[];
  }>(
    `SELECT 
       t.id,
       t.title,
       t.status,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id', gl.id,
             'github_type', gl.github_type,
             'github_repo', gl.github_repo,
             'github_number', gl.github_number,
             'github_url', gl.github_url,
             'sync_enabled', gl.sync_enabled
           )
         ) FILTER (WHERE gl.id IS NOT NULL),
         '[]'::json
       ) as github_links
     FROM tasks t
     LEFT JOIN github_links gl ON t.id = gl.task_id
     WHERE t.project_id = $1
     GROUP BY t.id, t.title, t.status
     ORDER BY t.created_at DESC`,
    [projectId]
  );
}

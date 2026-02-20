import { query } from '../db';

export async function getGitHubIntegration(userId: string) {
  const [integration] = await query(
    'SELECT * FROM github_integrations WHERE user_id = $1',
    [userId]
  );
  return integration ?? null;
}

export async function getGitHubLinks(taskId: string) {
  return query(
    'SELECT * FROM github_links WHERE task_id = $1 ORDER BY created_at DESC',
    [taskId]
  );
}

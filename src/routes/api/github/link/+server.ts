import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseGitHubUrl, fetchGitHubItem } from '$lib/server/github';
import { getGitHubIntegration, getGitHubLinks } from '$lib/server/models/github';
import { z } from 'zod';

const linkSchema = z.object({
  taskId: z.string().uuid(),
  githubUrl: z.string().url()
});

// Get GitHub links for a task
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const taskId = url.searchParams.get('taskId');
  if (!taskId) {
    throw error(400, 'taskId is required');
  }

  const links = await getGitHubLinks(taskId);
  return json(links);
};

// Create a new GitHub link
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const body = await request.json();
  const result = linkSchema.safeParse(body);

  if (!result.success) {
    throw error(400, result.error.message);
  }

  const { taskId, githubUrl } = result.data;

  // Parse GitHub URL
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    throw error(400, 'Invalid GitHub URL');
  }

  // Get user's GitHub integration
  const integration = await getGitHubIntegration(locals.user.id);
  if (!integration) {
    throw error(400, 'GitHub not connected');
  }

  // Fetch GitHub item details to verify access
  const item = await fetchGitHubItem(parsed.owner, parsed.repo, parsed.number, integration.access_token);
  if (!item) {
    throw error(404, 'GitHub item not found or not accessible');
  }

  // Create link in database
  // This would require the createGitHubLink function to be implemented
  // const link = await createGitHubLink(...);

  return json({ success: true, item }, { status: 201 });
};

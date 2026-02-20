import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { GitHubService } from '$lib/server/github';
import {
  createGitHubLink,
  getGitHubLinks,
  deleteGitHubLink,
  getGitHubIntegration
} from '$lib/server/models/github';

const createLinkSchema = z.object({
  taskId: z.string().uuid(),
  githubUrl: z.string().url(),
  syncEnabled: z.boolean().optional().default(false)
});

const deleteLinkSchema = z.object({
  linkId: z.string().uuid()
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
  
  // Fetch live GitHub data for each link
  const integration = await getGitHubIntegration(locals.user.id);
  const enrichedLinks = [];

  if (integration) {
    const githubService = new GitHubService(integration.accessToken);
    
    for (const link of links) {
      try {
        const [owner, repo] = link.githubRepo.split('/');
        let githubData;
        
        if (link.githubType === 'issue') {
          githubData = await githubService.getIssue(owner, repo, link.githubNumber);
        } else {
          githubData = await githubService.getPullRequest(owner, repo, link.githubNumber);
        }
        
        enrichedLinks.push({
          ...link,
          githubData
        });
      } catch (err) {
        // If we can't fetch GitHub data, just return the link without it
        enrichedLinks.push(link);
      }
    }
  } else {
    enrichedLinks.push(...links);
  }

  return json(enrichedLinks);
};

// Create a new GitHub link
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const body = await request.json();
  const result = createLinkSchema.safeParse(body);

  if (!result.success) {
    throw error(400, result.error.message);
  }

  // Validate GitHub URL format
  const parsed = GitHubService.parseGitHubUrl(result.data.githubUrl);
  if (!parsed) {
    throw error(400, 'Invalid GitHub URL. Must be a GitHub issue or pull request URL.');
  }

  // Check if user has GitHub integration
  const integration = await getGitHubIntegration(locals.user.id);
  if (!integration) {
    throw error(400, 'GitHub integration required. Please connect your GitHub account first.');
  }

  try {
    // Verify the GitHub item exists and is accessible
    const githubService = new GitHubService(integration.accessToken);
    if (parsed.type === 'issue') {
      await githubService.getIssue(parsed.owner, parsed.repo, parsed.number);
    } else {
      await githubService.getPullRequest(parsed.owner, parsed.repo, parsed.number);
    }

    const link = await createGitHubLink(result.data);
    return json(link, { status: 201 });
  } catch (err) {
    console.error('GitHub link creation error:', err);
    if (err instanceof Error && err.message.includes('404')) {
      throw error(404, 'GitHub issue or pull request not found or not accessible');
    }
    throw error(500, 'Failed to create GitHub link');
  }
};

// Delete a GitHub link
export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const body = await request.json();
  const result = deleteLinkSchema.safeParse(body);

  if (!result.success) {
    throw error(400, result.error.message);
  }

  await deleteGitHubLink(result.data.linkId);
  return json({ success: true });
};

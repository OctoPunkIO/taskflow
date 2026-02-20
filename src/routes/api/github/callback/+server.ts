import { json, error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubService } from '$lib/server/github';
import { createGitHubIntegration } from '$lib/server/models/github';

// Handle GitHub OAuth callback
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error_param = url.searchParams.get('error');

  if (error_param) {
    throw error(400, `GitHub OAuth error: ${error_param}`);
  }

  if (!code) {
    throw error(400, 'Missing authorization code');
  }

  try {
    // Exchange code for access token
    const tokenData = await GitHubService.exchangeCodeForToken(code);
    
    // Get GitHub user info
    const githubService = new GitHubService(tokenData.access_token);
    const githubUser = await githubService.getUser();

    // Store the integration
    await createGitHubIntegration(
      locals.user.id,
      tokenData.access_token,
      tokenData.refresh_token || null,
      githubUser.id,
      githubUser.login
    );

    // Redirect back to settings or wherever appropriate
    throw redirect(302, '/settings?github=connected');
  } catch (err) {
    console.error('GitHub OAuth callback error:', err);
    throw error(500, 'Failed to complete GitHub integration');
  }
};

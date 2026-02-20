import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Handle GitHub OAuth callback
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    throw error(400, 'Missing authorization code');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw error(400, 'Failed to obtain access token');
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });

    const githubUser = await userResponse.json();

    // Save integration to database
    // This would require the database schema to be set up first
    // const integration = await createGitHubIntegration(...);

    // Redirect back to application
    throw redirect(302, '/settings?github=connected');
  } catch (e) {
    console.error('GitHub OAuth error:', e);
    throw error(500, 'GitHub authentication failed');
  }
};

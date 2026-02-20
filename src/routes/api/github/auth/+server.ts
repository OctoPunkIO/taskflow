import { json, error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GITHUB_CLIENT_ID } from '$env/static/private';

// Initiate GitHub OAuth flow
export const POST: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  // Generate a random state parameter for security
  const state = crypto.randomUUID();
  
  // Store state in session/cookie for validation in callback
  // In a real app, you'd want to store this securely
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/api/github/callback`);
  githubAuthUrl.searchParams.set('scope', 'repo');
  githubAuthUrl.searchParams.set('state', state);

  return json({
    authUrl: githubAuthUrl.toString(),
    state
  });
};

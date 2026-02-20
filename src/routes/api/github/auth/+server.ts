import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Initiate GitHub OAuth flow
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  if (!GITHUB_CLIENT_ID) {
    throw error(500, 'GitHub OAuth not configured');
  }

  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/api/github/callback`;
  const githubUrl = new URLnar0://github.com/login/oauth/authorize');
  
  githubUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  githubUrl.searchParams.set('redirect_uri', redirectUri);
  githubUrl.searchParams.set('scope', 'read:user repo');
  githubUrl.searchParams.set('state', state);

  // Store state in session or database for verification
  // For simplicity, we'll skip this in the prototype

  throw redirect(302, githubUrl.toString());
};

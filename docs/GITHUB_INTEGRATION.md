# GitHub Integration

This guide covers the GitHub integration feature that allows you to link TaskFlow tasks with GitHub issues and pull requests.

## Overview

The GitHub integration enables:
- **OAuth Connection**: Secure connection to your GitHub account
- **URL Parsing & Linking**: Paste GitHub URLs to automatically link issues/PRs  
- **Auto-Embed Cards**: Rich cards display issue/PR details in TaskFlow
- **Bidirectional Sync**: Optional status synchronization between platforms
- **Task Sidebar**: View linked GitHub items in task details

## Setup

### 1. GitHub OAuth App

Create a GitHub OAuth application:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: TaskFlow (or your app name)
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/api/github/callback`
4. Save and note the `Client ID` and `Client Secret`

### 2. Environment Variables

Add to your `.env` file:

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Database Migration

Run the GitHub integration migration:

```sql
-- Execute migrations/001_github_integration.sql
psql -d your_database -f migrations/001_github_integration.sql
```

This creates:
- `github_integrations` table for OAuth tokens
- `github_links` table for task-GitHub item relationships
- Necessary indexes and triggers

## Usage

### Connecting GitHub

1. Go to Settings in TaskFlow
2. Find the "Integrations" section
3. Click "Connect GitHub"
4. Complete the OAuth flow
5. You'll be redirected back with a connection confirmation

### Linking Issues/PRs

1. Open a task in TaskFlow
2. In the task sidebar, find "GitHub Links"
3. Click "Add GitHub Link"
4. Paste a GitHub URL (issue or PR)
5. Optionally enable bidirectional sync
6. Click "Link to GitHub"

**Supported URL formats:**
```
https://github.com/owner/repo/issues/123
https://github.com/owner/repo/pull/456
```

### Viewing Linked Items

Linked GitHub items appear as rich cards showing:
- Issue/PR title and number
- Repository name
- Current status (open/closed/merged)
- Author and timestamps
- Description preview
- Direct link to GitHub

### Status Synchronization

When bidirectional sync is enabled:

**TaskFlow → GitHub:**
- `Todo/In Progress/In Review` → `Open`
- `Done` → `Closed`

**GitHub → TaskFlow:**
- `Open` → `Todo` (default)
- `Closed` → `Done`
- `Merged` (PRs) → `Done`

## API Reference

### Authentication

```http
POST /api/github/auth
```
Initiates GitHub OAuth flow, returns authorization URL.

```http
GET /api/github/callback?code=...&state=...
```
Handles OAuth callback, stores access token.

### Link Management

```http
GET /api/github/link?taskId={uuid}
```
Get all GitHub links for a task with live GitHub data.

```http
POST /api/github/link
Content-Type: application/json

{
  "taskId": "uuid",
  "githubUrl": "https://github.com/owner/repo/issues/123",
  "syncEnabled": false
}
```
Create a new GitHub link.

```http
DELETE /api/github/link
Content-Type: application/json

{
  "linkId": "uuid"
}
```
Delete a GitHub link.

## Components

### GitHubCard.svelte

Displays a GitHub issue or PR as a rich card:

```svelte
<GitHubCard 
  {githubData}
  {type}
  showActions={true}
  onRemove={() => removeLink(linkId)}
/>
```

**Props:**
- `githubData`: GitHub issue/PR data
- `type`: `'issue' | 'pull_request'`
- `showActions`: Show view/remove buttons
- `onRemove`: Callback for remove action

### GitHubLinkForm.svelte

Form for creating new GitHub links:

```svelte
<GitHubLinkForm 
  {taskId}
  on:success={handleSuccess}
  on:error={handleError}
/>
```

**Props:**
- `taskId`: Task UUID to link to
- `loading`: Disable form during operations

**Events:**
- `success`: Link created successfully
- `error`: Link creation failed

## Database Schema

### github_integrations

```sql
CREATE TABLE github_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    github_user_id BIGINT NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### github_links

```sql
CREATE TABLE github_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    github_type VARCHAR(20) NOT NULL CHECK (github_type IN ('issue', 'pull_request')),
    github_repo VARCHAR(255) NOT NULL, -- Format: "owner/repo"
    github_number INTEGER NOT NULL,
    github_url TEXT NOT NULL,
    sync_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, github_repo, github_number, github_type)
);
```

## Security Considerations

### OAuth Token Storage
- Access tokens are stored encrypted in the database
- Tokens are scoped to minimum required permissions (`repo`)
- Users can revoke access at any time through GitHub settings

### API Rate Limiting
- Respects GitHub API rate limits (5000/hour for authenticated users)
- Implements exponential backoff for rate limit errors
- Caches GitHub data to reduce API calls

### Repository Access
- Only repositories the user has access to can be linked
- Private repositories require appropriate OAuth scopes
- Access is validated before creating links

## Troubleshooting

### Common Issues

**"GitHub integration required" error:**
- User hasn't connected their GitHub account
- OAuth token has expired or been revoked
- Solution: Reconnect GitHub account in settings

**"GitHub issue or pull request not found" error:**
- URL is incorrect or malformed
- Repository is private and user lacks access
- Issue/PR doesn't exist
- Solution: Verify URL and repository permissions

**Sync not working:**
- Bidirectional sync is disabled for the link
- GitHub API rate limit exceeded
- Network connectivity issues
- Solution: Check sync settings and try again later

### Debug Mode

Enable debug logging by setting:

```bash
LOG_LEVEL=debug
```

This logs all GitHub API requests and responses for troubleshooting.

### Rate Limit Monitoring

Monitor GitHub API usage:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.github.com/rate_limit
```

## Future Enhancements

### Planned Features
- **Webhooks**: Real-time sync via GitHub webhooks
- **GitHub Enterprise**: Support for GitHub Enterprise Server
- **PR Reviews**: Integration with PR review process
- **Commit Linking**: Link individual commits to tasks
- **Advanced Filtering**: Filter and search linked items
- **Bulk Operations**: Link multiple items at once

### Contributing

To contribute to the GitHub integration:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

# GitHub Integration

This feature allows TaskFlow users to link tasks with GitHub issues and pull requests for better tracking and visibility.

## Features

- **GitHub OAuth Connection**: Securely connect your GitHub account
- **URL Linking**: Paste GitHub URLs to automatically link issues/PRs
- **Auto-Embed Cards**: Rich cards show issue/PR details directly in TaskFlow
- **Status Sync**: Optional bidirectional status synchronization
- **Sidebar Display**: View linked GitHub items in the task sidebar

## Setup

### 1. GitHub OAuth App Configuration

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: "TaskFlow"
   - Homepage URL: your TaskFlow domain
   - Authorization callback URL: `{your-domain}/api/github/callback`
4. Note down your Client ID and generate a Client Secret

### 2. Environment Variables

Add the following to your `.env` file:

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 3. Database Migration

Run the GitHub integration migration:

```bash
psql $_DATABASE_URL -f migrations/001_github_integration.sql
```

## Usage

### 1. Connect GitHub Account

1. Navigate to Settings
2. Click "Connect GitHub"
3. Authorize TaskFlow to access your GitHub account

#u®# 2. Link GitHub Issues/PRs

1. Open a task
2. Click "Link GitHub Issue/PR"
3. Paste the full GitHub URL (e.g., `https://github.com/owner/repo/issues/123`)
4. Click "Add Link"

### 3. View Linked Items

Linked GitHub items appear as rich cards in your tasks, showing:
- Issue/PR title and number
- Current state (open 
losed)
- Author and creation date
- Description snippet
- Labels
- Direct link to view on GitHub

### 4. Status Synchronization (Optional)

Enable auto-sync to automatically update:
- Task status when GitHub item changes state
- GitHub item state when task status changes

## Supported URL Formats

The integration supports the following GitHub URL formats:

- Issues: `https://github.com/{owner}/{repo}/issues/{number}`
- Pull Requests: `https://github.com/{owner}/{repo}/pull/{number}`

## Status Mapping

| TaskFlow Status | GitHub State |
|-----------------|--------------|
| Todo           | Open          |
| In Progress    | Open          |
| In Review      | Open          |
| Done           | Closed        |

## Webhooks (Future)

For real-time synchronization, configure a GitHub webhook:
1. Go to your repo's Settings > Webhooks
2. Add a new webhook pointing to `{your-domain}/api/webhooks/github`
3. Select events: Issues, Pull Requests

## Troubleshooting

### Common Issues

1. **GitHub item not found**: Ensure the URL is correct and you have access to the repository
2. **Authentication failed**: Check your GitHub OAuth configuration
3. **Database error**: Ensure migrations have been run

### Debugging

Enable debug logging:

```
DEBUG=github:* npm run dev
```

## Security Considerations

- GitHub access tokens are stored encrypted in the database
- Only accessible repositories and items can be linked
- Revoke access at any time in GitHub settings

## Limitations

- Only supports GitHub.com (not GitHub Enterprise)
- Requires access to the repository (public or private with access)
- Rate limited by GitHub's API limits

# Tasks API

## Endpoints

### List Tasks

```http
GET /api/tasks?projectId={projectId}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | uuid | Yes | Project to list tasks from |
| status | string | No | Filter by status |
| assigneeId | uuid | No | Filter by assignee |

**Response:**

```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Implement user auth",
      "status": "in_progress",
      "priority": "high",
      "assigneeId": "user-123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Task

```http
POST /api/tasks
```

**Request Body:**

```json
{
  "title": "New task",
  "projectId": "project-123",
  "priority": "medium"
}
```

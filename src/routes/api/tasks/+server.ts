import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createTask, listTasks } from '$lib/server/models/task';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const projectId = url.searchParams.get('projectId');
  if (!projectId) {
    throw error(400, 'projectId is required');
  }

  const tasks = await listTasks(projectId, {
    status: url.searchParams.get('status') ?? undefined,
    assigneeId: url.searchParams.get('assigneeId') ?? undefined,
    priority: url.searchParams.get('priority') ?? undefined,
  });

  return json(tasks);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const body = await request.json();
  const result = createTaskSchema.safeParse(body);

  if (!result.success) {
    throw error(400, result.error.message);
  }

  const task = await createTask(result.data, locals.user.id);
  return json(task, { status: 201 });
};
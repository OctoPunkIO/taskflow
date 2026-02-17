import { query, transaction } from '../db';
import type { Task, CreateTaskInput, UpdateTaskInput } from '$lib/types';

export async function createTask(input: CreateTaskInput, userId: string): Promise<Task> {
  const [task] = await query<Task>(
    `INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [input.title, input.description, input.status ?? 'todo', input.priority ?? 'medium',
     input.assigneeId, input.projectId, userId]
  );
  return task;
}

export async function getTask(id: string): Promise<Task | null> {
  const [task] = await query<Task>('SELECT * FROM tasks WHERE id = $1', [id]);
  return task ?? null;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(input.title);
  }
  if (input.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(input.description);
  }
  if (input.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }
  if (input.priority !== undefined) {
    fields.push(`priority = $${paramIndex++}`);
    values.push(input.priority);
  }
  if (input.assigneeId !== undefined) {
    fields.push(`assignee_id = $${paramIndex++}`);
    values.push(input.assigneeId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const [task] = await query<Task>(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  await query('DELETE FROM tasks WHERE id = $1', [id]);
}

export async function listTasks(projectId: string, filters?: {
  status?: string;
  assigneeId?: string;
  priority?: string;
}): Promise<Task[]> {
  let sql = 'SELECT * FROM tasks WHERE project_id = $1';
  const params: unknown[] = [projectId];
  let paramIndex = 2;

  if (filters?.status) {
    sql += ` AND status = $${paramIndex++}`;
    params.push(filters.status);
  }
  if (filters?.assigneeId) {
    sql += ` AND assignee_id = $${paramIndex++}`;
    params.push(filters.assigneeId);
  }
  if (filters?.priority) {
    sql += ` AND priority = $${paramIndex++}`;
    params.push(filters.priority);
  }

  sql += ' ORDER BY created_at DESC';
  return query<Task>(sql, params);
}
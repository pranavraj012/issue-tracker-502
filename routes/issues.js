import { Router } from 'express';
import {
  listIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  VALID_STATUSES,
  VALID_PRIORITIES,
} from '../store.js';

export const issuesRouter = Router();

const EDITABLE_FIELDS = ['title', 'description', 'status', 'priority'];

// READ (all) — GET /api/issues  [?status=open&priority=high]
issuesRouter.get('/', (req, res) => {
  const { status, priority } = req.query;
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }
  res.json(listIssues({ status, priority }));
});

// READ (one) — GET /api/issues/:id
issuesRouter.get('/:id', (req, res) => {
  const issue = getIssue(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue);
});

// CREATE — POST /api/issues
issuesRouter.post('/', (req, res) => {
  const { title, description = '', status = 'open', priority = 'medium' } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required (non-empty string)' });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }

  const issue = createIssue({ title: title.trim(), description: String(description), status, priority });
  res.status(201).json(issue);
});

// UPDATE (partial) — PATCH /api/issues/:id
issuesRouter.patch('/:id', (req, res) => {
  const existing = getIssue(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Issue not found' });

  const body = req.body ?? {};
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return res.status(400).json({ error: `Provide at least one of: ${EDITABLE_FIELDS.join(', ')}` });
  }

  const changes = {};
  for (const key of keys) {
    if (!EDITABLE_FIELDS.includes(key)) {
      return res.status(400).json({ error: `Unknown field "${key}". Editable fields: ${EDITABLE_FIELDS.join(', ')}` });
    }
    changes[key] = body[key];
  }

  if (changes.title !== undefined && (typeof changes.title !== 'string' || !changes.title.trim())) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }
  if (changes.status !== undefined && !VALID_STATUSES.includes(changes.status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  if (changes.priority !== undefined && !VALID_PRIORITIES.includes(changes.priority)) {
    return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }
  if (changes.description !== undefined) changes.description = String(changes.description);

  res.json(updateIssue(req.params.id, changes));
});

// DELETE — DELETE /api/issues/:id
issuesRouter.delete('/:id', (req, res) => {
  if (!deleteIssue(req.params.id)) {
    return res.status(404).json({ error: 'Issue not found' });
  }
  res.status(204).end(); // success, no body
});

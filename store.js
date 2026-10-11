// In-memory issue store (resets when the process restarts)
const issues = new Map();
let nextId = 1;

export const VALID_STATUSES = ['open', 'in-progress', 'closed'];
export const VALID_PRIORITIES = ['low', 'medium', 'high'];

export function listIssues({ status, priority } = {}) {
  return [...issues.values()].filter((issue) => {
    if (status && issue.status !== status) return false;
    if (priority && issue.priority !== priority) return false;
    return true;
  });
}

export function getIssue(id) {
  return issues.get(Number(id));
}

export function createIssue({ title, description = '', status = 'open', priority = 'medium' }) {
  const now = new Date().toISOString();
  const issue = { id: nextId++, title, description, status, priority, createdAt: now, updatedAt: now };
  issues.set(issue.id, issue);
  return issue;
}

export function updateIssue(id, changes) {
  const issue = issues.get(Number(id));
  if (!issue) return null;
  Object.assign(issue, changes, { updatedAt: new Date().toISOString() });
  return issue;
}

export function deleteIssue(id) {
  return issues.delete(Number(id));
}

// Seed data so GET /api/issues is never empty in demos
createIssue({
  title: 'Fix login redirect loop',
  description: 'Users are bounced back to /login right after successful sign-in',
  priority: 'high',
});
createIssue({
  title: 'Add pagination to issue list',
  status: 'in-progress',
  priority: 'low',
});
createIssue({
  title: 'Update README with setup steps',
  status: 'closed',
  priority: 'medium',
});

import { Request } from 'express';

// Express query params and route params are typed as string | string[] | ParsedQs
// but in practice with our router they're always strings. This helper extracts a string safely.
export function qp(val: unknown): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val[0] || '';
  return '';
}

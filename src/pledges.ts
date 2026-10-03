export interface PledgeResult { count: number; pledged: boolean }
const api = (import.meta.env.VITE_PLEDGE_API_URL || '').replace(/\/$/, '');
export const pledgesAvailable = Boolean(api);
const key = 'bbtd-visitor-id';
function visitorId(): string {
  // Only an anonymous browser identifier is local. Pledge records live in D1.
  let id = localStorage.getItem(key);
  if (!id || !/^[a-f0-9-]{36}$/.test(id)) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
export async function requestPledge(method: 'GET' | 'POST' = 'GET'): Promise<PledgeResult> {
  if (!api) throw new Error('Global pledges are not available yet.');
  const response = await fetch(`${api}/api/pledge`, {
    method, headers: { 'X-Dab-Visitor': visitorId() }, signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error('The counter is unavailable. Please try again.');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('count' in data) || !('pledged' in data)
    || typeof data.count !== 'number' || !Number.isSafeInteger(data.count) || data.count < 0
    || typeof data.pledged !== 'boolean') throw new Error('Unexpected counter response.');
  return data as PledgeResult;
}

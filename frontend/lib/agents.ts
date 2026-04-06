import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface Agent {
  _id: string;
  name: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  tools: string[];
  agentType: string;
  mainJob: string;
  audience: string;
  tone: string;
  restrictions: string;
  successMetrics: string;
  memory: 'none' | 'short-term' | 'long-term';
  status: 'active' | 'idle';
  requestCount: number;
  createdAt: string;
}

export interface CreateAgentPayload {
  name: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  tools: string[];
  agentType: string;
  mainJob: string;
  audience: string;
  tone: string;
  restrictions: string;
  successMetrics: string;
  memory: string;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_URL}/agents`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json() as Promise<Agent[]>;
}

export async function createAgent(payload: CreateAgentPayload): Promise<Agent> {
  const res = await fetch(`${API_URL}/agents`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create agent');
  return res.json() as Promise<Agent>;
}

export async function deleteAgent(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/agents/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete agent');
}

import { OntologyData, IndustryCategory } from '@/src/store/ontologyStore';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

export interface ConversationResponse {
  sessionId: string;
  message: string;
  ontology: any | null;
  turnCount: number;
}

export const api = {
  // ── Ontology ───────────────────────────────────────────────────────────────
  getOntology: () =>
    request<OntologyData>('/ontology'),

  importOntology: (objectTypes: any[], linkTypes: any[]) =>
    request<{ success: boolean; data: OntologyData }>('/ontology/import', {
      method: 'POST',
      body: JSON.stringify({ objectTypes, linkTypes }),
    }),

  // ── Object Types ───────────────────────────────────────────────────────────
  createObjectType: (data: {
    id: string; name: string; description?: string; icon?: string; backingDataset?: string;
  }) =>
    request<{ success: boolean; data: OntologyData }>('/object-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateObjectType: (id: string, data: Partial<{
    name: string; description: string; icon: string; backingDataset: string;
  }>) =>
    request<{ success: boolean; data: OntologyData }>(`/object-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteObjectType: (id: string) =>
    request<{ success: boolean; data: OntologyData }>(`/object-types/${id}`, {
      method: 'DELETE',
    }),

  // ── Properties ─────────────────────────────────────────────────────────────
  addProperty: (
    objectTypeId: string,
    property: {
      id: string; name: string; type?: string; description?: string;
      isPrimaryKey?: boolean; baseColumn?: string; typeClasses?: string[];
    }
  ) =>
    request<{ success: boolean; data: OntologyData }>(
      `/object-types/${objectTypeId}/properties`,
      { method: 'POST', body: JSON.stringify(property) }
    ),

  deleteProperty: (objectTypeId: string, propId: string) =>
    request<{ success: boolean; data: OntologyData }>(
      `/object-types/${objectTypeId}/properties/${propId}`,
      { method: 'DELETE' }
    ),

  updateProperty: (
    objectTypeId: string,
    propId: string,
    property: {
      id: string; name: string; type?: string; description?: string;
      isPrimaryKey?: boolean; baseColumn?: string; typeClasses?: string[];
    }
  ) =>
    request<{ success: boolean; data: OntologyData }>(
      `/object-types/${objectTypeId}/properties/${propId}`,
      { method: 'PUT', body: JSON.stringify(property) }
    ),

  // ── Link Types ─────────────────────────────────────────────────────────────
  createLinkType: (data: {
    id: string; name: string; sourceObjectId: string; targetObjectId: string;
    cardinality?: string; description?: string; sourceColumn?: string; targetColumn?: string;
  }) =>
    request<{ success: boolean; data: OntologyData }>('/link-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLinkType: (id: string, data: Partial<{
    name: string; sourceObjectId: string; targetObjectId: string;
    cardinality: string; description: string; sourceColumn: string; targetColumn: string;
  }>) =>
    request<{ success: boolean; data: OntologyData }>(`/link-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLinkType: (id: string) =>
    request<{ success: boolean; data: OntologyData }>(`/link-types/${id}`, {
      method: 'DELETE',
    }),

  // ── Action Types ───────────────────────────────────────────────────────────
  createActionType: (data: {
    id: string; name: string; description?: string; targetObjectId: string;
    parameters?: any[]; rules?: any[];
  }) =>
    request<{ success: boolean; data: OntologyData }>('/action-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateActionType: (id: string, data: Partial<{
    name: string; description: string; targetObjectId: string;
  }>) =>
    request<{ success: boolean; data: OntologyData }>(`/action-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteActionType: (id: string) =>
    request<{ success: boolean; data: OntologyData }>(`/action-types/${id}`, {
      method: 'DELETE',
    }),

  executeAction: (actionTypeId: string, parameters: Record<string, any>, executedBy = 'user') =>
    request<{
      executionId: string;
      status: string;
      result?: any;
      sideEffects?: any[];
      validationErrors?: string[];
    }>(`/action-types/${actionTypeId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ parameters, executedBy }),
    }),

  getActionExecutions: (actionTypeId: string) =>
    request<{ executions: any[] }>(`/action-types/${actionTypeId}/executions`),

  getAllExecutions: () =>
    request<{ executions: any[] }>('/action-executions'),

  // ── AI: Multi-turn Conversation ────────────────────────────────────────────
  chat: (message: string, sessionId?: string, includeCurrentOntology = false) =>
    request<ConversationResponse>('/ai/conversation', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, includeCurrentOntology }),
    }),

  applyConversationOntology: (sessionId: string) =>
    request<{ success: boolean; data: OntologyData }>(`/ai/conversation/${sessionId}/apply`, {
      method: 'POST',
    }),

  // ── AI: Simple endpoints ───────────────────────────────────────────────────
  generateAction: (name: string, description: string, targetObjectId: string) =>
    request<{ parameters: any[]; rules: any[]; reasoning: string }>('/ai/generate-action', {
      method: 'POST',
      body: JSON.stringify({ name, description, targetObjectId }),
    }),

  ontologyQA: (question: string, contextHint?: string) =>
    request<{
      answer: string;
      reasoning_chain: any[];
      key_entities: string[];
      confidence: string;
      data_freshness: string;
      sources: { uri: string; title: string }[];
    }>('/agent/ontology-qa', {
      method: 'POST',
      body: JSON.stringify({ question, contextHint }),
    }),

  suggestProperties: (objectTypeName: string, description: string, existingProperties: any[]) =>
    request<{ suggestions: any[] }>('/ai/suggest-properties', {
      method: 'POST',
      body: JSON.stringify({ objectTypeName, description, existingProperties }),
    }),

  suggestLinks: (objectTypes: any[]) =>
    request<{ suggestions: any[] }>('/ai/suggest-links', {
      method: 'POST',
      body: JSON.stringify({ objectTypes }),
    }),

  generateOntology: (description: string) =>
    request<{ ontology: any }>('/ai/generate-ontology', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }),

  queryOntology: (question: string) =>
    request<{ answer: string }>('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  // ── Conversation History ────────────────────────────────────────────────────
  getConversations: () =>
    request<{ conversations: any[] }>('/ai/conversations'),

  getConversation: (id: string) =>
    request<any>('/ai/conversations/' + id),

  createConversation: (title?: string) =>
    request<any>('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  updateConversation: (id: string, data: { title?: string; messages?: any[]; preview_ontology?: any }) =>
    request<any>('/ai/conversations/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteConversation: (id: string) =>
    request<{ success: boolean }>('/ai/conversations/' + id, {
      method: 'DELETE',
    }),

  // ── Industry Categories ─────────────────────────────────────────────────────
  getIndustries: () =>
    request<{ industries: IndustryCategory[] }>('/industries'),

  getIndustryTree: () =>
    request<{ tree: IndustryCategory[] }>('/industries/tree'),

  getIndustryOntology: (id: string) =>
    request<{ industry: IndustryCategory; objectTypes: any[]; linkTypes: any[]; actionTypes: any[] }>(`/industries/${id}/ontology`),

  getIndustryStats: () =>
    request<{ stats: Record<string, { objectTypes: number; linkTypes: number }> }>('/industries/stats'),

  // ── Research Agents ─────────────────────────────────────────────────────────
  getResearchAgents: () =>
    request<{ agents: any[] }>('/research-agents'),

  createResearchAgent: (data: {
    name: string; description?: string; targetCompany: string;
    targetIndustry: string; analysisFocus?: string; scheduleMinutes?: number;
  }) =>
    request<{ success: boolean; agent: any }>('/research-agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateResearchAgent: (id: string, data: Partial<{
    is_active: boolean | number; schedule_minutes: number;
  }>) =>
    request<{ success: boolean; agent: any }>(`/research-agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteResearchAgent: (id: string) =>
    request<{ success: boolean }>(`/research-agents/${id}`, {
      method: 'DELETE',
    }),

  runResearchAgent: (id: string) =>
    request<{ success: boolean; events: any[]; analysis: any }>(`/research-agents/${id}/run`, {
      method: 'POST',
    }),

  getAgentEvents: (id: string) =>
    request<{ events: any[] }>(`/research-agents/${id}/events`),

  getAgentAnalyses: (id: string) =>
    request<{ analyses: any[] }>(`/research-agents/${id}/analyses`),

  // ── Datasets ────────────────────────────────────────────────────────────────
  getDatasetColumns: (datasetName: string) =>
    request<{ success: boolean; data: Array<{
      columnName: string;
      columnComment: string;
      dataType: string;
      isNullable: string;
    }>; datasetName: string }>(`/datasets/${datasetName}/columns`),

  getAllDatasets: () =>
    request<{ success: boolean; data: Array<{
      tableName: string;
      tableComment: string;
    }> }>('/datasets'),

  // ── Object Explorer ─────────────────────────────────────────────────────────
  getObjectInstances: (objectTypeId: string) =>
    request<{ success: boolean; data: any[]; objectType?: any }>(`/object-explorer/${objectTypeId}/instances`),

  getRelationGraph: (objectTypeId: string, instanceId: string, depth = 3) =>
    request<{ success: boolean; data: { nodes: any[]; links: any[] } }>(
      `/object-explorer/${objectTypeId}/instances/${encodeURIComponent(instanceId)}/graph?depth=${depth}`
    ),

  // ── Function Types ──────────────────────────────────────────────────────────
  getFunctionTypes: () =>
    request<{ success: boolean; functions: any[] }>('/function-types'),

  createFunctionType: (data: {
    name: string;
    restRoute: string;
    description?: string;
    inputParams?: any[];
    outputParams?: any[];
  }) =>
    request<{ success: boolean; data: any }>('/function-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFunctionType: (id: string, data: Partial<{
    name: string;
    restRoute: string;
    description: string;
    inputParams: any[];
    outputParams: any[];
  }>) =>
    request<{ success: boolean; data: any }>(`/function-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFunctionType: (id: string) =>
    request<{ success: boolean }>(`/function-types/${id}`, {
      method: 'DELETE',
    }),
};

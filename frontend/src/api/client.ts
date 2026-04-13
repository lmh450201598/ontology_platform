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
  getActionTypes: () =>
    request<{ success: boolean; actionTypes: any[] }>('/action-types'),

  createActionType: (data: {
    displayName: string;
    description?: string;
    rules?: any[];
    effects?: any[];
  }) =>
    request<{ success: boolean; actionType: any }>('/action-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateActionType: (id: string, data: Partial<{
    displayName: string;
    description: string;
    status: string;
    rules?: any[];
    effects?: any[];
  }>) =>
    request<{ success: boolean; actionType: any }>(`/action-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteActionType: (id: string) =>
    request<{ success: boolean }>(`/action-types/${id}`, {
      method: 'DELETE',
    }),

  executeAction: (actionTypeId: string, parameters: Record<string, any>, executedBy = 'user', instanceId?: string) =>
    request<{
      executionId: string;
      status: string;
      result?: any;
      sideEffects?: any[];
      validationErrors?: string[];
    }>(`/action-types/${actionTypeId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ parameters, executedBy, instanceId }),
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
  getFunctionTypes: (category?: string) =>
    request<{ success: boolean; functions: FunctionType[] }>(`/function-types${category ? `?category=${category}` : ''}`),

  getFunctionType: (id: string) =>
    request<{ success: boolean; function: FunctionType }>(`/function-types/${id}`),

  createFunctionType: (data: {
    code: string;
    name: string;
    description?: string;
    category: string;
    interfaceType?: string;
    requestMethod?: string;
    interfaceUrl?: string;
    implementationType?: string;
    inputParams?: FunctionParam[];
    outputParams?: FunctionParam[];
  }) =>
    request<{ success: boolean; function: FunctionType }>('/function-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFunctionType: (id: string, data: Partial<{
    code: string;
    name: string;
    description: string;
    category: string;
    interfaceType: string;
    requestMethod: string;
    interfaceUrl: string;
    implementationType: string;
    status: string;
    inputParams: FunctionParam[];
    outputParams: FunctionParam[];
  }>) =>
    request<{ success: boolean; function: FunctionType }>(`/function-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFunctionType: (id: string) =>
    request<{ success: boolean }>(`/function-types/${id}`, {
      method: 'DELETE',
    }),

  executeFunctionType: (id: string, parameters: Record<string, any>) =>
    request<{
      functionTypeId: string;
      functionName: string;
      functionCode: string;
      parameters: Record<string, any>;
      status: string;
      response?: any;
      error?: string;
    }>(`/function-types/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(parameters),
    }),

  // ── Instance Relations ────────────────────────────────────────────────────
  getInstanceRelations: (objectTypeId: string, instanceId: string, depth = 3) =>
    request<{ success: boolean; data: { centerNode: any; nodes: any[]; links: any[]; totalNodes: number; totalLinks: number } }>(
      `/instances/${objectTypeId}/${encodeURIComponent(instanceId)}/relations?depth=${depth}`
    ),

  // ── Review (审核) ─────────────────────────────────────────────────────────
  getPendingReviews: (page = 1, pageSize = 10) =>
    request<{
      objectTypes: any[];
      linkTypes: any[];
      totalObjectTypes: number;
      totalLinkTypes: number;
      total: number;
      page: number;
      pageSize: number;
    }>(`/review/pending?page=${page}&pageSize=${pageSize}`),

  getPendingReviewCount: () =>
    request<{ total: number; objectTypes: number; linkTypes: number }>('/review/count'),

  approveObjectType: (id: string) =>
    request<{ success: boolean; message: string; data: any }>(`/review/object-types/${id}/approve`, {
      method: 'POST',
    }),

  rejectObjectType: (id: string) =>
    request<{ success: boolean; message: string; data: any }>(`/review/object-types/${id}/reject`, {
      method: 'POST',
    }),

  approveLinkType: (id: string) =>
    request<{ success: boolean; message: string; data: any }>(`/review/link-types/${id}/approve`, {
      method: 'POST',
    }),

  rejectLinkType: (id: string) =>
    request<{ success: boolean; message: string; data: any }>(`/review/link-types/${id}/reject`, {
      method: 'POST',
    }),

  // ── Ontology Rules ─────────────────────────────────────────────────────────
  getOntologyRules: (category?: string) =>
    request<{ rules: any[] }>(category ? `/ontology-rules?category=${category}` : '/ontology-rules'),

  getOntologyRule: (id: string) =>
    request<{ rule: any }>(`/ontology-rules/${id}`),

  createOntologyRule: (data: any) =>
    request<{ success: boolean; rule: any }>('/ontology-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOntologyRule: (id: string, data: any) =>
    request<{ success: boolean; rule: any }>(`/ontology-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteOntologyRule: (id: string) =>
    request<{ success: boolean }>(`/ontology-rules/${id}`, {
      method: 'DELETE',
    }),

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications: (status?: string, limit?: number, offset?: number) =>
    request<{ success: boolean; notifications: Notification[]; total: number }>(
      `/notifications?${status ? `status=${status}&` : ''}limit=${limit || 20}&offset=${offset || 0}`
    ),

  getUnreadCount: () =>
    request<{ success: boolean; count: number }>('/notifications/unread-count'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'PUT',
    }),

  createNotification: (data: Partial<Notification>) =>
    request<{ success: boolean; notification: Notification }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Notification type definition
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'SYSTEM' | 'APPROVAL' | 'EXECUTION' | 'DATASET';
  status: 'UNREAD' | 'READ';
  userId?: string;
  relatedObjectType?: string;
  relatedObjectId?: string;
  actionUrl?: string;
  readAt?: string;
  createdAt: string;
}

// Function Type definitions
export interface FunctionParam {
  id?: string;
  functionId?: string;
  paramDirection?: 'INPUT' | 'OUTPUT';
  paramName: string;
  paramCode: string;
  paramType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  isRequired?: number;
  defaultValue?: string;
  description?: string;
  sortOrder?: number;
  sourceType?: 'USER_INPUT' | 'SYSTEM_AUTO' | 'CONTEXT';
}

export interface FunctionType {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: 'QUERY' | 'CREATE' | 'UPDATE' | 'DELETE' | 'ANALYZE';
  interfaceType?: 'RESTFUL' | 'DUBBO' | 'INTERNAL';
  requestMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  interfaceUrl?: string;
  implementationType?: 'JAVA' | 'BFF' | 'SQL';
  status?: 'ACTIVE' | 'DISABLED';
  createdAt?: string;
  updatedAt?: string;
  inputParams?: FunctionParam[];
  outputParams?: FunctionParam[];
}

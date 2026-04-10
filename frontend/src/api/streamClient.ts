// 流式API客户端

export interface StreamMessage {
  content?: string;
  done?: boolean;
  ontology?: any;
  error?: string;
  fullContent?: string;
}

// AI工作室流式对话
export async function* streamConversation(
  message: string,
  sessionId?: string,
  includeCurrentOntology?: boolean
): AsyncGenerator<StreamMessage, void, unknown> {
  const response = await fetch('/api/ai/conversation/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      sessionId,
      includeCurrentOntology,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// 研究智能体产业链问答流式对话
export async function* streamResearchChat(
  agentId: string,
  message: string
): AsyncGenerator<StreamMessage, void, unknown> {
  const response = await fetch(`/api/research-agents/${agentId}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

import { Router } from 'express';
import crypto from 'crypto';

const router = Router();
const MODEL = 'deepseek-chat';

// Java backend URL
const JAVA_BACKEND = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

// In-memory session store
const sessions = new Map<string, {
  id: string;
  history: { role: string; content: string }[];
  currentOntology: any;
  createdAt: number;
}>();

function checkAI(): boolean {
  return !!DEEPSEEK_API_KEY;
}

// DeepSeek API call helper
async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not configured');

  const startTime = Date.now();
  console.log(`[DeepSeek AI] Request started at ${new Date().toISOString()}`);
  console.log(`[DeepSeek AI] Messages count: ${messages.length}`);

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    const duration = Date.now() - startTime;
    console.log(`[DeepSeek AI] Response received in ${duration}ms, status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[DeepSeek AI] API error: ${error}`);
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';
    console.log(`[DeepSeek AI] Response content length: ${content.length} chars`);
    console.log(`[DeepSeek AI] Token usage:`, data.usage);
    
    return content;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[DeepSeek AI] Request failed after ${duration}ms:`, error);
    throw error;
  }
}

// Ontology system prompt
const ONTOLOGY_SYSTEM_PROMPT = `你是 Palantir Foundry Ontology 专家。你的任务是帮助用户设计和完善本体（Ontology）。

本体包含以下核心概念：
1. Object Type（对象类型）- 业务实体，如公司、产品、订单
2. Property（属性）- 对象的特征，如名称、价格、状态
3. Link Type（关系类型）- 对象间的关联，如公司拥有产品
4. Action Type（动作类型）- 可执行的业务操作

设计原则：
- 每个 Object Type 应有明确的数据集支持（backing_dataset）
- 属性应包含类型、是否主键、描述
- 关系应定义源对象、目标对象、基数（1:1, 1:N, N:M）
- 动作应定义参数和规则

请用中文与用户交流，但生成的本体 ID 使用英文。`;

// AI Conversation endpoint with session support
router.post('/conversation', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { sessionId, message, includeCurrentOntology } = req.body;

    // Get or create session
    let session = sessionId ? sessions.get(sessionId) : null;
    if (!session) {
      session = {
        id: crypto.randomUUID(),
        history: [],
        currentOntology: null,
        createdAt: Date.now(),
      };
      sessions.set(session.id, session);
    }

    // Get current ontology from Java backend if needed
    let contextPrefix = '';
    if (includeCurrentOntology || session.history.length === 0) {
      try {
        const response = await fetch(`${JAVA_BACKEND}/api/ontology`);
        const dbOntology = await response.json();
        if (dbOntology.objectTypes?.length > 0) {
          contextPrefix = `\n\n[当前已有本体]\n\`\`\`json\n${JSON.stringify(dbOntology, null, 2)}\n\`\`\`\n\n在此基础上进行修改。`;
        }
      } catch (e) {}
    }

    // Build messages for DeepSeek
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: ONTOLOGY_SYSTEM_PROMPT },
    ];

    // Add history
    for (const h of session.history) {
      messages.push({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content,
      });
    }

    // Add current message
    const userMessage = session.history.length === 0 ? message + contextPrefix : message;
    messages.push({ role: 'user', content: userMessage });

    const text = await callDeepSeek(messages);

    // Extract ontology JSON from response
    let ontology: any = null;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        ontology = JSON.parse(jsonMatch[1]);
        session.currentOntology = ontology;
      } catch (e) {}
    }

    // Store in history
    session.history.push({ role: 'user', content: message });
    session.history.push({ role: 'assistant', content: text });

    // Clean text for display
    const displayText = text.replace(/```json[\s\S]*?```/g, '').trim();

    res.json({
      sessionId: session.id,
      message: displayText,
      ontology,
      turnCount: Math.floor(session.history.length / 2),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Apply a conversation's ontology to the database
router.post('/conversation/:sessionId/apply', async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session || !session.currentOntology) {
    return res.status(404).json({ error: 'No ontology in this session' });
  }

  try {
    const ont = session.currentOntology;
    
    // Import object types
    for (const ot of ont.objectTypes || []) {
      await fetch(`${JAVA_BACKEND}/api/object-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ot),
      });
    }

    // Import link types
    for (const lt of ont.linkTypes || []) {
      await fetch(`${JAVA_BACKEND}/api/link-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lt),
      });
    }

    // Get updated ontology
    const response = await fetch(`${JAVA_BACKEND}/api/ontology`);
    const data = await response.json();

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations from Java backend
router.get('/conversations', async (_req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/ai/conversations`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get conversation by ID
router.get('/conversations/:id', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/ai/conversations/${req.params.id}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create conversation
router.post('/conversations', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/ai/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update conversation
router.put('/conversations/:id', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/ai/conversations/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete conversation
router.delete('/conversations/:id', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/ai/conversations/${req.params.id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Simple AI query
router.post('/query', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { question } = req.body;

    const messages = [
      { role: 'user', content: question },
    ];

    const text = await callDeepSeek(messages);

    res.json({ answer: text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate action type (parameters + rules)
router.post('/generate-action', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { name, description, targetObjectId } = req.body;

    // Get target object info from Java backend
    let targetInfo = `目标对象ID: ${targetObjectId}`;
    try {
      const response = await fetch(`${JAVA_BACKEND}/api/object-types/${targetObjectId}`);
      if (response.ok) {
        const targetOT = await response.json();
        targetInfo = `目标对象: ${targetOT.name}（${targetOT.description}）`;
      }
    } catch (e) {}

    const prompt = `你是 Palantir Foundry Ontology 专家。请为以下 Action Type 设计完整的参数列表和规则：

Action 名称: "${name}"
Action 描述: "${description || '无'}"
${targetInfo}

要求：
1. 参数应包含：名称、类型（string/number/boolean/date/object）、是否必填、描述
2. 规则应包含：类型（validation/condition/sideEffect）、描述
3. 参数和规则应与目标对象的属性相关联

返回 JSON 格式：
\`\`\`json
{
  "parameters": [
    {"name": "参数名", "type": "string", "required": true, "description": "描述"}
  ],
  "rules": [
    {"type": "validation", "description": "规则描述"}
  ],
  "reasoning": "设计思路说明"
}
\`\`\``;

    const messages = [{ role: 'user', content: prompt }];
    const text = await callDeepSeek(messages);
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[1]);
      res.json(result);
    } else {
      res.json({ parameters: [], rules: [], reasoning: text });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Suggest properties for object type
router.post('/suggest-properties', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { objectTypeName, description, existingProperties } = req.body;

    const prompt = `作为数据建模专家，请为以下对象类型建议属性：

对象类型名称: "${objectTypeName}"
描述: "${description || '无'}"
已有属性: ${JSON.stringify(existingProperties || [])}

要求：
1. 建议 5-10 个常用属性
2. 包含名称、类型、是否主键、描述
3. 类型可选：string, number, boolean, date, object
4. 避免与已有属性重复

返回 JSON 格式：
\`\`\`json
{
  "suggestions": [
    {"name": "属性名", "type": "string", "isPrimaryKey": false, "description": "描述"}
  ]
}
\`\`\``;

    const messages = [{ role: 'user', content: prompt }];
    const text = await callDeepSeek(messages);
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[1]);
      res.json(result);
    } else {
      res.json({ suggestions: [] });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Suggest links between object types
router.post('/suggest-links', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { objectTypes } = req.body;

    const prompt = `作为本体论专家，请分析以下对象类型之间可能存在的关系：

对象类型列表:
${JSON.stringify(objectTypes, null, 2)}

要求：
1. 识别对象类型之间的业务关系
2. 为每对关系定义：名称、源对象、目标对象、基数（1:1, 1:N, N:M）、描述
3. 只返回有意义的关系

返回 JSON 格式：
\`\`\`json
{
  "suggestions": [
    {
      "name": "关系名称",
      "sourceObjectId": "源对象ID",
      "targetObjectId": "目标对象ID",
      "cardinality": "1:N",
      "description": "描述"
    }
  ]
}
\`\`\``;

    const messages = [{ role: 'user', content: prompt }];
    const text = await callDeepSeek(messages);
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[1]);
      res.json(result);
    } else {
      res.json({ suggestions: [] });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate ontology from description
router.post('/generate-ontology', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { description } = req.body;

    const prompt = `你是 Ontology Architect。基于以下描述生成完整的本体定义：

描述: "${description}"

返回 JSON 格式：
\`\`\`json
{
  "objectTypes": [
    {
      "id": "ot_example",
      "name": "示例对象",
      "description": "描述",
      "icon": "Database",
      "backingDataset": "dataset_name",
      "properties": [
        {"id": "p_id", "name": "ID", "type": "string", "isPrimaryKey": true}
      ]
    }
  ],
  "linkTypes": [
    {
      "id": "lt_source_target",
      "name": "关系名称",
      "sourceObjectId": "ot_source",
      "targetObjectId": "ot_target",
      "cardinality": "1:N",
      "description": "描述"
    }
  ]
}
\`\`\``;

    const messages = [{ role: 'user', content: prompt }];
    const text = await callDeepSeek(messages);
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);

    if (jsonMatch) {
      const ontology = JSON.parse(jsonMatch[1]);
      res.json({ ontology });
    } else {
      res.json({ ontology: null });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

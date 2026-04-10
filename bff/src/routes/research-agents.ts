import { Router } from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';

const router = Router();
const MODEL = 'deepseek-chat';

// Java backend URL
const JAVA_BACKEND = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

function checkAI(): boolean {
  return !!DEEPSEEK_API_KEY;
}

// DeepSeek API call helper
async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not configured');

  const startTime = Date.now();
  console.log(`[DeepSeek] Request started at ${new Date().toISOString()}`);
  console.log(`[DeepSeek] Messages:`, JSON.stringify(messages, null, 2));

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
    console.log(`[DeepSeek] Response received in ${duration}ms, status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[DeepSeek] API error: ${error}`);
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';
    console.log(`[DeepSeek] Response content length: ${content.length} chars`);
    console.log(`[DeepSeek] Token usage:`, data.usage);
    
    return content;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[DeepSeek] Request failed after ${duration}ms:`, error);
    throw error;
  }
}

// Research system prompt
const RESEARCH_SYSTEM_PROMPT = `你是专业的投研分析师，擅长基于本体论（Ontology）的产业链分析框架进行深度研究。

你的核心能力：
1. 事件发现与跟踪 - 从多源信息中识别关键事件
2. 产业链传导分析 - 基于本体定义的实体关系分析事件影响路径
3. 深度分析报告 - 输出结构化、可量化的研究结论

分析原则：
- 基于事实和数据，避免主观臆断
- 关注产业链上下游传导效应
- 区分短期噪音和长期趋势
- 给出可验证的投资建议`;

// Get all research agents
router.get('/', async (_req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/research-agents`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create research agent
router.post('/', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/research-agents`, {
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

// Update research agent
router.put('/:id', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/research-agents/${req.params.id}`, {
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

// Delete research agent
router.delete('/:id', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/research-agents/${req.params.id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get agent events
router.get('/:id/events', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/research-agents/${req.params.id}/events`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get agent analyses
router.get('/:id/analyses', async (req, res) => {
  try {
    const response = await fetch(`${JAVA_BACKEND}/api/research-agents/${req.params.id}/analyses`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Run agent manually
router.post('/:id/run', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    // Get agent info from Java backend
    const agentResponse = await fetch(`${JAVA_BACKEND}/api/research-agents/${req.params.id}`);
    if (!agentResponse.ok) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    const agentData = await agentResponse.json();
    const agent = agentData.agent;

    // Get ontology from Java backend
    const ontologyResponse = await fetch(`${JAVA_BACKEND}/api/ontology`);
    const ontology = await ontologyResponse.json();
    const ontologyContext = JSON.stringify(ontology, null, 2);

    const today = new Date().toISOString().slice(0, 10);
    
    // Step 1: Event Discovery
    const eventPrompt = `${RESEARCH_SYSTEM_PROMPT}

你正在跟踪: ${agent.targetCompany}（行业: ${agent.targetIndustry}）
${agent.analysisFocus ? `重点关注: ${agent.analysisFocus}` : ''}
今天日期: ${today}

当前本体定义（包含产业链语义关系）：
${ontologyContext}

请获取 ${agent.targetCompany} 最近1-2周内的 3-5 条最新重要事件/热点新闻。
优先关注以下权威信息源：财联社、东方财富、证券时报、上海证券报、中国证券报、21世纪经济报道、公司公告、行业协会发布。
对于每个事件，需要评估它与本体中哪些实体和关系相关。

要求：
- 事件必须是最近1-2周内发生的，不要使用过时的历史事件
- 每条事件必须注明具体来源（媒体名称或公告类型）
- event_date 必须是实际的事件日期，不要编造

返回 JSON 格式：
\`\`\`json
{
  "events": [
    {
      "title": "事件标题",
      "summary": "事件概要（100字以内）",
      "source": "来源媒体/渠道",
      "event_date": "YYYY-MM-DD",
      "impact_level": "high|medium|low",
      "related_entities": ["本体中相关实体的名称"]
    }
  ]
}
\`\`\``;

    const eventMessages = [{ role: 'user', content: eventPrompt }];
    const eventText = await callDeepSeek(eventMessages);
    const eventJsonMatch = eventText.match(/```json\s*([\s\S]*?)```/);

    let events: any[] = [];
    if (eventJsonMatch) {
      try {
        const parsed = JSON.parse(eventJsonMatch[1]);
        events = parsed.events || [];
      } catch (e) {}
    }

    // Save events to Java backend
    const savedEvents: any[] = [];
    for (const evt of events) {
      try {
        const saveResponse = await fetch(`${JAVA_BACKEND}/api/research-agents/${req.params.id}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `evt_${crypto.randomUUID().slice(0, 8)}`,
            title: evt.title,
            summary: evt.summary || '',
            source: evt.source || '',
            source_url: evt.source_url || '',
            event_date: evt.event_date || '',
            impact_level: evt.impact_level || 'medium',
            related_entities: JSON.stringify(evt.related_entities || []),
          }),
        });
        if (saveResponse.ok) {
          savedEvents.push(evt);
        }
      } catch (e) {}
    }

    // Step 2: Deep Analysis
    const analysisPrompt = `${RESEARCH_SYSTEM_PROMPT}

## 分析目标
公司: ${agent.targetCompany}
行业: ${agent.targetIndustry}
${agent.analysisFocus ? `重点: ${agent.analysisFocus}` : ''}

## 本体定义（产业链语义关系）
${ontologyContext}

## 近期事件
${events.map((e: any, i: number) => `${i + 1}. 【${e.impact_level}】${e.title}\n   ${e.summary}`).join('\n')}

## 分析要求
请作为首席研究员，输出一份完整的事件点评分析报告。必须：

1. **事件梳理与定性** - 对每个事件的本质和重要性进行定性
2. **产业链传导分析** - 基于本体中定义的实体关系（如公司-产品-客户-供应商等），分析事件如何沿产业链传导
3. **影响评估矩阵** - 从以下维度逐一评估影响：
   - 短期业绩影响（1-2个季度）
   - 中期战略影响（1-2年）
   - 长期竞争格局影响（3-5年）
4. **关键发现** - 提炼 3-5 条核心发现
5. **影响链条** - 描述事件影响的完整传导路径（基于本体语义关系）
6. **投资建议** - 给出明确的投资评级建议和核心逻辑

返回 JSON 格式：
\`\`\`json
{
  "title": "分析报告标题",
  "content": "完整的 Markdown 格式分析报告（至少 800 字）",
  "key_findings": ["发现1", "发现2", "发现3"],
  "impact_chain": [
    {"from": "起始实体", "to": "影响实体", "mechanism": "传导机制", "intensity": "high|medium|low"}
  ],
  "recommendation": "投资建议摘要（含评级和核心逻辑）"
}
\`\`\``;

    const analysisMessages = [{ role: 'user', content: analysisPrompt }];
    const analysisText = await callDeepSeek(analysisMessages);
    const analysisJsonMatch = analysisText.match(/```json\s*([\s\S]*?)```/);

    let analysis: any = null;
    if (analysisJsonMatch) {
      try {
        analysis = JSON.parse(analysisJsonMatch[1]);
      } catch (e) {}
    }

    // Save analysis to Java backend
    if (analysis) {
      await fetch(`${JAVA_BACKEND}/api/research-agents/${req.params.id}/analyses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `ana_${crypto.randomUUID().slice(0, 8)}`,
          title: analysis.title || '',
          content: analysis.content || '',
          key_findings: JSON.stringify(analysis.key_findings || []),
          impact_chain: JSON.stringify(analysis.impact_chain || []),
          recommendation: analysis.recommendation || '',
        }),
      });
    }

    res.json({ success: true, events: savedEvents, analysis });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 流式产业链智能问答API
router.post('/:id/chat/stream', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { message } = req.body;
    const agentId = req.params.id;

    // Get agent info from Java backend
    const agentResponse = await fetch(`${JAVA_BACKEND}/api/research-agents/${agentId}`);
    if (!agentResponse.ok) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    const agentData = await agentResponse.json();
    const agent = agentData.agent;

    // Get ontology from Java backend
    const ontologyResponse = await fetch(`${JAVA_BACKEND}/api/ontology`);
    const ontology = await ontologyResponse.json();
    const ontologyContext = JSON.stringify(ontology, null, 2);

    const today = new Date().toISOString().slice(0, 10);

    const chatPrompt = `${RESEARCH_SYSTEM_PROMPT}

你正在跟踪: ${agent.targetCompany}（行业: ${agent.targetIndustry}）
${agent.analysisFocus ? `重点关注: ${agent.analysisFocus}` : ''}
今天日期: ${today}

当前本体定义（包含产业链语义关系）：
${ontologyContext}

用户问题: ${message}

请基于本体论框架，对用户的产业链相关问题进行深入分析。回答要专业、结构化，并体现产业链传导逻辑。`;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Call DeepSeek with streaming
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2分钟超时

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: chatPrompt }],
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      res.write(`data: ${JSON.stringify({ error: `DeepSeek API error: ${error}` })}\n\n`);
      res.end();
      return;
    }

    // Process stream
    const reader = response.body;
    if (!reader) {
      res.write(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`);
      res.end();
      return;
    }

    let fullContent = '';
    const decoder = new TextDecoder();

    reader.on('data', (chunk: Buffer) => {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write(`data: ${JSON.stringify({ done: true, fullContent })}\n\n`);
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    });

    reader.on('error', (err: any) => {
      console.error('[Research Stream] Error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

  } catch (err: any) {
    console.error('[Research Chat Stream] Error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

export default router;

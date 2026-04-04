import { Router } from 'express';

const router = Router();
const MODEL = 'deepseek-chat';

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

function checkAI(): boolean {
  return !!DEEPSEEK_API_KEY;
}

// DeepSeek API call helper
async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not configured');

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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || '';
}

// Agent: generate ontology from description
router.post('/generate-and-import', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { description } = req.body;
    
    const prompt = `You are an Ontology Architect. Generate a complete ontology based on: "${description}".

Return JSON format:
\`\`\`json
{
  "objectTypes": [
    {
      "id": "ot_example",
      "name": "Example",
      "description": "Description",
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
      "name": "Relation Name",
      "sourceObjectId": "ot_source",
      "targetObjectId": "ot_target",
      "cardinality": "1:N",
      "description": "Description"
    }
  ]
}
\`\`\``;

    const messages = [{ role: 'user', content: prompt }];
    const text = await callDeepSeek(messages);
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    const ontology = jsonMatch ? JSON.parse(jsonMatch[1]) : null;

    res.json({
      success: true,
      ontology,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Agent: ontology Q&A
router.post('/ontology-qa', async (req, res) => {
  if (!checkAI()) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const { question } = req.body;
    
    const messages = [{ role: 'user', content: question }];
    const text = await callDeepSeek(messages);

    res.json({
      answer: text,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

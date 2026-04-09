import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// 获取所有函数类型
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows]: any = await connection.execute(
      'SELECT * FROM function_type ORDER BY created_at DESC'
    );
    connection.release();
    
    // 解析JSON字段
    const functions = rows.map((row: any) => ({
      ...row,
      inputParams: row.input_params ? JSON.parse(row.input_params) : { ontologyGraph: null, custom: [] },
      outputParams: row.output_params ? JSON.parse(row.output_params) : { params: [] },
    }));
    
    res.json({ success: true, functions });
  } catch (error: any) {
    console.error('Error fetching function types:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建函数类型
router.post('/', async (req, res) => {
  const { name, restRoute, description, inputParams, outputParams } = req.body;
  
  if (!name || !restRoute) {
    return res.status(400).json({ success: false, error: '函数名和Rest路由为必填项' });
  }
  
  try {
    const id = `func_${Date.now()}`;
    const connection = await pool.getConnection();
    
    // 构建入参 - 默认包含本体图谱
    const inputParamsData = {
      ontologyGraph: {
        name: 'ontologyGraph',
        type: 'object',
        description: '本体图谱数据（包含对象类型和链接类型）',
        required: true,
        default: true,
      },
      custom: inputParams || [],
    };
    
    // 构建出参
    const outputParamsData = {
      params: outputParams || [],
    };
    
    await connection.execute(
      `INSERT INTO function_type (id, name, rest_route, input_params, output_params, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, restRoute, JSON.stringify(inputParamsData), JSON.stringify(outputParamsData), description || '']
    );
    
    connection.release();
    
    res.json({
      success: true,
      data: {
        id,
        name,
        restRoute,
        description,
        inputParams: inputParamsData,
        outputParams: outputParamsData,
      },
    });
  } catch (error: any) {
    console.error('Error creating function type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新函数类型
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, restRoute, description, inputParams, outputParams } = req.body;
  
  try {
    const connection = await pool.getConnection();
    
    // 获取现有数据
    const [existing]: any = await connection.execute(
      'SELECT * FROM function_type WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: '函数类型不存在' });
    }
    
    const current = existing[0];
    
    // 构建更新数据
    const inputParamsData = inputParams !== undefined ? {
      ontologyGraph: {
        name: 'ontologyGraph',
        type: 'object',
        description: '本体图谱数据（包含对象类型和链接类型）',
        required: true,
        default: true,
      },
      custom: inputParams,
    } : JSON.parse(current.input_params);
    
    const outputParamsData = outputParams !== undefined ? {
      params: outputParams,
    } : JSON.parse(current.output_params);
    
    await connection.execute(
      `UPDATE function_type 
       SET name = ?, rest_route = ?, description = ?, input_params = ?, output_params = ?
       WHERE id = ?`,
      [
        name || current.name,
        restRoute || current.rest_route,
        description !== undefined ? description : current.description,
        JSON.stringify(inputParamsData),
        JSON.stringify(outputParamsData),
        id,
      ]
    );
    
    connection.release();
    
    res.json({
      success: true,
      data: {
        id,
        name: name || current.name,
        restRoute: restRoute || current.rest_route,
        description: description !== undefined ? description : current.description,
        inputParams: inputParamsData,
        outputParams: outputParamsData,
      },
    });
  } catch (error: any) {
    console.error('Error updating function type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除函数类型
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM function_type WHERE id = ?', [id]);
    connection.release();
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting function type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

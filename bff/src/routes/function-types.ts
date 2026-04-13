import { Router } from 'express';
import { pool } from '../db.js';
import fetch from 'node-fetch';

const router = Router();

// 获取所有函数类型
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const connection = await pool.getConnection();
    
    let query = 'SELECT * FROM function_types WHERE status = ? ORDER BY created_at DESC';
    let params: any[] = ['ACTIVE'];
    
    if (category) {
      query = 'SELECT * FROM function_types WHERE status = ? AND category = ? ORDER BY created_at DESC';
      params = ['ACTIVE', category];
    }
    
    const [rows]: any = await connection.execute(query, params);
    
    // 加载每个函数的参数
    const functions = await Promise.all(rows.map(async (row: any) => {
      const [paramsRows]: any = await connection.execute(
        'SELECT * FROM function_params WHERE function_id = ? ORDER BY sort_order',
        [row.id]
      );
      
      // 转换参数字段名为驼峰命名
      const convertParam = (p: any) => ({
        id: p.id,
        functionId: p.function_id,
        paramDirection: p.param_direction,
        paramName: p.param_name,
        paramCode: p.param_code,
        paramType: p.param_type,
        isRequired: p.is_required,
        defaultValue: p.default_value,
        description: p.description,
        sortOrder: p.sort_order,
        sourceType: p.source_type,
      });
      
      // 转换函数类型主表字段为驼峰命名
      const convertFunctionType = (r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description,
        category: r.category,
        interfaceType: r.interface_type,
        requestMethod: r.request_method,
        interfaceUrl: r.interface_url,
        implementationType: r.implementation_type,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      });
      
      return {
        ...convertFunctionType(row),
        inputParams: paramsRows.filter((p: any) => p.param_direction === 'INPUT').map(convertParam),
        outputParams: paramsRows.filter((p: any) => p.param_direction === 'OUTPUT').map(convertParam),
      };
    }));
    
    connection.release();
    res.json({ success: true, functions });
  } catch (error: any) {
    console.error('Error fetching function types:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个函数类型
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    const [rows]: any = await connection.execute(
      'SELECT * FROM function_types WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: 'Function not found' });
    }
    
    const [paramsRows]: any = await connection.execute(
      'SELECT * FROM function_params WHERE function_id = ? ORDER BY sort_order',
      [id]
    );
    
    connection.release();
    
    // 转换函数类型主表字段为驼峰命名
    const convertFunctionType = (r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      category: r.category,
      interfaceType: r.interface_type,
      requestMethod: r.request_method,
      interfaceUrl: r.interface_url,
      implementationType: r.implementation_type,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
    
    // 转换参数字段名为驼峰命名
    const convertParam = (p: any) => ({
      id: p.id,
      functionId: p.function_id,
      paramDirection: p.param_direction,
      paramName: p.param_name,
      paramCode: p.param_code,
      paramType: p.param_type,
      isRequired: p.is_required,
      defaultValue: p.default_value,
      description: p.description,
      sortOrder: p.sort_order,
      sourceType: p.source_type,
    });
    
    const func = {
      ...convertFunctionType(rows[0]),
      inputParams: paramsRows.filter((p: any) => p.param_direction === 'INPUT').map(convertParam),
      outputParams: paramsRows.filter((p: any) => p.param_direction === 'OUTPUT').map(convertParam),
    };
    
    res.json({ success: true, function: func });
  } catch (error: any) {
    console.error('Error fetching function type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建函数类型
router.post('/', async (req, res) => {
  const { 
    code, name, description, category,
    interfaceType, requestMethod, interfaceUrl,
    implementationType,
    inputParams, outputParams 
  } = req.body;
  
  if (!code || !name) {
    return res.status(400).json({ success: false, error: '函数编码和名称为必填项' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const id = `func_${Date.now()}`;
    
    // 将undefined转为null
    const safeValue = (v: any) => v === undefined ? null : v;
    
    await connection.execute(
      `INSERT INTO function_types (id, code, name, description, category, 
        interface_type, request_method, interface_url, 
        implementation_type, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id, 
        safeValue(code), 
        safeValue(name), 
        safeValue(description) || '', 
        safeValue(category) || 'QUERY',
        safeValue(interfaceType) || 'RESTFUL', 
        safeValue(requestMethod) || 'GET', 
        safeValue(interfaceUrl) || '',
        safeValue(implementationType) || 'JAVA', 
        'ACTIVE'
      ]
    );
    
    // 插入入参
    if (inputParams && Array.isArray(inputParams)) {
      for (let i = 0; i < inputParams.length; i++) {
        const p = inputParams[i];
        await connection.execute(
          `INSERT INTO function_params (id, function_id, param_direction, param_name, param_code, 
            param_type, is_required, default_value, description, sort_order, source_type) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `fp_${Date.now()}_${i}`, 
            id, 
            'INPUT', 
            safeValue(p.paramName) || '', 
            safeValue(p.paramCode) || '',
            safeValue(p.paramType) || 'string', 
            p.isRequired === undefined ? 0 : p.isRequired, 
            safeValue(p.defaultValue),
            safeValue(p.description) || '', 
            i, 
            safeValue(p.sourceType) || 'USER_INPUT'
          ]
        );
      }
    }
    
    // 插入出参
    if (outputParams && Array.isArray(outputParams)) {
      for (let i = 0; i < outputParams.length; i++) {
        const p = outputParams[i];
        await connection.execute(
          `INSERT INTO function_params (id, function_id, param_direction, param_name, param_code, 
            param_type, is_required, description, sort_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `fp_${Date.now()}_out_${i}`, 
            id, 
            'OUTPUT', 
            safeValue(p.paramName) || '', 
            safeValue(p.paramCode) || '',
            safeValue(p.paramType) || 'string', 
            0, 
            safeValue(p.description) || '', 
            i
          ]
        );
      }
    }
    
    await connection.commit();
    connection.release();
    
    res.json({
      success: true,
      function: {
        id, code, name, description, category,
        interfaceType, requestMethod, interfaceUrl,
        implementationType,
        status: 'ACTIVE',
        inputParams: inputParams || [],
        outputParams: outputParams || [],
      },
    });
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error('Error creating function type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新函数类型
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    code, name, description, category,
    interfaceType, requestMethod, interfaceUrl,
    implementationType, status,
    inputParams, outputParams 
  } = req.body;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 获取现有数据
    const [existing]: any = await connection.execute(
      'SELECT * FROM function_types WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, error: '函数类型不存在' });
    }
    
    const current = existing[0];
    
    // 将undefined转为null
    const safeValue = (v: any) => v === undefined ? null : v;
    
    // 更新主表
    await connection.execute(
      `UPDATE function_types 
       SET code = ?, name = ?, description = ?, category = ?,
           interface_type = ?, request_method = ?, interface_url = ?,
           implementation_type = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        safeValue(code) || current.code,
        safeValue(name) || current.name,
        safeValue(description) !== null ? safeValue(description) : current.description,
        safeValue(category) || current.category,
        safeValue(interfaceType) || current.interface_type,
        safeValue(requestMethod) || current.request_method,
        safeValue(interfaceUrl) !== null ? safeValue(interfaceUrl) : current.interface_url,
        safeValue(implementationType) || current.implementation_type,
        safeValue(status) || current.status,
        id,
      ]
    );
    
    // 如果提供了参数，则更新参数
    if (inputParams !== undefined || outputParams !== undefined) {
      // 删除旧参数
      await connection.execute('DELETE FROM function_params WHERE function_id = ?', [id]);
      
      // 插入新入参
      if (inputParams && Array.isArray(inputParams)) {
        for (let i = 0; i < inputParams.length; i++) {
          const p = inputParams[i];
          await connection.execute(
            `INSERT INTO function_params (id, function_id, param_direction, param_name, param_code, 
              param_type, is_required, default_value, description, sort_order, source_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              `fp_${Date.now()}_${i}`, 
              id, 
              'INPUT', 
              safeValue(p.paramName) || '', 
              safeValue(p.paramCode) || '',
              safeValue(p.paramType) || 'string', 
              p.isRequired === undefined ? 0 : p.isRequired, 
              safeValue(p.defaultValue),
              safeValue(p.description) || '', 
              i, 
              safeValue(p.sourceType) || 'USER_INPUT'
            ]
          );
        }
      }
      
      // 插入新出参
      if (outputParams && Array.isArray(outputParams)) {
        for (let i = 0; i < outputParams.length; i++) {
          const p = outputParams[i];
          await connection.execute(
            `INSERT INTO function_params (id, function_id, param_direction, param_name, param_code, 
              param_type, is_required, description, sort_order) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              `fp_${Date.now()}_out_${i}`, 
              id, 
              'OUTPUT', 
              safeValue(p.paramName) || '', 
              safeValue(p.paramCode) || '',
              safeValue(p.paramType) || 'string', 
              0, 
              safeValue(p.description) || '', 
              i
            ]
          );
        }
      }
    }
    
    await connection.commit();
    connection.release();
    
    res.json({
      success: true,
      function: {
        id,
        code: code || current.code,
        name: name || current.name,
        description: description !== undefined ? description : current.description,
        category: category || current.category,
        interfaceType: interfaceType || current.interface_type,
        requestMethod: requestMethod || current.request_method,
        interfaceUrl: interfaceUrl !== undefined ? interfaceUrl : current.interface_url,
        implementationType: implementationType || current.implementation_type,
        status: status || current.status,
      },
    });
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error('Error updating function type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除函数类型（软删除）
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE function_types SET status = ?, updated_at = NOW() WHERE id = ?',
      ['DISABLED', id]
    );
    connection.release();
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting function type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 执行函数类型预览 - 代理到Java后端
router.post('/:id/execute', async (req, res) => {
  const { id } = req.params;
  const parameters = req.body;
  
  try {
    const response = await fetch(`${process.env.JAVA_BACKEND_URL || 'http://localhost:8080'}/api/function-types/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Error executing function type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

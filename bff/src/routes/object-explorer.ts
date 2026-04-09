import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// 获取对象类型的实例数据
router.get('/:objectTypeId/instances', async (req, res) => {
  const { objectTypeId } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    // 1. 获取对象类型元数据
    const [objectTypeRows]: any = await connection.execute(
      `SELECT ot.id, ot.name, ot.backing_dataset,
              p.id as prop_id, p.name as prop_name, p.base_column, p.is_primary_key, p.type
       FROM object_types ot
       LEFT JOIN properties p ON ot.id = p.object_type_id
       WHERE ot.id = ?`,
      [objectTypeId]
    );
    
    if (objectTypeRows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: 'Object type not found' });
    }
    
    // 组织对象类型元数据（只包含有 base_column 映射的属性）
    const objectType = {
      id: objectTypeRows[0].id,
      name: objectTypeRows[0].name,
      backingDataset: objectTypeRows[0].backing_dataset,
      properties: objectTypeRows
        .filter((row: any) => row.prop_id && row.base_column && row.base_column.trim() !== '')
        .map((row: any) => ({
          id: row.prop_id,
          name: row.prop_name,
          type: row.type,
          baseColumn: row.base_column,
          isPrimaryKey: row.is_primary_key === 1,
        })),
    };
    
    if (!objectType.backingDataset) {
      connection.release();
      return res.json({ success: true, data: [], objectType });
    }
    
    // 2. 查询实际数据
    const columns = objectType.properties
      .map((p: any) => {
        const col = p.baseColumn;
        // 如果列名以数字开头或包含特殊字符，使用反引号转义
        if (col && (/^\d/.test(col) || /[^a-zA-Z0-9_]/.test(col))) {
          return `\`${col}\``;
        }
        return col;
      })
      .filter(Boolean)
      .join(', ');
    
    const [dataRows] = await connection.execute(
      `SELECT ${columns} FROM ${objectType.backingDataset} LIMIT 100`
    );
    
    // 3. 将数据库列名映射为属性ID
    const mappedData = (dataRows as any[]).map((row: any) => {
      const mapped: any = {};
      objectType.properties.forEach((prop: any) => {
        const columnName = prop.baseColumn;
        if (columnName && columnName.trim() !== '') {
          mapped[prop.id] = row[columnName];
        } else {
          mapped[prop.id] = null;
        }
      });
      return mapped;
    });
    
    connection.release();
    
    res.json({
      success: true,
      data: mappedData,
      objectType,
    });
  } catch (error: any) {
    console.error('Error fetching object instances:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取实例的关系图谱数据（支持逐层遍历）
router.get('/:objectTypeId/instances/:instanceId/graph', async (req, res) => {
  const { objectTypeId, instanceId } = req.params;
  const maxDepth = parseInt(req.query.depth as string) || 3;
  
  try {
    const connection = await pool.getConnection();
    
    // 获取对象类型及其属性
    const [otRows]: any = await connection.execute(
      `SELECT ot.id, ot.name, ot.backing_dataset,
              p.id as prop_id, p.name as prop_name, p.base_column, p.is_primary_key, p.type
       FROM object_types ot
       LEFT JOIN properties p ON ot.id = p.object_type_id
       WHERE ot.id = ?`,
      [objectTypeId]
    );
    
    if (otRows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: 'Object type not found' });
    }
    
    const objectType: any = {
      id: otRows[0].id,
      name: otRows[0].name,
      backingDataset: otRows[0].backing_dataset,
      properties: otRows.filter((r: any) => r.prop_id).map((r: any) => ({
        id: r.prop_id,
        name: r.prop_name,
        baseColumn: r.base_column,
        isPrimaryKey: r.is_primary_key === 1,
      })),
    };
    
    const pkProp = objectType.properties.find((p: any) => p.isPrimaryKey);
    if (!pkProp) {
      connection.release();
      return res.status(400).json({ success: false, error: 'No primary key property found' });
    }
    
    // 图谱数据结构
    const nodes: any[] = [];
    const links: any[] = [];
    const visitedNodes = new Set<string>();
    const visitedLinks = new Set<string>();
    
    // 递归获取关系数据
    async function fetchRelations(
      currentObjectTypeId: string,
      currentInstanceId: string,
      depth: number
    ): Promise<void> {
      if (depth > maxDepth) return;
      
      const nodeKey = `${currentObjectTypeId}:${currentInstanceId}`;
      if (visitedNodes.has(nodeKey)) return;
      visitedNodes.add(nodeKey);
      
      // 获取当前对象类型信息
      const [currentOtRows]: any = await connection.execute(
        `SELECT ot.id, ot.name, ot.backing_dataset,
                p.id as prop_id, p.name as prop_name, p.base_column, p.is_primary_key
         FROM object_types ot
         LEFT JOIN properties p ON ot.id = p.object_type_id
         WHERE ot.id = ?`,
        [currentObjectTypeId]
      );
      
      if (currentOtRows.length === 0) return;
      
      const currentOt: any = {
        id: currentOtRows[0].id,
        name: currentOtRows[0].name,
        backingDataset: currentOtRows[0].backing_dataset,
        properties: currentOtRows.filter((r: any) => r.prop_id).map((r: any) => ({
          id: r.prop_id,
          name: r.prop_name,
          baseColumn: r.base_column,
          isPrimaryKey: r.is_primary_key === 1,
        })),
      };
      
      const currentPk = currentOt.properties.find((p: any) => p.isPrimaryKey);
      if (!currentPk) return;
      
      // 获取当前实例的完整数据
      const [instanceRows]: any = await connection.execute(
        `SELECT * FROM ${currentOt.backingDataset} WHERE ${currentPk.baseColumn} = ? LIMIT 1`,
        [currentInstanceId]
      );
      
      if (instanceRows.length === 0) return;
      
      const instanceData = instanceRows[0];
      
      // 添加节点
      nodes.push({
        id: nodeKey,
        objectTypeId: currentObjectTypeId,
        objectTypeName: currentOt.name,
        instanceId: currentInstanceId,
        label: currentInstanceId,
        data: instanceData,
        depth,
      });
      
      // 获取与当前对象类型相关的所有链接类型
      const [linkTypeRows]: any = await connection.execute(
        `SELECT lt.id, lt.name, lt.source_object_id, lt.target_object_id,
                lt.source_column, lt.target_column, lt.cardinality,
                sot.name as source_name, sot.backing_dataset as source_table,
                tot.name as target_name, tot.backing_dataset as target_table
         FROM link_types lt
         JOIN object_types sot ON lt.source_object_id = sot.id
         JOIN object_types tot ON lt.target_object_id = tot.id
         WHERE lt.source_object_id = ? OR lt.target_object_id = ?`,
        [currentObjectTypeId, currentObjectTypeId]
      );
      
      for (const linkType of linkTypeRows) {
        const isSource = linkType.source_object_id === currentObjectTypeId;
        const relatedObjectTypeId = isSource ? linkType.target_object_id : linkType.source_object_id;
        const relatedColumnName = isSource ? linkType.target_column : linkType.source_column;
        const currentColumnName = isSource ? linkType.source_column : linkType.target_column;
        const relatedTable = isSource ? linkType.target_table : linkType.source_table;
        const relatedName = isSource ? linkType.target_name : linkType.source_name;
        
        // 从link_instance_data查找关联实例
        const [linkInstanceRows]: any = await connection.execute(
          `SELECT * FROM link_instance_data WHERE link_type_id = ? AND ${
            isSource ? 'source_instance_id' : 'target_instance_id'
          } = ?`,
          [linkType.id, currentInstanceId]
        );
        
        for (const linkInstance of linkInstanceRows) {
          const relatedInstanceId = isSource ? linkInstance.target_instance_id : linkInstance.source_instance_id;
          const relatedNodeKey = `${relatedObjectTypeId}:${relatedInstanceId}`;
          
          // 添加链接
          const linkKey = `${nodeKey}:${relatedNodeKey}:${linkType.id}`;
          if (!visitedLinks.has(linkKey)) {
            visitedLinks.add(linkKey);
            links.push({
              id: linkKey,
              source: nodeKey,
              target: relatedNodeKey,
              linkTypeId: linkType.id,
              linkTypeName: linkType.name,
              cardinality: linkType.cardinality,
              direction: isSource ? 'downstream' : 'upstream',
            });
          }
          
          // 递归获取下一层关系
          if (!visitedNodes.has(relatedNodeKey)) {
            await fetchRelations(relatedObjectTypeId, relatedInstanceId, depth + 1);
          }
        }
      }
    }
    
    // 从选中的实例开始遍历
    await fetchRelations(objectTypeId, instanceId, 0);
    
    connection.release();
    
    res.json({
      success: true,
      data: {
        nodes,
        links,
      },
    });
  } catch (error: any) {
    console.error('Error fetching relation graph:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

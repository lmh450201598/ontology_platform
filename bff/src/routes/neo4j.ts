import { Router } from 'express';
import fetch from 'node-fetch';
import { pool } from '../db.js';
import { runCypher, getSession } from '../neo4j.js';

const router = Router();

// 同步对象类型到Neo4j（作为节点标签）
router.post('/sync/object-types', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [objectTypes]: any = await connection.execute(
      'SELECT * FROM object_types ORDER BY created_at'
    );
    connection.release();

    const session = getSession();
    let created = 0;
    let updated = 0;

    for (const ot of objectTypes) {
      // 获取属性
      const propConn = await pool.getConnection();
      const [properties]: any = await propConn.execute(
        'SELECT * FROM properties WHERE object_type_id = ?',
        [ot.id]
      );
      propConn.release();

      const propsData = (properties || []).map((p: any) => ({
        name: p.name,
        column: p.column_name,
        type: p.data_type,
      }));

      // 创建/更新ObjectType节点
      const cypher = `
        MERGE (ot:ObjectType {id: $id})
        SET ot.name = $name,
            ot.description = $description,
            ot.dataSource = $dataSource,
            ot.dbTable = $dbTable,
            ot.properties = $properties,
            ot.updatedAt = datetime()
        SET ot.createdAt = coalesce(ot.createdAt, datetime())
        RETURN ot
      `;

      await session.run(cypher, {
        id: ot.id,
        name: ot.name,
        description: ot.description || '',
        dataSource: ot.data_source || '',
        dbTable: ot.db_table || '',
        properties: JSON.stringify(propsData),
      });
      created++;
    }

    await session.close();

    res.json({
      success: true,
      message: `同步完成: ${created} 个对象类型已同步到Neo4j`,
      stats: { created, updated }
    });
  } catch (error: any) {
    console.error('同步对象类型失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 同步链接类型到Neo4j（作为关系）
router.post('/sync/link-types', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [linkTypes]: any = await connection.execute(
      'SELECT * FROM link_types ORDER BY created_at'
    );
    connection.release();

    const session = getSession();
    let created = 0;

    for (const lt of linkTypes) {
      const cypher = `
        MERGE (linkType:LinkType {id: $id})
        SET linkType.name = $name,
            linkType.description = $description,
            linkType.sourceColumn = $sourceColumn,
            linkType.targetColumn = $targetColumn,
            linkType.cardinality = $cardinality,
            linkType.updatedAt = datetime()
        SET linkType.createdAt = coalesce(linkType.createdAt, datetime())
        
        // 确保源和目标ObjectType存在
        MATCH (source:ObjectType {id: $sourceObjectId})
        MATCH (target:ObjectType {id: $targetObjectId})
        
        // 创建关系
        MERGE (source)-[r:LINKS_TO {linkTypeId: $id}]->(target)
        SET r.name = $name,
            r.cardinality = $cardinality
        
        RETURN linkType
      `;

      await session.run(cypher, {
        id: lt.id,
        name: lt.name,
        description: lt.description || '',
        sourceColumn: lt.source_column || '',
        targetColumn: lt.target_column || '',
        cardinality: lt.cardinality || 'N:M',
        sourceObjectId: lt.source_object_id,
        targetObjectId: lt.target_object_id,
      });
      created++;
    }

    await session.close();

    res.json({
      success: true,
      message: `同步完成: ${created} 个链接类型已同步到Neo4j`,
      stats: { created }
    });
  } catch (error: any) {
    console.error('同步链接类型失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 同步实例数据到Neo4j
router.post('/sync/instances/:objectTypeId', async (req, res) => {
  const { objectTypeId } = req.params;
  
  try {
    // 获取对象类型信息
    const connection = await pool.getConnection();
    const [otRows]: any = await connection.execute(
      'SELECT * FROM object_types WHERE id = ?',
      [objectTypeId]
    );
    
    if (otRows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: '对象类型不存在' });
    }
    
    const objectType = otRows[0];
    const tableName = objectType.db_table || objectType.id; // 使用db_table或id作为表名
    
    if (!tableName) {
      connection.release();
      return res.status(400).json({ success: false, error: '该对象类型未配置数据表' });
    }

    // 获取属性映射
    const [properties]: any = await connection.execute(
      'SELECT * FROM properties WHERE object_type_id = ?',
      [objectTypeId]
    );
    connection.release();

    // 查询实例数据
    const dataConn = await pool.getConnection();
    const [instances]: any = await dataConn.execute(`SELECT * FROM \`${tableName}\` LIMIT 1000`);
    dataConn.release();

    const session = getSession();
    let created = 0;

    // 获取主键列名
    const pkProp = properties.find((p: any) => p.is_primary_key);
    const pkColumn = pkProp?.column_name || 'id';

    for (const instance of instances) {
      const nodeId = String(instance[pkColumn]);
      
      // 构建属性对象
      const nodeProps: Record<string, any> = {
        id: nodeId,
        _objectTypeId: objectTypeId,
      };
      
      for (const prop of properties) {
        const colName = prop.column_name;
        if (instance[colName] !== undefined) {
          nodeProps[prop.name] = instance[colName];
        }
      }

      const cypher = `
        MATCH (ot:ObjectType {id: $objectTypeId})
        MERGE (n:Instance {id: $nodeId, _objectTypeId: $objectTypeId})
        SET n += $props,
            n.updatedAt = datetime()
        SET n.createdAt = coalesce(n.createdAt, datetime())
        MERGE (ot)-[:HAS_INSTANCE]->(n)
        RETURN n
      `;

      await session.run(cypher, {
        objectTypeId,
        nodeId,
        props: nodeProps,
      });
      created++;
    }

    await session.close();

    res.json({
      success: true,
      message: `同步完成: ${created} 个实例已同步到Neo4j`,
      stats: { created }
    });
  } catch (error: any) {
    console.error('同步实例数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 同步链接实例数据
router.post('/sync/link-instances/:linkTypeId', async (req, res) => {
  const { linkTypeId } = req.params;
  
  try {
    // 获取链接类型信息
    const connection = await pool.getConnection();
    const [ltRows]: any = await connection.execute(
      'SELECT * FROM link_types WHERE id = ?',
      [linkTypeId]
    );
    
    if (ltRows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: '链接类型不存在' });
    }
    
    const linkType = ltRows[0];

    // 查询链接实例数据
    const [linkInstances]: any = await connection.execute(
      'SELECT * FROM link_instance_data WHERE link_type_id = ?',
      [linkTypeId]
    );
    connection.release();

    const session = getSession();
    let created = 0;

    for (const li of linkInstances) {
      const sourceId = String(li.source_instance_id);
      const targetId = String(li.target_instance_id);

      const cypher = `
        MATCH (source:Instance {id: $sourceId})
        MATCH (target:Instance {id: $targetId})
        MERGE (source)-[r:LINKS_TO {linkTypeId: $linkTypeId}]->(target)
        SET r.linkTypeName = $linkTypeName,
            r.sourceColumn = $sourceColumn,
            r.targetColumn = $targetColumn,
            r.updatedAt = datetime()
        RETURN r
      `;

      await session.run(cypher, {
        sourceId,
        targetId,
        linkTypeId,
        linkTypeName: linkType.name,
        sourceColumn: linkType.source_column,
        targetColumn: linkType.target_column,
      });
      created++;
    }

    await session.close();

    res.json({
      success: true,
      message: `同步完成: ${created} 个链接实例已同步到Neo4j`,
      stats: { created }
    });
  } catch (error: any) {
    console.error('同步链接实例失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 全量同步
router.post('/sync/all', async (req, res) => {
  try {
    const results = {
      objectTypes: 0,
      linkTypes: 0,
      instances: 0,
      linkInstances: 0,
    };

    // 1. 同步对象类型
    const otRes = await fetch('http://localhost:3001/api/neo4j/sync/object-types', { method: 'POST' });
    const otData = await otRes.json();
    results.objectTypes = otData.stats?.created || 0;

    // 2. 同步链接类型
    const ltRes = await fetch('http://localhost:3001/api/neo4j/sync/link-types', { method: 'POST' });
    const ltData = await ltRes.json();
    results.linkTypes = ltData.stats?.created || 0;

    // 3. 同步所有对象类型的实例
    const connection = await pool.getConnection();
    const [objectTypes]: any = await connection.execute('SELECT id FROM object_types');
    connection.release();

    for (const ot of objectTypes) {
      try {
        const instRes = await fetch(`http://localhost:3001/api/neo4j/sync/instances/${ot.id}`, { method: 'POST' });
        const instData = await instRes.json();
        results.instances += instData.stats?.created || 0;
      } catch (e) {
        console.error(`同步实例失败: ${ot.id}`, e);
      }
    }

    // 4. 同步所有链接实例
    const conn2 = await pool.getConnection();
    const [linkTypes]: any = await conn2.execute('SELECT id FROM link_types');
    conn2.release();

    for (const lt of linkTypes) {
      try {
        const liRes = await fetch(`http://localhost:3001/api/neo4j/sync/link-instances/${lt.id}`, { method: 'POST' });
        const liData = await liRes.json();
        results.linkInstances += liData.stats?.created || 0;
      } catch (e) {
        console.error(`同步链接实例失败: ${lt.id}`, e);
      }
    }

    res.json({
      success: true,
      message: '全量同步完成',
      results
    });
  } catch (error: any) {
    console.error('全量同步失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 查询图谱概览
router.get('/overview', async (req, res) => {
  try {
    const session = getSession();
    
    // 统计节点数量
    const nodeCount = await session.run('MATCH (n) RETURN count(n) as count');
    const instanceCount = await session.run('MATCH (n:Instance) RETURN count(n) as count');
    const objectTypeCount = await session.run('MATCH (n:ObjectType) RETURN count(n) as count');
    
    // 统计关系数量
    const relCount = await session.run('MATCH ()-[r]->() RETURN count(r) as count');
    const linksToCount = await session.run('MATCH ()-[r:LINKS_TO]->() RETURN count(r) as count');
    
    await session.close();

    res.json({
      success: true,
      data: {
        nodes: {
          total: nodeCount.records[0].get('count').toNumber(),
          instances: instanceCount.records[0].get('count').toNumber(),
          objectTypes: objectTypeCount.records[0].get('count').toNumber(),
        },
        relationships: {
          total: relCount.records[0].get('count').toNumber(),
          linksTo: linksToCount.records[0].get('count').toNumber(),
        }
      }
    });
  } catch (error: any) {
    console.error('查询概览失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 清空Neo4j数据
router.delete('/clear', async (req, res) => {
  try {
    const session = getSession();
    await session.run('MATCH (n) DETACH DELETE n');
    await session.close();

    res.json({ success: true, message: 'Neo4j数据已清空' });
  } catch (error: any) {
    console.error('清空数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

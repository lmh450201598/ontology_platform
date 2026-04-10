import neo4j from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 10000,
  }
);

export async function initNeo4j() {
  try {
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    console.log('✅ Neo4j connected successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Neo4j connection failed:', error.message);
    return false;
  }
}

export async function closeNeo4j() {
  await driver.close();
}

export function getSession() {
  return driver.session();
}

// 辅助函数：执行Cypher查询
export async function runCypher<T = any>(query: string, params: Record<string, any> = {}): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.run(query, params);
    return result.records.map(record => {
      const obj: Record<string, any> = {};
      record.keys.forEach(key => {
        obj[String(key)] = record.get(key);
      });
      return obj as T;
    });
  } finally {
    await session.close();
  }
}

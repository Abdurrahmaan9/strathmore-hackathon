import { Pool, PoolConfig } from 'pg';

// Database connection configuration
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'strathmore-hackathon',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Query error', { text, duration, error });
    throw error;
  }
}

// Helper function for transactions
export async function transaction(callback: (client: any) => Promise<any>): Promise<any> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const res = await query('SELECT NOW()');
    console.log('Database connected successfully:', res.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Export the pool for direct access if needed
export { pool };

// Database initialization function
export async function initializeDatabase(): Promise<void> {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema in a transaction
    await transaction(async (client) => {
      // Split schema by semicolons and execute each statement
      const statements = schema
        .split(';')
        .filter((stmt: string) => stmt.trim().length > 0)
        .map((stmt: string) => stmt.trim());
      
      for (const statement of statements) {
        if (statement) {
          await client.query(statement);
        }
      }
    });
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export default {
  query,
  transaction,
  testConnection,
  initializeDatabase,
  pool
};

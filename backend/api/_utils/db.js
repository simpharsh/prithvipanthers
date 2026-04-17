import mysql from 'mysql2/promise';

let pool;

export const getPool = () => {
  if (pool) return pool;

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };

  if (process.env.DB_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: false
    };
  }

  pool = mysql.createPool(config);
  return pool;
};

export const query = async (sql, params) => {
  const [rows] = await getPool().execute(sql, params);
  return rows;
};

export const transaction = async (callback) => {
  const connection = await getPool().getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

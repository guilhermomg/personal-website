import postgres from 'postgres';

const sql = postgres(import.meta.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,           // one connection per serverless invocation
  idle_timeout: 20,
  connect_timeout: 10,
});

export default sql;

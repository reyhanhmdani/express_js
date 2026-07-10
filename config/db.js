import pg from "pg";
const { Pool } = pg;

const db = new Pool({
  user: "postgres",
  host: "localhost",
  database: "express_1",
  password: "rahasia",
  port: 5432,
});

export default db;

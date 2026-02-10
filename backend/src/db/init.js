const bcrypt = require('bcryptjs');
const { pool } = require('./config');

async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        employee_name VARCHAR(255) NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        manager VARCHAR(255),
        last_working_day DATE,
        status VARCHAR(50) DEFAULT 'Chưa thực hiện',
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist_items (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        category VARCHAR(255) NOT NULL,
        task VARCHAR(500) NOT NULL,
        status VARCHAR(50) DEFAULT 'Chưa thực hiện',
        completed_at DATE,
        evidence_note TEXT,
        sort_order INTEGER DEFAULT 0
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        active BOOLEAN DEFAULT true,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_checklist_ticket ON checklist_items(ticket_id);');

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const { rows } = await client.query(
        'SELECT id FROM admin_users WHERE email = $1',
        [process.env.ADMIN_EMAIL]
      );
      if (rows.length === 0) {
        const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        await client.query(
          `INSERT INTO admin_users (email, name, role, active, password_hash)
           VALUES ($1, $2, 'admin', true, $3)`,
          [process.env.ADMIN_EMAIL, 'Admin', passwordHash]
        );
      }
    }
    console.log('Database tables created.');
  } finally {
    client.release();
    await pool.end();
  }
}

init().catch((err) => {
  console.error('Init failed:', err);
  process.exit(1);
});


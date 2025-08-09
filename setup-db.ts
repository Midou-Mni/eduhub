import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const setupDatabase = async () => {
  // First connect to postgres database to create eduhub database
  const adminPool = new Pool({
    connectionString: 'postgresql://postgres:1234@localhost:5432/postgres'
  });

  try {
    console.log('🔄 Creating database...');
    
    // Create the database if it doesn't exist
    await adminPool.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = 'eduhub' AND pid <> pg_backend_pid();
    `).catch(() => {}); // Ignore errors if database doesn't exist
    
    await adminPool.query('DROP DATABASE IF EXISTS eduhub;').catch(() => {});
    await adminPool.query('CREATE DATABASE eduhub;');
    
    console.log('✅ Database created successfully!');
    
  } catch (error) {
    console.error('❌ Database creation failed:', error);
    process.exit(1);
  } finally {
    await adminPool.end();
  }

  // Now connect to the eduhub database to set up tables
  const pool = new Pool({
    connectionString: 'postgresql://postgres:1234@localhost:5432/eduhub'
  });

  try {
    console.log('🔄 Setting up database tables...');
    
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'setup_database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('Demo accounts will be created on first login:');
    console.log('- Admin: admin@example.com / admin123');
    console.log('- Teacher: teacher@example.com / teacher123');
    console.log('- Student: student@example.com / student123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

setupDatabase();

import mysql from 'mysql2/promise';

async function setupCloudDatabase() {
  console.log('🚀 Connecting directly to Aiven Cloud MySQL Engine...');
  
  // Clean configuration parameters directly mapped to your Aiven details
    const connection = await mysql.createConnection({
    host: 'mysql-3465e76f-tmeklit09-e3ab.j.aivencloud.com', // <-- Fixed full server hostname
    port: 28015,
    user: 'avnadmin',
    password: 'AVNS_r5Mb3wnmk7upj2NjLaJ', 
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });


  console.log('✅ Secure Connection Established. Building tables manually...');

  // Create Systems
  await connection.query(`
    CREATE TABLE IF NOT EXISTS systems (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      api_key VARCHAR(255) UNIQUE NOT NULL,
      allowed_origin VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Create Users
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'triager') DEFAULT 'triager'
    ) ENGINE=InnoDB;
  `);

  // Create Tickets
  await connection.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      system_id INT NOT NULL,
      type ENUM('bug', 'feature_request') NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('new', 'triaged', 'in_progress', 'blocked', 'done', 'wont_fix', 'duplicate') DEFAULT 'new',
      priority ENUM('low', 'medium', 'high', 'critical') NULL,
      severity ENUM('minor', 'major', 'critical') NULL,
      reporter_name VARCHAR(255) NULL,
      reporter_email VARCHAR(255) NULL,
      reporter_role VARCHAR(255) NULL,
      page_url VARCHAR(2048) NOT NULL,
      browser_info VARCHAR(512) NOT NULL,
      assigned_to INT NULL,
      duplicate_of INT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB;
  `);

  // Create Comments
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ticket_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticket_id INT NOT NULL,
      author_id INT NULL,
      body TEXT NOT NULL,
      is_internal BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // Create Attachments
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ticket_attachments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticket_id INT NOT NULL,
      file_path VARCHAR(512) NOT NULL,
      file_type VARCHAR(100) NOT NULL,
      source ENUM('upload', 'captured_screenshot') NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  console.log('✅ All relational schema tables generated inside Aiven cloud instance successfully!');

  // Seed baseline entries
  console.log('🌱 Injecting default applications and triage staff profiles...');
  
  await connection.query(`
    INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES 
    (1, 'Executive Admin', 'admin@internal.tickets', '$2a$12$Z0mUomV3Bw1T91W2X3Y4Z.eO1vV2w3x4y5z6a7b8c9d0e1f2g3h4i', 'admin');
  `);

  await connection.query(`
    INSERT IGNORE INTO systems (id, name, api_key, allowed_origin) VALUES 
    (1, 'ERP Internal Core Portal', 'wgt_k_erp_prod_7719ab22cd884019e055f2', 'https://internal-company.com'),
    (2, 'Customer Support Dashboard', 'wgt_k_cs_prod_3110de55fa9911e3b284aa', 'https://internal-company.com');
  `);

  console.log('🎉 Seeding Complete! Cloud database is 100% ready for online deployment.');
  await connection.end();
}

setupCloudDatabase().catch(err => console.error('❌ Direct setup runtime failed:', err));

import db from './src/lib/db.js';

async function check() {
  try {
    const [rows] = await db.query('DESCRIBE design_requests');
    console.log("design_requests:", rows.map(r => r.Field));
    
    const [rows2] = await db.query('DESCRIBE customized_designs');
    console.log("customized_designs:", rows2.map(r => r.Field));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();

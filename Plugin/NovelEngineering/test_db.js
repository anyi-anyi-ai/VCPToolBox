const db = require('better-sqlite3')('data/novel_index.db');
console.log('=== ENTITIES ===');
console.log(JSON.stringify(db.prepare("SELECT id, entity_id, entity_type, canonical_name, status FROM entities WHERE canonical_name LIKE '%灰港%' OR entity_id LIKE '%灰港%' LIMIT 5").all(), null, 2));
console.log('=== SOURCE FILES ===');
console.log(JSON.stringify(db.prepare("SELECT id, relative_path, status, source_category FROM source_files WHERE relative_path LIKE '%灰港%' LIMIT 3").all(), null, 2));

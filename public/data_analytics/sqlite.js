// sqlite.js: SQL.js initialization and database setup
import { schemas, tableConstraints, viewDefinitions } from './tableViews.js';

function initSQLite(callback) {
  initSqlJs({
    locateFile: file =>
      'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/' + file
  }).then(SQLLib => {
    window.SQL = SQLLib;

    // Load or create persistent database
    let db;
    const storedDb = localStorage.getItem('sqlJsDb');
    if (storedDb) {
      try {
        const u8 = Uint8Array.from(atob(storedDb), c => c.charCodeAt(0));
        db = new SQLLib.Database(u8);
        console.log('Loaded database from storage');
      } catch (e) {
        console.error('Error loading DB, creating new one', e);
        db = new SQLLib.Database();
      }
    } else {
      db = new SQLLib.Database();
    }
    // Build expected column lists including primary-key position
    const expectedSchemas = Object.fromEntries(
      Object.entries(schemas).map(([tbl, cols]) => {
        // derive pk columns order from tableConstraints
        const pkCols = tableConstraints[tbl]
          ? tableConstraints[tbl].replace(/^PRIMARY KEY\s*\(\s*|\s*\)$/g, '').split(/\s*,\s*/)
          : [];
        const colArray = Object.entries(cols).map(([c, t]) => [c, t, pkCols.indexOf(c) + 1]);
        return [tbl, colArray];
      })
    );
    // Build CREATE statements including any table constraints
    const createStmts = Object.fromEntries(
      Object.entries(schemas).map(([tbl, cols]) => {
        const colDefs = Object.entries(cols).map(([c, t]) => `  ${c} ${t}`);
        const constraints = tableConstraints[tbl] ? [`  ${tableConstraints[tbl]}`] : [];
        return [tbl,
          `CREATE TABLE IF NOT EXISTS ${tbl} (\n` +
          [...colDefs, ...constraints].join(',\n') +
          `\n);`
        ];
      })
    );

    // Synchronize schemas and recreate if mismatched
    Object.entries(expectedSchemas).forEach(([name, cols]) => {
      const res = db.exec(`PRAGMA table_info(${name});`);
      let match = false;
      if (res.length) {
        // actual entries as [name, type, pkIndex]
        const actual = res[0].values.map(row => [row[1], row[2], row[5]]);
        console.log('Expected:', cols, 'Actual:', actual);
        match = JSON.stringify(actual) === JSON.stringify(cols);
      }
      if (!match) {
        db.run(`DROP TABLE IF EXISTS ${name};`);
        db.run(createStmts[name]);
        console.log(`Table ${name} replaced because schema changed.`);
        // Notify user in HTML
        const note = document.getElementById('notification');
        if (note) note.innerText = `DATA DELETED: Table ${name} was replaced due to schema change.`;
      }
    });
    // Save function to persist DB to localStorage
    const saveDb = () => {
      const data = db.export();
      const b64 = btoa(String.fromCharCode.apply(null, data));
      localStorage.setItem('sqlJsDb', b64);
      console.log('Database persisted');
    };
    window.db = db;
    window.saveDb = saveDb;

    // Create or recreate views if definition has changed
    // Recreate all views unconditionally
    viewDefinitions.forEach(v => {
      db.run(`DROP VIEW IF EXISTS ${v.name};`);
      db.run(v.create);
    });

    // Initial persistence
    saveDb();

    callback();
  });
}

export { initSQLite };
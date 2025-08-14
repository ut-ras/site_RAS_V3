// Catch any JS errors (e.g., module load/import issues) and display in HTML
window.addEventListener('error', event => {
  showSqlError('JS Error: ' + event.message);
});
window.addEventListener('unhandledrejection', event => {
  showSqlError('Unhandled Promise Rejection: ' + (event.reason && event.reason.message ? event.reason.message : event.reason));
});

// script.js: Application bootstrap
import { tableViews } from './tableViews.js';
import { initSQLite } from './sqlite.js';
import { initApp } from './google.js';
import { initHCB } from './hcb.js';

window.onload = function() {
  initSQLite(function() {
    initApp();
    initHCB();
    renderTableViewControls();
  });
};

function showSqlError(msg) {
  let errDiv = document.getElementById('sql-error');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.id = 'sql-error';
    errDiv.style.color = 'red';
    errDiv.style.fontWeight = 'bold';
    errDiv.style.margin = '1em 0';
    const target = document.getElementById('tableview-controls');
    if (target && target.parentNode) {
      target.parentNode.insertBefore(errDiv, target);
    } else {
      document.body.appendChild(errDiv);
    }
  }
  errDiv.textContent = msg;
}

function clearSqlError() {
  const errDiv = document.getElementById('sql-error');
  if (errDiv) errDiv.textContent = '';
}

function runQuery(sql) {
  try {
    clearSqlError();
    return db.exec(sql);
  } catch (e) {
    console.error(e);
    showSqlError('SQL Error: ' + e.message);
    return null;
  }
}

// Expose runQuery globally
window.runQuery = runQuery;

function renderTableViewControls() {
  const container = document.getElementById('tableview-controls') || createTableViewControlsContainer();
  container.innerHTML = '';
  tableViews.forEach(view => {
    const label = document.createElement('label');
    label.style.marginRight = '1em';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = false;
    cb.dataset.view = view.name;
    cb.onchange = () => {
      console.log("clicked label ", cb.checked);
      if (cb.checked) renderTableView(view);
      else removeTableView(view);
    };
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + view.label));
    container.appendChild(label);
    // Render only if checked
    if (cb.checked) renderTableView(view);
  });
}

function createTableViewControlsContainer() {
  const container = document.createElement('div');
  container.id = 'tableview-controls';
  document.body.insertBefore(container, document.getElementById('table-container'));
  return container;
}

function renderTableView(view) {
  console.log("running query", view.query)
  const res = runQuery(view.query);
  let html = '';
  if (res && res.length) {
    console.log("got n rows ", res[0].values.length )
    html += `<h3>${view.label}</h3><table id="tableview-${view.name}">`;
    html += '<tr>' + res[0].columns.map(h => `<th>${h}</th>`).join('') + '</tr>';
    const goodColIdx = res[0].columns.findIndex(c => c.toLowerCase() === 'good');
    res[0].values.forEach(row => {
      html += '<tr>' + row.map((v, i) => {
        if (i === goodColIdx) {
          if (v) {
            return `<td style="background:#c6f7d0;">${v}</td>`; // green
          } else {
            return `<td style="background:#ffd6d6;">${v}</td>`; // red
          }
        }
        return `<td>${v||''}</td>`;
      }).join('') + '</tr>';
    });
    html += '</table>';
  } else {
    console.log("no response :(");
  }
  // Insert or update table
  let tableDiv = document.getElementById('tableview-table-' + view.name);
  if (!tableDiv) {
    tableDiv = document.createElement('div');
    tableDiv.id = 'tableview-table-' + view.name;
    document.getElementById('table-container').appendChild(tableDiv);
  }
  tableDiv.innerHTML = html;
}

function removeTableView(view) {
  const tableDiv = document.getElementById('tableview-table-' + view.name);
  if (tableDiv) tableDiv.remove();
}
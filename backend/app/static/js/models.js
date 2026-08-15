/* ============================================================
   Model comparison page
   ============================================================ */
'use strict';

const METRIC_LABELS = { accuracy: 'Accuracy', precision: 'Precision', recall: 'Recall', f1_score: 'F1 Score', auc: 'AUC-ROC', cv_score: 'CV Score' };
const METRICS = ['accuracy', 'precision', 'recall', 'f1_score', 'auc', 'cv_score'];

let cmpCharts = [];
let cmpData = null;

function destroyCmpCharts() {
  (cmpCharts || []).forEach(c => { try { c.destroy(); } catch (_) {} });
  cmpCharts = [];
}

async function loadComparison() {
  try {
    const [cmp, fi] = await Promise.all([
      api('/api/model-comparison'),
      api('/api/feature-importance'),
    ]);
    cmpData = cmp;
    render(cmp, fi.feature_importance);
  } catch (e) {
    qs('cmpLoading').classList.add('hidden');
    const err = qs('cmpError');
    err.classList.remove('hidden');
    err.innerHTML = '<div class="alert alert-red">Could not load model comparison. Make sure the backend is running.</div>';
  }
}

function render(cmp, fi) {
  qs('cmpLoading').classList.add('hidden');
  const box = qs('cmp');
  box.classList.remove('hidden');
  destroyCmpCharts();

  const info = cmp.dataset_info;
  const best = cmp.models.find(m => m.model === cmp.best_model);
  const selectedModel = cmp.best_model;

  const statCards = [
    { label: 'Total Samples', value: info.total_samples },
    { label: 'Train Samples', value: info.train_samples },
    { label: 'Test Samples', value: info.test_samples },
    { label: 'Features Used', value: info.features },
  ].map(s => `
    <div class="stat-card center">
      <div class="v" style="color:var(--brand);font-size:1.5rem">${s.value}</div>
      <div class="k" style="text-transform:none;letter-spacing:.02em">${s.label}</div>
    </div>`).join('');

  const rows = cmp.models.map(m => `
    <tr class="row-click" data-model="${esc(m.model)}">
      <td>
        <div class="flex items-center gap-2">
          <span class="dot" style="background:${MODEL_COLORS[m.model] || '#33a4fc'}"></span>
          <span style="font-weight:600">${esc(m.model)}</span>
          ${m.model === cmp.best_model ? '<span class="badge badge-green">Best</span>' : ''}
        </div>
      </td>
      ${METRICS.map(k => {
        const bestVal = cmp.models.reduce((acc, o) => Math.max(acc, o[k]), -1);
        const isBest = m[k] >= bestVal;
        return `<td class="center mono ${isBest ? '' : ''}" style="${isBest ? 'color:var(--green);font-weight:700' : ''}">${fmt(m[k], 2)}%</td>`;
      }).join('')}
    </tr>`).join('');

  const metricBars = METRICS.map(k => ({
    label: METRIC_LABELS[k],
    ...Object.fromEntries(cmp.models.map(m => [m.model, m[k]])),
  }));

  const radarData = METRICS.map(k => ({
    metric: METRIC_LABELS[k],
    ...Object.fromEntries(cmp.models.map(m => [m.model, m[k]])),
  }));

  const fiBars = fi.slice().reverse().map(f => ({ name: f.feature, value: Math.round(f.importance * 100) }));

  box.innerHTML = `
    <div class="grid grid-4 mb-4">${statCards}</div>

    <div class="glass card-tight flex items-center gap-4 mb-4" style="background:linear-gradient(90deg, rgba(16,185,129,.1), transparent);border-color:rgba(16,185,129,.3)">
      <div class="flex-center" style="width:44px;height:44px;border-radius:12px;background:rgba(16,185,129,.15);color:var(--green);flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4m-6-8.5a6 6 0 1 1 12 0c0 2-1 3-2 4.5H8c-1-1.5-2-2.5-2-4.5Z"/></svg>
      </div>
      <div>
        <div class="title" style="color:var(--green)">Best Model: ${esc(cmp.best_model)}</div>
        <div class="small muted">Achieved highest accuracy of <strong style="color:#fff">${fmt(best.accuracy, 2)}%</strong> with AUC-ROC of <strong style="color:#fff">${fmt(best.auc, 2)}%</strong> on the test set.</div>
      </div>
    </div>

    <div class="glass card mb-4 table-wrap">
      <div class="upcase muted mb-4" style="letter-spacing:.12em">Performance Metrics Table</div>
      <table class="data">
        <thead><tr><th>Model</th>${METRICS.map(m => `<th class="center">${METRIC_LABELS[m]}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="tiny faint mt-3">Click a row to view its confusion matrix below. Green values = best in column.</p>
    </div>

    <div class="grid" style="grid-template-columns:1fr 1fr;gap:20px">
      <div class="glass card">
        <div class="upcase muted mb-4" style="letter-spacing:.12em">Metrics Comparison — Bar Chart</div>
        <div style="height:320px"><canvas id="cmpBar"></canvas></div>
      </div>
      <div class="glass card">
        <div class="upcase muted mb-4" style="letter-spacing:.12em">Model Performance — Radar Overlay</div>
        <div style="height:320px"><canvas id="cmpRadar"></canvas></div>
      </div>
    </div>

    <div class="glass card mt-4">
      <div class="upcase muted mb-4" style="letter-spacing:.12em">Feature Importance — Random Forest (%)</div>
      <div style="height:300px"><canvas id="cmpFi"></canvas></div>
    </div>

    <div class="glass card mt-4">
      <div class="flex-between mb-4 flex-wrap">
        <div class="upcase muted" style="letter-spacing:.12em">All Confusion Matrices</div>
        <span class="tiny faint">Predicted: Weak | Strong · Actual rows</span>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:18px" id="cmGrid"></div>
    </div>`;

  // Confusion matrices
  const cmGrid = qs('cmGrid');
  cmGrid.innerHTML = cmp.models.map(m => `
    <div>
      <div class="upcase muted mb-3" style="letter-spacing:.12em">${esc(m.model)}</div>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px">
        ${cmCell(m, 'green', 0, 0, 'True Negative', 'Correctly predicted Weak')}
        ${cmCell(m, 'red', 0, 1, 'False Positive', 'Predicted Strong, actually Weak')}
        ${cmCell(m, 'amber', 1, 0, 'False Negative', 'Predicted Weak, actually Strong')}
        ${cmCell(m, 'blue', 1, 1, 'True Positive', 'Correctly predicted Strong')}
      </div>
    </div>`).join('');

  // Charts
  const barLabels = metricBars.map(x => x.label);
  const barDatasets = cmp.models.map(m => ({
    label: m.model,
    data: metricBars.map(x => x[m.model]),
    backgroundColor: MODEL_COLORS[m.model] || '#33a4fc',
    borderRadius: 4,
  }));
  cmpCharts.push(buildBarChart('cmpBar', barLabels, barDatasets, { yMin: 60, yMax: 100 }));

  const radCanvas = qs('cmpRadar');
  if (radCanvas) {
    cmpCharts.push(new Chart(radCanvas, {
      type: 'radar',
      data: {
        labels: radarData.map(d => d.metric),
        datasets: cmp.models.map(m => ({
          label: m.model,
          data: radarData.map(d => d[m.model]),
          backgroundColor: (MODEL_COLORS[m.model] || '#33a4fc') + '14',
          borderColor: MODEL_COLORS[m.model] || '#33a4fc',
          borderWidth: 2,
          pointRadius: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { min: 60, max: 100, ticks: { stepSize: 10, color: '#475569', backdropColor: 'transparent' }, grid: { color: '#1e2d4a' }, angleLines: { color: '#1e2d4a' }, pointLabels: { color: '#94a3b8', font: { size: 9 } } } },
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 9 } } }, tooltip: { callbacks: { label: c => c.dataset.label + ': ' + c.formattedValue + '%' }, backgroundColor: '#0f1629', borderColor: '#1e2d4a', borderWidth: 1 } },
      },
    }));
  }

  const fiCanvas = qs('cmpFi');
  if (fiCanvas) {
    cmpCharts.push(new Chart(fiCanvas, {
      type: 'bar',
      data: {
        labels: fiBars.map(f => f.name),
        datasets: [{ label: 'Importance %', data: fiBars.map(f => f.value), backgroundColor: '#a855f7', borderRadius: 5 }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: '#1e2d4a' } },
          y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.formattedValue + '%' }, backgroundColor: '#0f1629', borderColor: '#1e2d4a', borderWidth: 1 } },
      },
    }));
  }

  // Row-click highlights
  const trs = box.querySelectorAll('tr.row-click');
  trs.forEach(tr => tr.addEventListener('click', () => {
    trs.forEach(t => t.classList.remove('row-selected'));
    tr.classList.add('row-selected');
    window.dispatchEvent(new CustomEvent('cmp-select', { detail: tr.dataset.model }));
  }));

  // Highlight best row by default
  const bestRow = box.querySelector(`tr[data-model="${CSS.escape(cmp.best_model)}"]`);
  if (bestRow) bestRow.classList.add('row-selected');
}

function cmCell(m, kind, r, c, label, desc) {
  const [[tn, fp], [fn, tp]] = m.confusion_matrix;
  const val = r === 0 ? (c === 0 ? tn : fp) : (c === 0 ? fn : tp);
  const total = tn + fp + fn + tp;
  const colorMap = { green: 'var(--green)', red: 'var(--red)', amber: 'var(--amber)', blue: 'var(--brand)' };
  return `
    <div class="cm-cell ${kind}">
      <div class="n" style="color:${colorMap[kind]}">${val}</div>
      <div class="t" style="color:${colorMap[kind]}">${label}</div>
      <div class="d">${desc}</div>
      <div class="p">${fmt(val / total * 100, 1)}%</div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', loadComparison);

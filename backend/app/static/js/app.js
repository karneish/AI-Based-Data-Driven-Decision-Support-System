/* ============================================================
   DSS-MIP — shared helpers
   ============================================================ */
'use strict';

const MODEL_COLORS = {
  'Logistic Regression': '#33a4fc',
  'Decision Tree':       '#a855f7',
  'Random Forest':       '#10b981',
  'K-Nearest Neighbors': '#f59e0b',
  'Gradient Boosting':   '#f472b6',
};

const RISK_COLORS = {
  green:  '#10b981',
  amber:  '#f59e0b',
  red:    '#ef4444',
};

if (window.Chart) {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = '#1e2d4a';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 11;
}

/* ---- tiny helpers ---- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function qs(id) { return document.getElementById(id); }

async function api(path, body) {
  const opts = { headers: { 'Content-Type': 'application/json' } };
  if (body) opts.method = 'POST', opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) {
    let detail = 'Request failed';
    try { detail = (await res.json()).detail || detail; } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

function fmt(v, d = 1) { return Number(v).toFixed(d); }

/* ---- chart tooltip styling ---- */
function darkTooltip(context) {
  const { label, formattedValue, dataset } = context;
  const color = (dataset && dataset.backgroundColor) || '#33a4fc';
  const hex = typeof color === 'string' ? color : '#33a4fc';
  return `
    <div style="background:#0f1629;border:1px solid #1e2d4a;border-radius:10px;padding:8px 12px;font-family:'DM Sans',sans-serif">
      <div style="color:#94a3b8;font-size:11px;margin-bottom:2px">${esc(label || '')}</div>
      <div style="color:#e2e8f0;font-weight:700;font-size:13px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${hex};margin-right:6px"></span>
        ${esc(formattedValue || '')}
      </div>
    </div>`;
}

/* ---- reusable chart builders ---- */
function buildRadarChart(canvasId, entries, color = '#33a4fc', label = 'Student') {
  const ctx = qs(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: entries.map(e => e.subject),
      datasets: [{
        label,
        data: entries.map(e => e.value),
        backgroundColor: color + '22',
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointRadius: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 25, color: '#475569', backdropColor: 'transparent' }, grid: { color: '#1e2d4a' }, angleLines: { color: '#1e2d4a' }, pointLabels: { color: '#94a3b8', font: { size: 10 } } } },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f1629', borderColor: '#1e2d4a', borderWidth: 1, titleColor: '#94a3b8', bodyColor: '#e2e8f0' } },
    },
  });
}

function buildBarChart(canvasId, labels, datasets, opts = {}) {
  const ctx = qs(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        y: opts.yMin != null ? { min: opts.yMin, max: opts.yMax || 100, ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: '#1e2d4a' } } : { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: '#1e2d4a' } },
      },
      plugins: {
        legend: opts.legend === false ? { display: false } : { labels: { color: '#94a3b8', font: { size: 10 } } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.formattedValue}%` }, backgroundColor: '#0f1629', borderColor: '#1e2d4a', borderWidth: 1 },
      },
    },
  });
}

function buildModelProbsBar(canvasId, models, threshold) {
  const ctx = qs(canvasId);
  if (!ctx) return;
  const labels = models.map(m => m.model);
  const data = models.map(m => m.probability);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Probability %',
        data,
        backgroundColor: models.map(m => MODEL_COLORS[m.model] || '#33a4fc'),
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { min: 0, max: 100, ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: '#1e2d4a' } },
        y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.formattedValue}%` }, backgroundColor: '#0f1629', borderColor: '#1e2d4a', borderWidth: 1 },
      },
    },
  });
}

/* ---- risk helpers ---- */
function riskTone(colorKey) {
  return { green: { text: 'var(--green)', soft: 'rgba(16,185,129,.12)' }, amber: { text: 'var(--amber)', soft: 'rgba(245,158,11,.12)' }, red: { text: 'var(--red)', soft: 'rgba(239,68,68,.12)' } }[colorKey] || { text: 'var(--muted)', soft: 'rgba(148,163,184,.12)' };
}

function riskMessage(cat) {
  if (cat === 'Stable') return 'Student is academically stable. Continue current practices.';
  if (cat === 'Monitor Closely') return 'Moderate risk indicators. Increased monitoring recommended.';
  return 'Immediate academic intervention is strongly recommended.';
}

/* ---- printable report (opens new window + print) ---- */
function printReport(r) {
  const rows = r.bar_data.map(b => `
    <tr>
      <td>${esc(b.label)}</td>
      <td><strong>${fmt(b.score)}%</strong></td>
      <td>${fmt(b.benchmark)}%</td>
      <td>${b.score >= b.benchmark ? 'Above benchmark' : 'Below benchmark'}</td>
    </tr>`).join('');
  const recs = r.recommendations.map((x, i) => `
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:8px">
      <strong>#${i + 1} ${esc(x.action)}</strong>
      <span style="font-size:10px;padding:2px 8px;border-radius:20px;margin-left:8px;background:${x.impact === 'High' ? '#fef2f2' : x.impact === 'Medium' ? '#fffbeb' : '#f0fdf4'};color:${x.impact === 'High' ? '#dc2626' : x.impact === 'Medium' ? '#d97706' : '#16a34a'}">${x.impact} Impact</span>
      ${x.probability_gain > 0 ? `<span style="font-size:10px;padding:2px 8px;border-radius:20px;margin-left:8px;background:#e0f2fe;color:#0369a1">+${fmt(x.probability_gain)} pts predicted</span>` : ''}
      <div style="color:#666;font-size:12px;margin-top:6px">${esc(x.detail)}</div>
    </div>`).join('');
  const probs = r.all_model_probs.map(m => `<tr><td>${esc(m.model)}</td><td>${fmt(m.probability)}%</td></tr>`).join('');
  const fi = r.feature_importance.map(f => `<tr><td>${esc(f.feature)}</td><td>${fmt(f.importance * 100, 1)}%</td></tr>`).join('');
  const topFi = r.feature_importance.slice(0, 3).map(f => f.feature).join(', ');

  const html = `<!DOCTYPE html>
<html><head><title>DSS-MIP Report — ${esc(r.predicted_class)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #111; padding: 40px; }
  h1 { font-size: 24px; color: #1b85f1; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 30px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
  .card .val { font-size: 24px; font-weight: 800; color: #1b85f1; }
  .card .lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  .section { margin-bottom: 24px; }
  .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 12px; }
  .risk { padding: 16px; border-radius: 12px; border: 2px solid; margin-bottom: 24px; }
  .risk.green { border-color: #10b981; background: #f0fdf4; color: #065f46; }
  .risk.amber { border-color: #f59e0b; background: #fffbeb; color: #78350f; }
  .risk.red { border-color: #ef4444; background: #fef2f2; color: #7f1d1d; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f1f5f9; padding: 10px 12px; text-align: left; }
  td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
  .footer { margin-top: 40px; text-align: center; color: #aaa; font-size: 11px; }
</style></head><body>
  <h1>DSS-MIP — Academic Analysis Report</h1>
  <div class="subtitle">AI-Based Data-Driven Decision Support System · Generated on ${new Date().toLocaleString()}</div>
  <div class="grid">
    <div class="card"><div class="val">${fmt(r.ensemble_probability)}%</div><div class="lbl">Ensemble Probability</div></div>
    <div class="card"><div class="val">${fmt(r.ml_probability)}%</div><div class="lbl">ML Probability (${esc(r.selected_model)})</div></div>
    <div class="card"><div class="val">${fmt(r.confidence)}%</div><div class="lbl">Model Confidence</div></div>
    <div class="card"><div class="val">${fmt(r.asi)}%</div><div class="lbl">ASI Score</div></div>
  </div>
  <div class="grid">
    <div class="card"><div class="val">${esc(r.risk_category)}</div><div class="lbl">Risk Level</div></div>
    <div class="card"><div class="val">${esc(r.predicted_class)}</div><div class="lbl">Classification</div></div>
    <div class="card"><div class="val">${fmt(r.class_threshold)}%</div><div class="lbl">AI Class Threshold</div></div>
    <div class="card"><div class="val">${r.all_model_probs.length}</div><div class="lbl">Models in Ensemble</div></div>
  </div>
  <div class="risk ${r.risk_color}">
    <strong style="font-size:18px">${esc(r.risk_category)}</strong><br/>
    <span style="font-size:13px">ASI Score: ${fmt(r.asi)}% · Model: ${esc(r.selected_model)}</span>
  </div>
  <div class="section"><h2>Dimensional Scores</h2>
    <table><tr><th>Dimension</th><th>Student Score</th><th>Benchmark</th><th>Status</th></tr>${rows}</table>
  </div>
  <div class="section"><h2>Feature Importance (Random Forest)</h2>
    <table><tr><th>Feature</th><th>Importance Score</th></tr>${fi}</table>
  </div>
  <div class="section"><h2>Model Probability Comparison</h2>
    <table><tr><th>Model</th><th>Probability</th></tr>${probs}</table>
  </div>
  <div class="section"><h2>Intervention Recommendations</h2>${recs}</div>
  <div class="section"><h2>Detailed Report</h2>
    <p style="line-height:1.7;color:#333;font-size:13px">
      The AI-Based Decision Support System completed a comprehensive analysis using a trained ${esc(r.selected_model)} model.
      The ML prediction probability is <strong>${fmt(r.ml_probability)}%</strong>, classifying this student as a <strong>${esc(r.predicted_class)}</strong>.
      The Academic Stability Index (ASI) is <strong>${fmt(r.asi)}%</strong>, placing the student in the <strong>${esc(r.risk_category)}</strong> category.
      The top influencing factors were: ${esc(topFi)}.
      ${r.recommendations.length} intervention recommendation(s) have been generated.
    </p>
  </div>
  <div class="footer">DSS-MIP · AI-Based Data-Driven Decision Support System · Mini Project</div>
</body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}

/* ---- shared risk banner / gauge renderers ---- */
function riskBannerHTML(r) {
  const tone = riskTone(r.risk_color);
  return `
    <div class="glass card-tight flex items-center gap-3" style="border-color:${tone.soft};background:linear-gradient(90deg, ${tone.soft}, transparent)">
      <div style="width:10px;height:10px;border-radius:50%;background:${RISK_COLORS[r.risk_color]};box-shadow:0 0 12px ${RISK_COLORS[r.risk_color]}"></div>
      <div>
        <div class="title" style="color:${tone.text}">${esc(r.risk_category)}</div>
        <div class="small" style="color:var(--muted)">${riskMessage(r.risk_category)}</div>
      </div>
      <div style="margin-left:auto;text-align:right" class="hidden-mobile">
        <div class="mono title" style="color:${tone.text}">${fmt(r.asi)}%</div>
        <div class="tiny faint">ASI Score</div>
      </div>
    </div>`;
}

function gaugeHTML(r) {
  const bands = r.risk_thresholds || { monitor: 0.37, stable: 0.53 };
  const monW = bands.monitor * 100;
  const staW = (bands.stable - bands.monitor) * 100;
  const stbW = 100 - bands.stable * 100;
  const color = RISK_COLORS[r.risk_color];
  return `
    <div class="gauge">
      <div class="zone" style="width:${monW}%;background:rgba(239,68,68,.22)"></div>
      <div class="zone" style="width:${staW}%;background:rgba(245,158,11,.22)"></div>
      <div class="zone" style="width:${stbW}%;background:rgba(16,185,129,.22)"></div>
      <div class="fill" style="width:${r.asi}%;background:${color};box-shadow:0 0 14px ${color}66"></div>
    </div>
    <div class="gauge-scale">
      <span>0 — Intervention</span>
      <span>${Math.round(monW)}% — Monitor</span>
      <span>${Math.round(bands.stable * 100)}% — Stable — 100</span>
    </div>`;
}

function modelBarsHTML(r) {
  return r.all_model_probs.map(m => `
    <div class="mb-3">
      <div class="flex-between mb-1">
        <span class="small items-center flex gap-2" style="color:var(--muted)">
          <span class="dot" style="background:${MODEL_COLORS[m.model] || '#33a4fc'}"></span>${esc(m.model)}
          ${m.model === r.selected_model ? '<span class="badge badge-brand">Selected</span>' : ''}
        </span>
        <span class="mono small" style="color:${MODEL_COLORS[m.model] || '#33a4fc'};font-weight:700">${fmt(m.probability)}%</span>
      </div>
      <div class="hbar"><span style="width:${m.probability}%;background:${MODEL_COLORS[m.model] || '#33a4fc'}"></span></div>
    </div>`).join('');
}

function recommendationHTML(r) {
  if (!r.recommendations.length) return '<p class="small muted">No recommendations generated.</p>';
  const badge = { High: 'badge-red', Medium: 'badge-amber', Low: 'badge-green' };
  return r.recommendations.map((rec, i) => `
    <div class="flex items-start gap-3 card-tight" style="background:var(--card);border:1px solid var(--border);border-radius:12px">
      <div class="flex-center mono small" style="width:32px;height:32px;border-radius:9px;background:rgba(51,164,252,.14);border:1px solid rgba(51,164,252,.25);color:var(--brand);flex-shrink:0;font-weight:700">#${i + 1}</div>
      <div class="flex-1">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <span style="font-weight:600;font-size:.9rem">${esc(rec.action)}</span>
          <span class="badge ${badge[rec.impact] || 'badge-brand'}">${esc(rec.impact)} Impact</span>
          ${rec.probability_gain > 0 ? `<span class="badge badge-brand mono">+${fmt(rec.probability_gain)} pts predicted</span>` : ''}
        </div>
        <p class="tiny" style="color:var(--muted);line-height:1.6">${esc(rec.detail)}</p>
      </div>
    </div>`).join('');
}

function sectionHeader(icon, title) {
  return `
    <div class="upcase muted mb-4" style="letter-spacing:.12em;display:flex;align-items:center;gap:8px">
      ${icon}<span>${title}</span>
    </div>`;
}

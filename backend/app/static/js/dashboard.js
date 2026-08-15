/* ============================================================
   Dashboard — student input form + full ML report
   ============================================================ */
'use strict';

const PRESETS = {
  custom:         { name: '',       previous_gpa: 7,   internal_score: 65, study_hours: 10, attendance: 75, assignment_rate: 80, parental_education: 2, internet_access: 1, extracurricular: 0 },
  topPerformer:   { name: 'Priya Menon', previous_gpa: 9.2, internal_score: 88, study_hours: 16, attendance: 95, assignment_rate: 98, parental_education: 3, internet_access: 1, extracurricular: 1 },
  averageStudent: { name: 'Arjun Sharma', previous_gpa: 6.5, internal_score: 60, study_hours: 9,  attendance: 72, assignment_rate: 75, parental_education: 2, internet_access: 1, extracurricular: 0 },
  atRisk:         { name: 'Ravi Kumar',   previous_gpa: 4.2, internal_score: 38, study_hours: 4,  attendance: 52, assignment_rate: 50, parental_education: 1, internet_access: 0, extracurricular: 0 },
};

const SLIDER_META = {
  previous_gpa:   { id: 'v-gpa',   fmt: v => fmt(v, 1) + ' / 10',       step: 0.1 },
  internal_score: { id: 'v-internal', fmt: v => fmt(v, 0) + '%',         step: 1 },
  study_hours:    { id: 'v-study', fmt: v => fmt(v, 1) + ' hrs',         step: 0.5 },
  attendance:     { id: 'v-attendance', fmt: v => fmt(v, 0) + '%',       step: 1 },
  assignment_rate:{ id: 'v-assignment', fmt: v => fmt(v, 0) + '%',       step: 1 },
};

let dashCharts = [];
let dashResult = null;

function fillSlider(el) {
  const min = +el.min, max = +el.max, val = +el.value;
  el.style.setProperty('--fill', ((val - min) / (max - min) * 100) + '%');
}

function sliderChanged(el) {
  fillSlider(el);
  const meta = SLIDER_META[el.id];
  if (meta) {
    const label = qs(meta.id);
    if (label) label.textContent = meta.fmt(el.value);
  }
  const map = {
    previous_gpa: 's-gpa', internal_score: 's-internal', study_hours: 's-study',
    attendance: 's-attendance', assignment_rate: 's-assignment',
  };
  const s = qs(map[el.id]);
  if (s) s.textContent = (el.id === 'previous_gpa' || el.id === 'study_hours') ? fmt(el.value, 1) : fmt(el.value, 0);
}

function bindOptGroup(id) {
  const box = qs(id);
  if (!box) return;
  box.querySelectorAll('.opt').forEach(btn => {
    btn.addEventListener('click', () => {
      box.dataset.value = btn.dataset.val;
      refreshOptGroup(box);
    });
  });
}

function refreshOptGroup(box) {
  box.querySelectorAll('.opt').forEach(btn => {
    const selected = btn.dataset.val === box.dataset.value;
    const yesNo = box.id === 'internet_access' || box.id === 'extracurricular';
    btn.classList.remove('on-brand', 'on-green', 'on-red');
    if (!selected) return;
    if (yesNo) btn.classList.add(btn.dataset.val === '1' ? 'on-green' : 'on-red');
    else btn.classList.add('on-brand');
  });
}

function applyPreset() {
  const p = PRESETS[qs('preset').value];
  if (!p) return;
  qs('name').value = p.name || '';
  ['previous_gpa', 'internal_score', 'study_hours', 'attendance', 'assignment_rate'].forEach(f => {
    const el = qs(f);
    el.value = p[f];
    sliderChanged(el);
  });
  ['parental_education', 'internet_access', 'extracurricular'].forEach(id => {
    const box = qs(id);
    box.dataset.value = String(p[id]);
    refreshOptGroup(box);
  });
}

function readForm() {
  return {
    name: qs('name').value.trim(),
    previous_gpa: parseFloat(qs('previous_gpa').value),
    internal_score: parseFloat(qs('internal_score').value),
    study_hours: parseFloat(qs('study_hours').value),
    attendance: parseFloat(qs('attendance').value),
    assignment_rate: parseFloat(qs('assignment_rate').value),
    parental_education: parseInt(qs('parental_education').dataset.value),
    internet_access: parseInt(qs('internet_access').dataset.value),
    extracurricular: parseInt(qs('extracurricular').dataset.value),
  };
}

async function runAnalysis() {
  const data = readForm();
  if (!data.name) {
    qs('formError').innerHTML = '<div class="alert alert-red mt-3">Please enter a student name.</div>';
    return;
  }
  qs('formError').innerHTML = '';
  const btn = qs('runBtn');
  btn.disabled = true;
  qs('runLabel').innerHTML = '<span class="flex-center gap-2"><span class="spinner"></span> Running ML Analysis...</span>';
  try {
    dashResult = await api('/api/analyze', data);
    renderReport(dashResult);
  } catch (e) {
    qs('formError').innerHTML = '<div class="alert alert-red mt-3">Failed to connect to the analysis engine.</div>';
  } finally {
    btn.disabled = false;
    qs('runLabel').textContent = 'Run Full Analysis';
  }
}

function destroyCharts() {
  (dashCharts || []).forEach(c => { try { c.destroy(); } catch (_) {} });
  dashCharts = [];
}

function renderReport(r) {
  destroyCharts();
  qs('emptyState').classList.add('hidden');
  qs('report').classList.remove('hidden');

  const tone = riskTone(r.risk_color);
  const kpis = [
    { label: 'Ensemble Probability', value: fmt(r.ensemble_probability) + '%', sub: '5-model soft vote', color: 'var(--brand)' },
    { label: 'ML Probability', value: fmt(r.ml_probability) + '%', sub: esc(r.selected_model), color: 'var(--purple)' },
    { label: 'ASI Score', value: fmt(r.asi) + '%', sub: 'AI-calibrated', color: 'var(--cyan)' },
    { label: 'Model Confidence', value: fmt(r.confidence) + '%', sub: 'Cross-model agreement', color: 'var(--green)' },
    { label: 'Predicted Class', value: esc(r.predicted_class), sub: 'Threshold ' + fmt(r.class_threshold) + '%', color: 'var(--amber)' },
    { label: 'Recommendations', value: r.recommendations.length, sub: 'Impact-ranked', color: 'var(--amber)' },
  ].map(k => `
    <div class="stat-card">
      <div class="k">${k.label}</div>
      <div class="v" style="color:${k.color}">${k.value}</div>
      <div class="s">${k.sub}</div>
    </div>`).join('');

  const fiData = r.feature_importance.map(f => ({ name: f.feature, value: Math.round(f.importance * 100) }));
  const radarData = Object.entries(r.radar_data).map(([subject, value]) => ({ subject, value }));
  const barData = r.bar_data;

  qs('report').innerHTML = `
    <div class="anim-up">
      <div class="flex-between mb-4 flex-wrap">
        <div>
          <span class="section-tag">Analysis Report</span>
          <h2 class="title-lg" style="margin-top:4px">Full Academic Report</h2>
        </div>
        <button class="btn btn-secondary" onclick="printReport(dashResult)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10h10v6H7zM7 18h10M7 3h10v4H7z"/></svg>
          Export PDF
        </button>
      </div>

      <div class="grid grid-4 mb-4">${kpis}</div>

      <div class="mb-4">${riskBannerHTML(r)}</div>

      <div class="glass card mb-4">
        <div class="upcase muted mb-4" style="letter-spacing:.12em">Academic Stability Index (ASI) Gauge — AI-calibrated bands</div>
        ${gaugeHTML(r)}
      </div>

      <div class="glass card mb-4">
        <div class="upcase muted mb-4" style="letter-spacing:.12em">All Models — Probability Comparison</div>
        ${modelBarsHTML(r)}
      </div>

      <div class="grid" style="grid-template-columns:1fr 1fr;gap:20px">
        <div class="glass card">
          <div class="upcase muted mb-4" style="letter-spacing:.12em">Spider Chart — Multi-Dimensional Profile</div>
          <div style="height:300px"><canvas id="chRadar"></canvas></div>
        </div>
        <div class="glass card">
          <div class="upcase muted mb-4" style="letter-spacing:.12em">Feature Importance — Random Forest (%)</div>
          <div style="height:300px"><canvas id="chFi"></canvas></div>
        </div>
      </div>

      <div class="glass card mt-4">
        <div class="upcase muted mb-4" style="letter-spacing:.12em">Score vs Benchmark — Column Chart</div>
        <div style="height:300px"><canvas id="chBench"></canvas></div>
      </div>

      <div class="glass card mt-4">
        <div class="upcase muted mb-4" style="letter-spacing:.12em;display:flex;align-items:center;gap:8px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--brand)"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>
          Ranked Intervention Recommendations
        </div>
        <div class="flex-col gap-3">${recommendationHTML(r)}</div>
      </div>

      <div class="glass card mt-4">
        <div class="upcase muted mb-4" style="letter-spacing:.12em;display:flex;align-items:center;gap:8px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--amber)"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/></svg>
          Detailed Overall Report
        </div>
        <div class="flex-col gap-3 small" style="color:var(--muted);line-height:1.75">
          <p>The AI-Based Decision Support System completed a comprehensive analysis of the student's academic profile using a trained <strong style="color:#fff">${esc(r.selected_model)}</strong> model on a dataset of 1,000 real student records.</p>
          <p><strong style="color:#fff">ML Prediction:</strong> The model estimated a performance probability of <strong style="color:var(--brand)">${fmt(r.ml_probability)}%</strong>, classifying this student as a <strong style="color:var(--brand)">${esc(r.predicted_class)}</strong>.</p>
          <p><strong style="color:#fff">Academic Stability Index:</strong> The computed ASI score is <strong style="color:var(--cyan)">${fmt(r.asi)}%</strong> — derived from an AI-calibrated blend of ensemble ML probability, attendance, and study hours. This places the student in the <strong style="color:${tone.text}">${esc(r.risk_category)}</strong> category, using calibrated risk bands (Stable ≥ ${Math.round(r.risk_thresholds.stable * 100)}%, Monitor ≥ ${Math.round(r.risk_thresholds.monitor * 100)}%).</p>
          <p><strong style="color:#fff">Key Influencing Factors:</strong> ${esc(r.feature_importance.slice(0, 3).map(f => f.feature).join(', '))} were the top predictors based on Random Forest feature importances.</p>
          <p><strong style="color:#fff">Cross-Model Agreement:</strong> ${r.all_model_probs.filter(m => m.probability >= r.class_threshold).length} out of ${r.all_model_probs.length} models predict this student as a Strong Performer (${fmt(r.confidence)}% agreement), showing ${r.confidence >= 75 ? 'strong' : r.confidence >= 50 ? 'moderate' : 'weak'} consensus.</p>
          <p><strong style="color:#fff">Recommendations:</strong> The recommendations below were generated by AI counterfactual simulation — each action was simulated against the trained ensemble to measure its predicted impact on this student's success probability, then ranked by expected gain.</p>
          <p><strong style="color:#fff">Conclusion:</strong> ${r.risk_category === 'Stable' ? 'The student is performing at a stable level. Continued engagement is recommended to maintain this standing.' : r.risk_category === 'Monitor Closely' ? 'The student shows moderate risk. Advisors should increase check-in frequency and provide targeted support.' : 'Immediate academic intervention is required. A structured support plan should be implemented without delay.'} A total of <strong style="color:#fff">${r.recommendations.length} recommendation(s)</strong> have been generated. Use the <strong style="color:var(--brand)">Export PDF</strong> button above to save this report.</p>
        </div>
      </div>
    </div>`;

  buildRadarChart('chRadar', radarData, RISK_COLORS[r.risk_color] || '#33a4fc', esc(r.predicted_class));
  dashCharts.push(
    buildFiChart('chFi', fiData),
    buildBenchChart('chBench', barData)
  );
}

function buildFiChart(canvasId, fi) {
  const ctx = qs(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: fi.map(f => f.name),
      datasets: [{ label: 'Importance %', data: fi.map(f => f.value), backgroundColor: '#33a4fc', borderRadius: 5 }],
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
  });
}

function buildBenchChart(canvasId, barData) {
  const ctx = qs(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: barData.map(b => b.label),
      datasets: [
        { label: 'Student', data: barData.map(b => b.score), backgroundColor: '#33a4fc', borderRadius: 5 },
        { label: 'Benchmark', data: barData.map(b => b.benchmark), backgroundColor: 'rgba(148,163,184,.25)', borderRadius: 5 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        y: { min: 0, max: 100, ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: '#1e2d4a' } },
      },
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } }, tooltip: { callbacks: { label: c => c.dataset.label + ': ' + c.formattedValue + '%' }, backgroundColor: '#0f1629', borderColor: '#1e2d4a', borderWidth: 1 } },
    },
  });
}

/* ---- init ---- */
document.addEventListener('DOMContentLoaded', () => {
  ['previous_gpa', 'internal_score', 'study_hours', 'attendance', 'assignment_rate'].forEach(f => fillSlider(qs(f)));
  ['parental_education', 'internet_access', 'extracurricular'].forEach(bindOptGroup);
  ['parental_education', 'internet_access', 'extracurricular'].forEach(id => refreshOptGroup(qs(id)));
});

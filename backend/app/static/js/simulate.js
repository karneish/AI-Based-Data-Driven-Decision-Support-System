/* ============================================================
   Simulator — what-if scenario panel
   ============================================================ */
'use strict';

const SIM_META = {
  study_hours:    { id: 'v-study', fmt: v => fmt(v, 1) + ' hrs' },
  attendance:     { id: 'v-attendance', fmt: v => fmt(v, 0) + '%' },
  assignment_rate:{ id: 'v-assignment', fmt: v => fmt(v, 0) + '%' },
  internal_score: { id: 'v-internal', fmt: v => fmt(v, 0) + '%' },
  previous_gpa:   { id: 'v-gpa', fmt: v => fmt(v, 1) + ' / 10' },
};

let simCharts = [];
let simResult = null;

function fillSlider(el) {
  const min = +el.min, max = +el.max, val = +el.value;
  el.style.setProperty('--fill', ((val - min) / (max - min) * 100) + '%');
}

function sliderChanged(el) {
  fillSlider(el);
  const meta = SIM_META[el.id];
  if (meta) {
    const label = qs(meta.id);
    if (label) label.textContent = meta.fmt(el.value);
  }
}

function readSim() {
  return {
    name: 'Simulation Student',
    previous_gpa: parseFloat(qs('previous_gpa').value),
    internal_score: parseFloat(qs('internal_score').value),
    study_hours: parseFloat(qs('study_hours').value),
    attendance: parseFloat(qs('attendance').value),
    assignment_rate: parseFloat(qs('assignment_rate').value),
    parental_education: 2,
    internet_access: 1,
    extracurricular: parseInt(qs('extracurricular').dataset.value),
  };
}

async function runSimulation() {
  const btn = qs('simBtn');
  btn.disabled = true;
  qs('simLabel').innerHTML = '<span class="flex-center gap-2"><span class="spinner"></span> Simulating...</span>';
  qs('simError').innerHTML = '';
  try {
    const r = await api('/api/simulate', readSim());
    simResult = r;
    renderSim(r);
  } catch (e) {
    qs('simError').innerHTML = '<div class="alert alert-red mt-3">Backend not reachable. Start the FastAPI server.</div>';
  } finally {
    btn.disabled = false;
    qs('simLabel').textContent = 'Run Simulation';
  }
}

function destroySimCharts() {
  (simCharts || []).forEach(c => { try { c.destroy(); } catch (_) {} });
  simCharts = [];
}

function renderSim(r) {
  destroySimCharts();
  qs('simEmpty').classList.add('hidden');
  const out = qs('simResult');
  out.classList.remove('hidden');
  const color = RISK_COLORS[r.risk_color];

  const radarData = Object.entries(r.radar_data).map(([subject, value]) => ({ subject, value }));
  const barData = r.bar_data;

  out.innerHTML = `
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px">
      <div class="stat-card center">
        <div class="k">ML Probability</div>
        <div class="v" style="color:var(--brand)">${fmt(r.ml_probability)}%</div>
      </div>
      <div class="stat-card center">
        <div class="k">ASI Score</div>
        <div class="v" style="color:var(--cyan)">${fmt(r.asi)}%</div>
      </div>
    </div>

    <div class="glass card-tight flex items-center gap-3 mt-3" style="border-color:${color}33">
      <div style="width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 12px ${color}"></div>
      <div>
        <div class="title" style="color:#fff">${esc(r.risk_category)}</div>
        <div class="tiny" style="color:var(--muted)">${esc(r.predicted_class)} · ${fmt(r.confidence)}% agreement</div>
      </div>
      <div style="margin-left:auto" class="mono title" style="color:${color}">${fmt(r.asi)}%</div>
    </div>

    <div class="glass card mt-3">
      <div class="upcase muted mb-3" style="letter-spacing:.12em">ASI Gauge</div>
      ${gaugeHTML(r)}
    </div>

    <div class="glass card mt-3">
      <div class="upcase muted mb-3" style="letter-spacing:.12em">Profile Spider</div>
      <div style="height:240px"><canvas id="simRadar"></canvas></div>
    </div>

    <div class="glass card mt-3">
      <div class="upcase muted mb-3" style="letter-spacing:.12em">Simulated Score vs Benchmark</div>
      <div style="height:240px"><canvas id="simBench"></canvas></div>
    </div>`;

  simCharts.push(buildRadarChart('simRadar', radarData, color, 'Simulated'));
  simCharts.push(new Chart(qs('simBench'), {
    type: 'bar',
    data: {
      labels: barData.map(b => b.label),
      datasets: [
        { label: 'Simulated', data: barData.map(b => b.score), backgroundColor: color, borderRadius: 5 },
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
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  ['study_hours', 'attendance', 'assignment_rate', 'internal_score', 'previous_gpa'].forEach(f => fillSlider(qs(f)));
  bindOptGroup && bindOptGroup('extracurricular');
  refreshOptGroup && refreshOptGroup(qs('extracurricular'));
});

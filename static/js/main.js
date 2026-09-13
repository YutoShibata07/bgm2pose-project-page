// Demo video: guide viewers to turn the sound on ----------------------------
(function () {
  const video = document.getElementById('demo-video');
  const cta = document.getElementById('unmute-cta');
  const toggle = document.getElementById('sound-toggle');
  if (!video || !cta || !toggle) return;

  const sync = () => {
    const audible = !video.muted && video.volume > 0;
    // the big prompt goes away for good once sound has been turned on
    if (audible) cta.hidden = true;
    toggle.hidden = !cta.hidden;
    toggle.setAttribute('aria-pressed', String(audible));
    toggle.querySelector('i').className = audible ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    toggle.querySelector('span').textContent = audible ? 'Mute' : 'Unmute';
  };

  cta.addEventListener('click', () => {
    video.muted = false;
    if (video.volume === 0) video.volume = 1;
    video.currentTime = 0;
    video.play();
    sync();
  });

  toggle.addEventListener('click', () => {
    video.muted = !video.muted;
    sync();
  });

  video.addEventListener('volumechange', sync);
})();

// BibTeX copy ---------------------------------------------------------------
(function () {
  const btn = document.getElementById('copy-bibtex');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const text = document.getElementById('bibtex-code').innerText;
    navigator.clipboard.writeText(text).then(() => {
      btn.querySelector('span').textContent = 'Copied';
      btn.querySelector('i').className = 'fa-solid fa-check';
      setTimeout(() => {
        btn.querySelector('span').textContent = 'Copy';
        btn.querySelector('i').className = 'fa-regular fa-copy';
      }, 1800);
    });
  });
})();

// Result charts -------------------------------------------------------------
// Numbers are taken from Tables 3-6 of the paper.
const METRICS = [
  { key: 'rmse', label: 'RMSE', better: 'lower', digits: 3 },
  { key: 'mae', label: 'MAE', better: 'lower', digits: 3 },
  { key: 'pckh', label: 'PCKh@0.5', better: 'higher', digits: 3 },
];

// [mean, std] per metric; std is null where the paper reports none.
const COMPARISON = {
  domains: { rmse: [0, 1.6], mae: [0, 1.0], pckh: [0, 0.6] },
  ticks: { rmse: [0, 0.4, 0.8, 1.2, 1.6], mae: [0, 0.25, 0.5, 0.75, 1.0], pckh: [0, 0.2, 0.4, 0.6] },
  settings: [
    {
      id: 'single',
      name: 'Single-music',
      desc: 'Same ambient track for training and testing.',
      rows: [
        { name: 'Jiang et al.', rmse: [1.338, 0.042], mae: [0.768, 0.033], pckh: [0.251, 0.034] },
        { name: 'Ginosar et al.', rmse: [1.223, 0.026], mae: [0.666, 0.016], pckh: [0.379, 0.023] },
        { name: 'Shibata et al.', rmse: [1.090, 0.024], mae: [0.574, 0.016], pckh: [0.468, 0.007] },
        { name: 'BGM2Pose (ours)', ours: true, rmse: [0.923, 0.013], mae: [0.453, 0.006], pckh: [0.573, 0.005] },
      ],
    },
    {
      id: 'cross',
      name: 'Cross-music',
      desc: 'The test track is held out from training.',
      rows: [
        { name: 'Jiang et al.', rmse: [1.417, 0.025], mae: [0.800, 0.012], pckh: [0.272, 0.008] },
        { name: 'Ginosar et al.', rmse: [1.274, 0.022], mae: [0.682, 0.011], pckh: [0.375, 0.017] },
        { name: 'Shibata et al.', rmse: [1.110, 0.024], mae: [0.556, 0.014], pckh: [0.499, 0.008] },
        { name: 'BGM2Pose (ours)', ours: true, rmse: [1.036, 0.033], mae: [0.494, 0.018], pckh: [0.570, 0.011] },
      ],
    },
    {
      id: 'genre',
      name: 'Cross-genre',
      desc: 'Trained on ambient tracks, tested on jazz.',
      rows: [
        { name: 'Jiang et al.', rmse: [1.418, 0.080], mae: [0.849, 0.080], pckh: [0.221, 0.073] },
        { name: 'Ginosar et al.', rmse: [1.326, 0.073], mae: [0.727, 0.041], pckh: [0.360, 0.002] },
        { name: 'Shibata et al.', rmse: [1.112, 0.020], mae: [0.595, 0.015], pckh: [0.376, 0.019] },
        { name: 'BGM2Pose (ours)', ours: true, rmse: [1.065, 0.070], mae: [0.543, 0.041], pckh: [0.463, 0.026] },
      ],
    },
    {
      id: 'noise',
      name: 'Gaussian noise',
      desc: 'Single-music with Gaussian noise at SNR 10 dB in training and test audio.',
      rows: [
        { name: 'Jiang et al.', rmse: [1.567, null], mae: [0.931, null], pckh: [0.095, null] },
        { name: 'Ginosar et al.', rmse: [1.389, null], mae: [0.796, null], pckh: [0.262, null] },
        { name: 'Shibata et al.', rmse: [1.328, null], mae: [0.737, null], pckh: [0.354, null] },
        { name: 'BGM2Pose (ours)', ours: true, rmse: [1.202, null], mae: [0.637, null], pckh: [0.430, null] },
      ],
    },
  ],
};

const ABLATION = {
  domains: { rmse: [0, 1.25], mae: [0, 0.625], pckh: [0, 0.6] },
  ticks: { rmse: [0, 0.25, 0.5, 0.75, 1.0, 1.25], mae: [0, 0.2, 0.4, 0.6], pckh: [0, 0.2, 0.4, 0.6] },
  settings: [
    {
      id: 'abl-single',
      name: 'Single-music',
      desc: 'Each variant removes one component from the full model.',
      rows: [
        { name: 'Full model', ours: true, rmse: [0.923, null], mae: [0.453, null], pckh: [0.573, null] },
        { name: 'w/o CPE module', rmse: [0.945, null], mae: [0.481, null], pckh: [0.531, null] },
        { name: 'w/o BGM hard negatives', rmse: [0.928, null], mae: [0.457, null], pckh: [0.566, null] },
        { name: 'w/o FA module', rmse: [1.025, null], mae: [0.509, null], pckh: [0.536, null] },
        { name: 'w/o BGM conditioning', rmse: [0.970, null], mae: [0.484, null], pckh: [0.537, null] },
      ],
    },
    {
      id: 'abl-cross',
      name: 'Cross-music',
      desc: 'Each variant removes one component from the full model.',
      rows: [
        { name: 'Full model', ours: true, rmse: [1.036, null], mae: [0.494, null], pckh: [0.570, null] },
        { name: 'w/o CPE module', rmse: [1.024, null], mae: [0.501, null], pckh: [0.547, null] },
        { name: 'w/o BGM hard negatives', rmse: [1.065, null], mae: [0.506, null], pckh: [0.559, null] },
        { name: 'w/o FA module', rmse: [1.210, null], mae: [0.593, null], pckh: [0.512, null] },
        { name: 'w/o BGM conditioning', rmse: [1.075, null], mae: [0.522, null], pckh: [0.543, null] },
      ],
    },
  ],
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const tooltip = document.getElementById('tooltip');

function el(name, attrs, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(node);
  return node;
}

function fmt(v, digits) {
  return v.toFixed(digits);
}

function showTooltip(evt, row, metric) {
  const [mean, std] = row[metric.key];
  const value = std == null ? fmt(mean, metric.digits) : `${fmt(mean, metric.digits)} ± ${fmt(std, metric.digits)}`;
  tooltip.innerHTML = `<strong>${row.name}</strong><span>${metric.label} ${value}</span>`;
  tooltip.hidden = false;

  let x, y;
  if (evt.type === 'focus') {
    const r = evt.target.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top;
  } else {
    x = evt.clientX;
    y = evt.clientY;
  }
  const tw = tooltip.offsetWidth;
  const left = Math.min(Math.max(8, x - tw / 2), window.innerWidth - tw - 8);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${y - tooltip.offsetHeight - 12}px`;
}

function hideTooltip() {
  tooltip.hidden = true;
}

function drawPanel(container, setting, metric, spec) {
  const panel = document.createElement('div');
  panel.className = 'panel';
  const arrow = metric.better === 'lower' ? '↓' : '↑';
  panel.innerHTML = `<div class="panel-title">${metric.label}<span class="dir" title="${metric.better} is better" aria-label="${metric.better} is better">${arrow}</span></div>`;
  container.appendChild(panel);

  const width = Math.max(240, panel.clientWidth);
  const rowH = 38;
  const barH = 12;
  const top = 4;
  const axisH = 22;
  const padRight = 64;
  const height = top + setting.rows.length * rowH + axisH;
  const [d0, d1] = spec.domains[metric.key];
  const plotW = width - padRight;
  const sx = (v) => ((v - d0) / (d1 - d0)) * plotW;

  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width, height, class: 'chart-svg', role: 'img',
    'aria-label': `${metric.label}, ${setting.name}` }, panel);

  // grid + ticks
  const plotBottom = top + setting.rows.length * rowH;
  for (const t of spec.ticks[metric.key]) {
    const x = Math.round(sx(t)) + 0.5;
    el('line', { x1: x, x2: x, y1: top, y2: plotBottom, class: t === 0 ? 'axis' : 'grid' }, svg);
    const label = el('text', { x, y: plotBottom + 15, class: 'tick', 'text-anchor': t === 0 ? 'start' : 'middle' }, svg);
    label.textContent = t === 0 ? '0' : String(t);
  }

  // best value among rows, used to mark the winner
  const vals = setting.rows.map((r) => r[metric.key][0]);
  const best = metric.better === 'lower' ? Math.min(...vals) : Math.max(...vals);

  setting.rows.forEach((row, i) => {
    const [mean, std] = row[metric.key];
    const y0 = top + i * rowH;
    const g = el('g', { class: `bar-row${row.ours ? ' is-ours' : ''}`, tabindex: 0 }, svg);

    const name = el('text', { x: 0, y: y0 + 11, class: 'row-label' }, g);
    name.textContent = row.name;

    const by = y0 + 17;
    const w = Math.max(1, sx(mean));
    // square at the baseline, 3px radius at the data end
    const r = Math.min(3, w / 2);
    el('path', {
      d: `M0 ${by} H${w - r} Q${w} ${by} ${w} ${by + r} V${by + barH - r} Q${w} ${by + barH} ${w - r} ${by + barH} H0 Z`,
      class: 'bar',
    }, g);

    let labelX = w + 6;
    if (std != null) {
      const xa = sx(mean - std);
      const xb = sx(mean + std);
      const cy = by + barH / 2;
      el('line', { x1: xa, x2: xb, y1: cy, y2: cy, class: 'whisker' }, g);
      el('line', { x1: xa, x2: xa, y1: cy - 4, y2: cy + 4, class: 'whisker' }, g);
      el('line', { x1: xb, x2: xb, y1: cy - 4, y2: cy + 4, class: 'whisker' }, g);
      labelX = Math.max(labelX, xb + 6);
    }

    const value = el('text', { x: labelX, y: by + barH - 2, class: `value${mean === best ? ' is-best' : ''}` }, g);
    value.textContent = fmt(mean, metric.digits);

    // generous hit target over the whole row
    el('rect', { x: 0, y: y0, width, height: rowH, class: 'hit' }, g);

    g.addEventListener('mousemove', (e) => showTooltip(e, row, metric));
    g.addEventListener('mouseleave', hideTooltip);
    g.addEventListener('focus', (e) => showTooltip(e, row, metric));
    g.addEventListener('blur', hideTooltip);
  });
}

function describe(setting) {
  const ours = setting.rows.find((r) => r.ours);
  const others = setting.rows.filter((r) => !r.ours);
  const bestOther = others.reduce((a, b) => (b.pckh[0] > a.pckh[0] ? b : a));
  const diff = ours.pckh[0] - bestOther.pckh[0];
  const sign = diff >= 0 ? '+' : '−';
  return `${setting.desc} PCKh@0.5 ${fmt(ours.pckh[0], 3)} vs. ${fmt(bestOther.pckh[0], 3)} for ${bestOther.name} (${sign}${fmt(Math.abs(diff), 3)}).`;
}

function buildTable(setting) {
  const head = METRICS.map((m) => `<th>${m.label} <small>(${m.better === 'lower' ? '↓' : '↑'})</small></th>`).join('');
  const body = setting.rows.map((row) => {
    const cells = METRICS.map((m) => {
      const [mean, std] = row[m.key];
      return `<td>${fmt(mean, 3)}${std == null ? '' : ` <small>± ${fmt(std, 3)}</small>`}</td>`;
    }).join('');
    return `<tr${row.ours ? ' class="is-ours"' : ''}><th scope="row">${row.name}</th>${cells}</tr>`;
  }).join('');
  return `<table><thead><tr><th scope="col">${setting.name}</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function mountChart(root, spec, describeFn) {
  const tabs = root.querySelector('.tabs');
  const panels = root.querySelector('.panels');
  const desc = root.querySelector('.chart-desc');
  const table = root.querySelector('.table-scroll');
  let current = spec.settings[0];

  spec.settings.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.role = 'tab';
    b.textContent = s.name;
    b.addEventListener('click', () => {
      current = s;
      render();
    });
    tabs.appendChild(b);
  });

  function render() {
    [...tabs.children].forEach((b, i) => b.setAttribute('aria-selected', String(spec.settings[i] === current)));
    panels.innerHTML = '';
    METRICS.forEach((m) => drawPanel(panels, current, m, spec));
    desc.textContent = describeFn(current);
    table.innerHTML = buildTable(current);
  }

  render();
  let lastW = root.clientWidth;
  window.addEventListener('resize', () => {
    if (root.clientWidth !== lastW) {
      lastW = root.clientWidth;
      render();
    }
  });
}

mountChart(document.getElementById('comparison-chart'), COMPARISON, describe);
mountChart(document.getElementById('ablation-chart'), ABLATION, (s) => s.desc);

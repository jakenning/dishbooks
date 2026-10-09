// Loads a scene + scenario and either plays it live or hands control to the
// recorder.
//
//   scene.html?scenario=home              live, looping
//   scene.html?scenario=home&controls=1   live, with play/pause + scrubber
//   scene.html?scenario=home&record=1     paused; recorder drives window.__anim
//   scene.html?scenario=home&t=4.2        frozen on one frame (handy for review)
//
// A scene module exports:
//   meta    { width, height, duration, fps }
//   build(root, data)   create the DOM once
//   frame(t)            pose the DOM for time t (seconds) — must be pure

export async function run(scene, { scenarioBase = '../../scenarios/', root = document.getElementById('stage') } = {}) {
  const q = new URLSearchParams(location.search);
  const scenarioName = q.get('scenario') || 'home';
  const data = window.__SCENARIO__ ?? (await (await fetch(`${scenarioBase}${scenarioName}.json`)).json());

  root.style.width = `${scene.meta.width}px`;
  root.style.height = `${scene.meta.height}px`;
  scene.build(root, data);
  await document.fonts.ready;

  const { duration } = scene.meta;
  const api = {
    meta: scene.meta,
    scenario: scenarioName,
    seek: (t) => scene.frame(((t % duration) + duration) % duration),
  };
  window.__anim = api;

  fit(root, scene.meta, q.get('fit') !== '0');

  if (q.has('record')) {
    api.seek(0);
    window.__animReady = true;
    return;
  }
  if (q.has('t')) {
    api.seek(parseFloat(q.get('t')));
    return;
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    // Hold the fully built dashboard rather than animating it.
    api.seek(scene.meta.posterTime ?? duration * 0.6);
    return;
  }

  let playing = true;
  let t = 0;
  let last = performance.now();
  const controls = q.has('controls') ? mountControls(api, () => (playing = !playing), (v) => (t = v)) : null;

  // Only spend frames while the stage is on screen (matters in a Webflow embed).
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(root);

  const tick = (now) => {
    const dt = (now - last) / 1000;
    last = now;
    if (playing && visible) t = (t + dt) % duration;
    api.seek(t);
    controls?.update(t, playing);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Scale the fixed-size stage to fit its container, preserving aspect ratio.
// Uses the scene's own size, not a measurement, so an embed that starts out
// hidden (display: none at one Webflow breakpoint) still scales once shown.
function fit(root, { width, height }, enabled) {
  if (!enabled) return;
  const parent = root.parentElement;
  const apply = () => {
    if (!parent.clientWidth) return;
    const s = Math.min(parent.clientWidth / width, (parent.clientHeight || Infinity) / height);
    root.style.transform = `scale(${s})`;
    root.style.transformOrigin = 'top left';
    parent.style.height = `${height * s}px`;
  };
  new ResizeObserver(apply).observe(parent);
  apply();
}

function mountControls(api, toggle, setT) {
  const bar = document.createElement('div');
  bar.className = 'anim-controls';
  bar.innerHTML = `
    <button type="button" data-k="play">Pause</button>
    <input type="range" min="0" max="${api.meta.duration}" step="0.01" value="0">
    <output>0.00s</output>`;
  document.body.append(bar);
  const [btn, range, out] = bar.children;
  btn.onclick = toggle;
  range.oninput = () => {
    setT(parseFloat(range.value));
    if (btn.textContent === 'Pause') toggle();
  };
  return {
    update(t, playing) {
      btn.textContent = playing ? 'Pause' : 'Play';
      if (playing) range.value = t;
      out.textContent = `${t.toFixed(2)}s`;
    },
  };
}

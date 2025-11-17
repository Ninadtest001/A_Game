export function createHUD() {
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.innerHTML = `
    <div>Demo: WASD / Orbit (dev)</div>
    <div id="fps">FPS: -</div>
  `;
  document.body.appendChild(hud);

  // simple fps tracker
  let last = performance.now();
  let frames = 0;
  function tick() {
    frames++;
    const now = performance.now();
    if (now - last >= 1000) {
      const el = document.getElementById('fps');
      if (el) el.textContent = `FPS: ${frames}`;
      frames = 0;
      last = now;
    }
    requestAnimationFrame(tick);
  }
  tick();
}

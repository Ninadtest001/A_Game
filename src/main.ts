import './styles.css';
import { createScene } from './scene';
import { createHUD } from './ui';

createHUD();

const app = document.getElementById('app')!;
const canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '100%';
app.appendChild(canvas);

async function start() {
  const ctx = { canvas, width: window.innerWidth, height: window.innerHeight };
  const { resize } = await createScene(ctx);

  window.addEventListener('resize', () => {
    resize(window.innerWidth, window.innerHeight);
  });
}

start().catch((e) => console.error(e));

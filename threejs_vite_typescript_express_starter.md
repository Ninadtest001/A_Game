# threejs-vite-typescript-express-starter

A ready-to-run starter repository for a lightweight, realistic-looking browser game built with **Three.js + TypeScript + Vite** (client) and **Node.js + Express** (server). This document contains the full file tree and file contents — copy files into a repository and run the commands in **README.md** to get started.

---

## Repo file tree

```
/ (project root)
  .gitignore
  README.md
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  /public
    favicon.ico            <-- placeholder
    hdri_small.hdr         <-- placeholder HDRI (small, ~128-256px)
    /models
      test.glb             <-- placeholder GLB you can replace
  /src
    main.ts
    scene.ts
    loaders.ts
    ui.ts
    styles.css
  /server
    index.js
  
```

---

## README.md

```md
# Three.js Vite TypeScript + Express Starter

Minimal starter to go from idea → playable browser game (realistic PBR look, lightweight).

## Features
- Vite + TypeScript client
- Three.js scene with PMREM IBL loader, GLTF loader
- Basic orbit controls and a player-like pointerlock toggle example
- Simple Express server to serve the built `dist` and provide a sample `/api/health` endpoint
- Scripts for dev, build, preview and start

## Prereqs
- Node 18+ / npm
- Optional: Blender to make GLBs, a small HDRI (128–256px) for IBL

## Quickstart

1. Install dependencies

```bash
npm install
```

2. Run both client dev server and server (concurrently)

```bash
npm run dev
```

- Vite dev server runs on `http://localhost:5173`
- Express server runs on `http://localhost:3000` (API & static preview after build)

3. Build for production

```bash
npm run build
npm run preview   # quick check of built site
# or deploy: npm run build && npm start
```

4. Start production server (after `npm run build`)

```bash
npm start
```

## Where to put assets
- `/public/hdri_small.hdr` — a small HDR for PMREM (or update `src/loaders.ts` to fetch from CDN)
- `/public/models/test.glb` — a small test model

## Notes
- This is a starter: swap OrbitControls for PointerLockControls if you want FPS controls.
- Use basis / KTX2 compression and gltfpack for asset optimization before production.

## Useful commands
- `npm run dev` — run client and server for development
- `npm run dev:client` — Vite dev server only
- `npm run dev:server` — Express server only (nodemon)
- `npm run build` — Vite production build
- `npm run preview` — vite preview (serves the `dist` locally)
- `npm start` — start Node server to serve `dist`

```
```

---

## .gitignore

```gitignore
/node_modules
/dist
/.vscode
.DS_Store
.env
npm-debug.log*
```

---

## package.json

```json
{
  "name": "threejs-vite-typescript-express-starter",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:client": "vite",
    "dev:server": "nodemon --watch server --exec \"node server/index.js\"",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4",
    "three": "^0.156.0",
    "cannon-es": "^0.20.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.2.2",
    "concurrently": "^8.2.0",
    "nodemon": "^3.0.1",
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.1"
  }
}
```

> Versions are examples — `npm install` will pull compatible versions.

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": ["vite/client"]
  },
  "include": ["src/**/*"]
}
```

---

## vite.config.ts

```ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

---

## index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Three.js Vite Starter</title>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

## src/styles.css

```css
html,body,#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: Inter, system-ui, Arial, sans-serif;
}
#hud {
  position: absolute;
  left: 12px;
  top: 12px;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
  z-index: 10;
}
```

---

## src/loaders.ts

```ts
// helpers for loading GLTF + HDR for IBL
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

export async function loadGLTF(url: string): Promise<GLTF> {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf), undefined, reject);
  });
}

export async function loadEnvMap(renderer: THREE.WebGLRenderer, url: string): Promise<THREE.Texture> {
  // Loads HDR equirectangular and converts to PMREM (for IBL)
  const rgbe = new RGBELoader();
  const tex = await rgbe.loadAsync(url);
  tex.mapping = THREE.EquirectangularReflectionMapping;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envMap = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  pmrem.dispose();
  return envMap;
}
```

---

## src/scene.ts

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { loadGLTF, loadEnvMap } from './loaders';

export interface AppContext {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export async function createScene(ctx: AppContext) {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: ctx.canvas });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(ctx.width, ctx.height);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const camera = new THREE.PerspectiveCamera(60, ctx.width / ctx.height, 0.1, 1000);
  camera.position.set(0, 2, 6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();

  // Light: small ambient and directional (still rely on IBL primarily)
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 10, 7);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  scene.add(dir);

  // Ground
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Try to load an HDR for IBL if available
  try {
    const env = await loadEnvMap(renderer, '/hdri_small.hdr');
    scene.environment = env;
    scene.background = env;
  } catch (err) {
    console.warn('HDR env load failed (placeholder):', err);
    scene.background = new THREE.Color(0x88bbee);
  }

  // Load a GLB model if present
  try {
    const gltf = await loadGLTF('/models/test.glb');
    gltf.scene.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        const m = c as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    gltf.scene.position.set(0, 0, 0);
    scene.add(gltf.scene);
  } catch (err) {
    console.warn('Model load failed (placeholder):', err);
    // add a fallback box
    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ metalness: 0.1, roughness: 0.6 }));
    box.position.set(0, 0.5, 0);
    scene.add(box);
  }

  // Simple resize handler
  function resize(w: number, h: number) {
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Animation
  let last = performance.now();
  function tick() {
    requestAnimationFrame(tick);
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;

    // update anything here
    controls.update();

    renderer.render(scene, camera);
  }
  tick();

  return { renderer, scene, camera, resize };
}
```

---

## src/ui.ts

```ts
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
```

---

## src/main.ts

```ts
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
```

---

## server/index.js

```js
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
app.use(compression());
app.use(express.json());

// API example
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Serve static built client when in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath, { maxAge: '1d' }));

// fallback to index.html (SPA)
app.get('*', (req, res) => {
  const index = path.join(distPath, 'index.html');
  res.sendFile(index, (err) => {
    if (err) res.status(500).send(err.message);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
```

---

## placeholders & notes
- Replace `/public/hdri_small.hdr` with an optimized small HDR (128–256) or use an LDR cubemap.
- Replace `/public/models/test.glb` with your exported glTF/glb. Optimize with `gltfpack` or `gltf-transform`.
- Consider adding KTX2/Basis support via `KTX2Loader` when you have compressed textures.

---

## Next steps & recommendations
1. Swap OrbitControls for `PointerLockControls` for FPS-style controls and implement a fixed-timestep physics loop with `cannon-es`.
2. Bake AO/lightmaps in Blender for static geometry and assign them as an `aoMap` in glTF or use lightmap UVs.
3. Add an asset CDN (S3 / Cloudflare) and serve large GLBs & HDRs via CDN. Keep initial bundle small and lazy-load when needed.
4. Integrate Sentry and a light analytics SDK; enable gzip/brotli on hosting.

---

If you want, I can:
- convert OrbitControls -> PointerLockControls + WASD movement
- add a fixed-timestep `cannon-es` physics sample
- set up a GitHub Actions workflow to build & deploy

Tell me which one you want next and I’ll update the repo.


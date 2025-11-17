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

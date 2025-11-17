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

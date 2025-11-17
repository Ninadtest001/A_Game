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

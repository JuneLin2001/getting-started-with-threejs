import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // 透明背景
document.body.appendChild(renderer.domElement);

// 初始化攝像機
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10
);
camera.position.z = 2;

// 初始化場景
const scene = new THREE.Scene();

// 初始化控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// 載入鳥的 3D 模型
let birdMesh;
let mixer; // 用於播放動畫
const loader = new GLTFLoader();
loader.load(
  "./low_poly_bird_animated.glb", // 替換為你的鳥模型文件路徑
  function (gltf) {
    birdMesh = gltf.scene;
    birdMesh.scale.set(0.1, 0.1, 0.1); // 調整鳥的大小
    birdMesh.position.set(0, 0, 0); // 將鳥設定在初始位置
    scene.add(birdMesh);

    // 設置動畫
    mixer = new THREE.AnimationMixer(birdMesh);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play(); // 播放所有動畫
    });
  },
  undefined,
  function (error) {
    console.error("Error loading bird model:", error);
  }
);

// 添加光源
const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

// 動畫循環
function animate(t = 0) {
  requestAnimationFrame(animate);

  // 更新動畫
  if (mixer) {
    mixer.update(0.01); // 更新動畫
  }

  // 渲染場景
  renderer.render(scene, camera);
  controls.update();
}

animate();

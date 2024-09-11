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

// 創建多邊形
const geo = new THREE.IcosahedronGeometry(1, 2);
const mat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  flatShading: true,
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// 創建線框
const wireMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001);
mesh.add(wireMesh);

// 載入鳥的 3D 模型
const loader = new GLTFLoader();
const birdMeshes = []; // 儲存所有的鳥模型
const mixers = []; // 儲存所有的 AnimationMixer

function loadBird() {
  loader.load(
    "./low_poly_bird_animated.glb", // 替換為你的鳥模型文件路徑
    function (gltf) {
      const birdMesh = gltf.scene;
      birdMesh.scale.set(0.01, 0.01, 0.01); // 調整鳥的大小
      birdMesh.speed = Math.random() * 0.001 + 0.0001; // 設定每隻鳥的速度
      birdMesh.birdRadius = Math.random() * (2.2 - 1.2) + 1.2; // 設定鳥的運行半徑範圍
      scene.add(birdMesh);

      // 設置動畫
      const mixer = new THREE.AnimationMixer(birdMesh);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play(); // 播放所有動畫
      });
      mixers.push(mixer); // 將 mixer 存儲到 mixers 陣列中
      birdMeshes.push(birdMesh); // 儲存鳥模型
    },
    undefined,
    function (error) {
      console.error("Error loading bird model:", error);
    }
  );
}

// 初始加載五隻鳥
for (let i = 0; i < 5; i++) {
  loadBird();
}

// 添加光源
const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

// 動畫循環
function animate(t = 0) {
  requestAnimationFrame(animate);

  // 旋轉多邊形
  mesh.rotation.y = t * 0.0001;

  // 讓所有的鳥圍繞多邊形運動，並且速度不同
  birdMeshes.forEach((birdMesh) => {
    const angle = t * birdMesh.speed; // 使用鳥的速度參數
    const birdRadius = birdMesh.birdRadius; // 使用鳥的隨機半徑

    birdMesh.position.set(
      birdRadius * Math.cos(angle), // X 軸位置
      0.5 * Math.sin(angle * 2), // Y 軸高度稍微變化
      birdRadius * Math.sin(angle) // Z 軸位置
    );
    birdMesh.rotation.y = t * 0.0005; // 讓鳥自己也有一些旋轉
  });

  // 更新所有的 AnimationMixer
  mixers.forEach((mixer) => mixer.update(0.01));

  // 渲染場景
  renderer.render(scene, camera);
  controls.update();
}

animate();

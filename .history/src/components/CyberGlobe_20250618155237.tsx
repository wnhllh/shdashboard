import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { AttackHotspot } from '@/types/data';

// --- START AGGREGATION HELPERS ---
const R_EARTH_KM = 6371; // Radius of the Earth in kilometers

function calculateGreatCircleDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const radLat1 = lat1 * Math.PI / 180;
  const radLat2 = lat2 * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_EARTH_KM * c; // Distance in kilometers
}

interface AggregatedHotspot {
  lat: number;
  lng: number;
  aggregatedValue: number;
  count: number;
  originalIndices: number[]; // To trace back if needed, or for unique keys
}

// Assuming AttackHotspot has at least: lat: number, lng: number, value: number
interface WorkingAttackHotspot extends AttackHotspot {
  originalIndex: number;
  clusterId: number;
}

const AGGREGATION_DISTANCE_THRESHOLD_KM = 200; // Aggregate points within 200km

function groupNearbyPoints(
  points: AttackHotspot[],
  thresholdKm: number
): AggregatedHotspot[] {
  if (!points || points.length === 0) {
    return [];
  }

  const workingPoints: WorkingAttackHotspot[] = points.map((p, index) => ({
    ...p,
    originalIndex: index,
    clusterId: -1,
  }));

  let clusterCounter = 0;
  for (let i = 0; i < workingPoints.length; i++) {
    if (workingPoints[i].clusterId !== -1) continue; // Already clustered

    // Start a new cluster (BFS/connected components)
    workingPoints[i].clusterId = clusterCounter;
    const currentClusterQueue = [workingPoints[i]];
    let head = 0;

    while (head < currentClusterQueue.length) {
      const currentPoint = currentClusterQueue[head++];
      for (let j = 0; j < workingPoints.length; j++) {
        if (workingPoints[j].clusterId !== -1) continue; // Already clustered or is currentPoint
        if (workingPoints[j].originalIndex === currentPoint.originalIndex) continue;

        const distance = calculateGreatCircleDistance(
          currentPoint.lat, currentPoint.lng,
          workingPoints[j].lat, workingPoints[j].lng
        );

        if (distance < thresholdKm) {
          workingPoints[j].clusterId = clusterCounter;
          currentClusterQueue.push(workingPoints[j]);
        }
      }
    }
    clusterCounter++;
  }

  const aggregatedClusters: AggregatedHotspot[] = [];
  for (let cId = 0; cId < clusterCounter; cId++) {
    const clusterPoints = workingPoints.filter(p => p.clusterId === cId);
    if (clusterPoints.length > 0) {
      const N = clusterPoints.length;
      const sumLat = clusterPoints.reduce((sum, p) => sum + p.lat, 0);
      const sumLng = clusterPoints.reduce((sum, p) => sum + p.lng, 0);
      const sumValue = clusterPoints.reduce((sum, p) => sum + p.value, 0);
      const originalIndices = clusterPoints.map(p => p.originalIndex);

      aggregatedClusters.push({
        lat: sumLat / N,
        lng: sumLng / N,
        aggregatedValue: sumValue,
        count: N,
        originalIndices,
      });
    }
  }
  return aggregatedClusters;
}
// --- END AGGREGATION HELPERS ---

// 简单的地理位置到国家的映射（可以扩展或使用更完整的地理数据库）
const getCountryFromCoords = (lat: number, lng: number): string => {
  // 这里可以集成更完整的地理数据库，现在提供一些主要区域的简单映射
  if (lat >= 49 && lat <= 71 && lng >= -168 && lng <= -141) return '美国 (阿拉斯加)';
  if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) return '美国';
  if (lat >= 41 && lat <= 83 && lng >= -141 && lng <= -52) return '加拿大';
  if (lat >= 14 && lat <= 33 && lng >= -118 && lng <= -86) return '墨西哥';
  if (lat >= 35 && lat <= 42 && lng >= 19 && lng <= 45) return '土耳其';
  if (lat >= 36 && lat <= 71 && lng >= 19 && lng <= 169) return '俄罗斯';
  if (lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135) return '中国';
  if (lat >= 24 && lat <= 46 && lng >= 129 && lng <= 146) return '日本';
  if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 131) return '韩国';
  if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) return '印度';
  if (lat >= 36 && lat <= 72 && lng >= -10 && lng <= 40) return '欧洲';
  if (lat >= 51 && lat <= 61 && lng >= -8 && lng <= 2) return '英国';
  if (lat >= 41 && lat <= 51 && lng >= -5 && lng <= 10) return '法国';
  if (lat >= 47 && lat <= 55 && lng >= 6 && lng <= 15) return '德国';
  if (lat >= -55 && lat <= 12 && lng >= -82 && lng <= -34) return '南美洲';
  if (lat >= -37 && lat <= 37 && lng >= -20 && lng <= 52) return '非洲';
  if (lat >= -47 && lat <= -10 && lng >= 113 && lng <= 154) return '澳大利亚';
  
  // 默认返回大洲级别的位置
  if (lat >= 10 && lat <= 72 && lng >= -10 && lng <= 180) return '亚洲';
  if (lat >= 35 && lat <= 72 && lng >= -25 && lng <= 45) return '欧洲';
  if (lat >= 15 && lat <= 72 && lng >= -170 && lng <= -30) return '北美洲';
  if (lat >= -55 && lat <= 15 && lng >= -82 && lng <= -30) return '南美洲';
  if (lat >= -35 && lat <= 40 && lng >= -20 && lng <= 55) return '非洲';
  if (lat >= -50 && lat <= -10 && lng >= 110 && lng <= 180) return '大洋洲';
  
  return '未知区域';
};

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number; 
  endLng: number; 
  color?: string | string[];
  label?: string;
}

interface CyberGlobeProps {
  arcsData: ArcData[];
  pointsData?: AttackHotspot[];
  width?: number;
  height?: number;
}

// NOTE: 使用 THREE.TubeGeometry 实现粗飞线以确保更好的视觉效果
interface AnimatedArcObject {
  curve: THREE.Curve<THREE.Vector3>;
  mesh: THREE.Mesh;
  glowMesh: THREE.Mesh; // 添加发光外壳
  material: THREE.ShaderMaterial; // 改为着色器材质
  glowMaterial: THREE.ShaderMaterial; // 发光外壳材质
  numPoints: number;
  startTime: number;
  animationDuration: number;
}

// 引入 three.meshline 以支持兼容所有浏览器的粗飞线

const GLOBE_RADIUS = 150; 

// Helper function to create a glowing sprite texture
// const createGlowTexture = (color: string, intensityMultiplier: number = 1) => { /* Function body removed as it was unused and causing errors */ };

const createHeatmapTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );

  // 渐变: 中心亮白 -> 红 -> 透明
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // 中心: 纯白不透明
  gradient.addColorStop(0.6, 'rgba(255, 0, 0, 0.7)'); // 中间: 炽红
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');   // 边缘: 完全透明的红

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const CyberGlobe: React.FC<CyberGlobeProps> = ({ arcsData, pointsData, width = 800, height = 600 }) => {
  console.log('CyberGlobe pointsData', pointsData);
  const mountRef = useRef<HTMLDivElement>(null); 
  const sceneRef = useRef<THREE.Scene | null>(null); 
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); 
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null); 
  const controlsRef = useRef<OrbitControls | null>(null); 
  const globeMeshRef = useRef<THREE.Mesh | null>(null); 
  const animationFrameIdRef = useRef<number | null>(null); 
  const topDirectionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const backgroundParticlesRef = useRef<THREE.Points | null>(null);
  const screenGlowMeshRef = useRef<THREE.Mesh | null>(null);
  const globeGlowMeshRef = useRef<THREE.Mesh | null>(null);

  const SHANGHAI_COORDS = { lat: 31.2304, lng: 121.4737, altitude: 0 }; 

  const customArcsRef = useRef<THREE.Group>(new THREE.Group());
  const animatedArcsRef = useRef<AnimatedArcObject[]>([]);
  const worldMapPointsRef = useRef<THREE.Points | null>(null); 
  const attackHotspotsGroupRef = useRef<THREE.Group>(new THREE.Group()); 
  const outerGlowMeshRef = useRef<THREE.Mesh | null>(null); // For outer edge glow
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null); // For outer atmosphere
  const countryBordersGroupRef = useRef<THREE.Group>(new THREE.Group()); // For country borders
  const debugLogStateRef = useRef({ hasLoggedEmpty: false, hasLoggedStart: false }); // For debug logging
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const hoveredHotspotRef = useRef<{hotspot: AggregatedHotspot, mesh: THREE.Mesh} | null>(null);
  const autoHoverIntervalRef = useRef<number | null>(null);
  const currentHoverIndexRef = useRef<number>(0);
  const guideLineRef = useRef<THREE.Line | null>(null);
  const aggregatedHotspotsRef = useRef<AggregatedHotspot[]>([]);

  const heatmapTexture = useMemo(() => createHeatmapTexture(), []);

  const latLngToVector3 = (lat: number, lng: number, radius: number, heightOffset = 0) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius + heightOffset) * Math.sin(phi) * Math.cos(theta);
    const z = (radius + heightOffset) * Math.sin(phi) * Math.sin(theta);
    const y = (radius + heightOffset) * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 2000);
    cameraRef.current = camera;
    // Set initial camera position so that Shanghai is facing the viewer
    const shanghaiVec = latLngToVector3(SHANGHAI_COORDS.lat, SHANGHAI_COORDS.lng, GLOBE_RADIUS, 0);
    // 取上海方向的单位向量，乘以地球半径的3倍，得到相机位置
    const camDistance = GLOBE_RADIUS * 2.4;
    const camPos = shanghaiVec.clone().normalize().multiplyScalar(camDistance);
    camera.position.copy(camPos);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); 
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = GLOBE_RADIUS * 1.2;
    controls.maxDistance = GLOBE_RADIUS * 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enablePan = false; // Disables panning
    controls.enableRotate = true; // Explicitly enable rotation
    controlsRef.current = controls;
    controls.target.set(0, 0, 0);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/images/earth_technical_night.jpg');

    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    // Rim Lighting Shader
    const globeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        globeTexture: { value: earthTexture },
        rimColor: { value: new THREE.Color(0x4ac6ff) }, // 晨曦蓝
        rimPower: { value: 2.5 }, // 锐利度
        rimStrength: { value: 1.1 }, // 强度
        rimDirection: { value: new THREE.Vector3(0, 1, 0).normalize() }, // 晨曦方向，默认北极
        rimAngle: { value: 0.725 }, // 控制晨曦覆盖范围（调大只留正上方有光晕）
        edgePower: { value: 6.0 },
        ambient: { value: 0.5 },
      },
      vertexShader: `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPosition.xyz);
          vUv = uv;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform sampler2D globeTexture;
        uniform vec3 rimColor;
        uniform float rimPower;
        uniform float rimStrength;
        uniform vec3 rimDirection;
        uniform float rimAngle;
        uniform float ambient;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec2 vUv;
        void main() {
          vec3 texColor = texture2D(globeTexture, vUv).rgb;
          // 让地球整体偏亮蓝色
          texColor = mix(texColor, vec3(0.35, 0.65, 1.0), 0.85); // 更纯净的蓝色，权重更高
          // Rim Lighting
          float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
          float ambientLevel = 0.38; // 适度提升环境光
          float lighting = ambientLevel + (1.0 - ambientLevel) * max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0);
          texColor *= lighting;

          rim = pow(rim, rimPower);
          // 定向晨曦mask，只在rimDirection方向出现
          float sunDot = max(dot(normalize(vNormal), rimDirection), 0.0);
          float sunMask = smoothstep(rimAngle, 1.0, sunDot); // rimAngle越大，晨曦覆盖越大
          // 主体色调和rim光混合
          vec3 color = texColor * ambient + rim * rimColor * rimStrength * sunMask;
          gl_FragColor = vec4(color, 0.28); // 更加透明
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeMesh.name = 'textured-earth-globe';
    scene.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // === Edge Glow Mesh（边缘光晕）===
    // 创建简单的大气层光晕效果
    
    // 晨曦方向边缘光晕（rim glow mesh，贴近地球边缘）
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.04, 128, 128);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        rimColor: { value: new THREE.Color(0x4ac6ff) },
        rimDirection: { value: new THREE.Vector3(0, 1, 0).normalize() },
        rimAngle: { value: 0.45 },
        edgePower: { value: 3.0 },
        glowStrength: { value: 1.3 },
        rimAlphaStrength: { value: 0.85 }
      },
      vertexShader: `
        precision mediump float;
        varying vec3 vNormalW;
        void main() {
          vNormalW = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 rimColor;
        uniform vec3 rimDirection;
        uniform float rimAngle;
        uniform float edgePower;
        uniform float glowStrength;
        uniform float rimAlphaStrength;
        varying vec3 vNormalW;
        void main() {
          float sunDot = dot(normalize(vNormalW), rimDirection);
          float sunMask = smoothstep(rimAngle, 1.0, sunDot);
          float edge = 1.0 - abs(sunDot);
          float edgeMask = pow(edge, edgePower);
          float glow = edgeMask * sunMask * glowStrength;
          float alpha = smoothstep(0.0, 0.5, glow * rimAlphaStrength); // 柔化过渡
          gl_FragColor = vec4(rimColor, alpha);
          if (gl_FragColor.a < 0.01) discard;
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereMesh.name = 'atmosphere-glow';
    scene.add(atmosphereMesh);

    // 外层Glow Mesh/halo（发光晕圈，空气散射/极光感）
    const haloGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.075, 128, 128);
    const haloMaterial = new THREE.ShaderMaterial({
      uniforms: {
        haloColor: { value: new THREE.Color(0x4ac6ff) },
        rimDirection: { value: new THREE.Vector3(0, 1, 0).normalize() },
        rimAngle: { value: 0.45 },
        haloPower: { value: 2.2 },
        haloStrength: { value: 0.27 }
      },
      vertexShader: `
        precision mediump float;
        varying vec3 vNormalW;
        void main() {
          vNormalW = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 haloColor;
        uniform vec3 rimDirection;
        uniform float rimAngle;
        uniform float haloPower;
        uniform float haloStrength;
        varying vec3 vNormalW;
        void main() {
          float sunDot = dot(normalize(vNormalW), rimDirection);
          float sunMask = smoothstep(rimAngle, 1.0, sunDot);
          float edge = 1.0 - abs(sunDot); // 球体边缘
          float edgeMask = pow(edge, haloPower);
          float halo = edgeMask * sunMask * haloStrength;
          float alpha = smoothstep(0.0, 0.5, halo); // 柔化过渡
          gl_FragColor = vec4(haloColor, alpha);
          if (gl_FragColor.a < 0.01) discard;
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
    haloMesh.name = 'halo-glow';
    scene.add(haloMesh);

    // 让大气层光晕稍微大一些
    outerGlowMeshRef.current = atmosphereMesh;
    
    // 内层边缘光晕 - 更贴近地球表面
    const innerGlowGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.05, 128, 128);
    const innerGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x88ccff) },
        coefficient: { value: 0.5 },
        power: { value: 3.0 },
        rimDirection: { value: new THREE.Vector3(0, 1, 0).normalize() }
      },
      vertexShader: `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 glowColor;
        uniform float coefficient;
        uniform float power;
        uniform vec3 rimDirection;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        
        void main() {
          // 边缘发光强度
          float intensity = pow(1.0 - abs(vNormal.z), power);
          
          // 方向性遮罩 - 只在上半部分发光
          float directionFactor = max(0.0, dot(vPositionNormal, rimDirection));
          directionFactor = smoothstep(0.0, 1.0, directionFactor);
          
          intensity *= directionFactor;
          
          vec3 glow = glowColor * coefficient * intensity;
          float alpha = smoothstep(0.0, 0.5, intensity * 0.8); // 柔化过渡
          gl_FragColor = vec4(glow, alpha);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    
    const innerGlowMesh = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    innerGlowMesh.name = 'inner-edge-glow';
    scene.add(innerGlowMesh);
    
    globeGlowMeshRef.current = innerGlowMesh;

    // Basic ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6); // 增强环境光
    scene.add(ambientLight);

    // Fixed directional light from above - this will be updated to always be 'top' in world coords
    const topDirectionalLight = new THREE.DirectionalLight(0x66aaff, 0.8); // 增强方向光
    topDirectionalLight.name = 'fixed-top-light';
    // 固定光源在地球的后上方
    topDirectionalLight.position.set(0, GLOBE_RADIUS * 3, -GLOBE_RADIUS * 3);
    topDirectionalLight.target.position.set(0, 0, 0);
    scene.add(topDirectionalLight);
    scene.add(topDirectionalLight.target); // 确保 target 被加入场景
    topDirectionalLightRef.current = topDirectionalLight;

    createBackgroundParticles(scene);
    createWorldMapPoints();
    // Create fixed screen-space glow effect - using a plane instead of sphere
    createScreenSpaceGlow(scene);
    // Create sphere edge glow - commented out as we're using the atmosphere glow above
    // createGlobeEdgeGlow(scene);

    if (pointsData && pointsData.length > 0) {
      createAttackMarkers(pointsData);
    }

    scene.add(customArcsRef.current);
    scene.add(attackHotspotsGroupRef.current);
    scene.add(countryBordersGroupRef.current); 

        // 创建科幻风格的tooltip元素 - 极致轻盈科幻
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.top = '20px';
    tooltip.style.left = '20px';
    tooltip.style.width = '180px'; // 更窄
    tooltip.style.background = 'linear-gradient(160deg, rgba(5,12,25,0.82) 0%, rgba(10,22,40,0.78) 100%)';
    tooltip.style.color = '#eaf6ff';
    tooltip.style.padding = '0';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '9px';
    tooltip.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '1000';
    tooltip.style.display = 'none';
    tooltip.style.border = '1.2px solid rgba(0,180,255,0.18)';
    tooltip.style.boxShadow = '0 0 10px #00e0ff33, 0 2px 8px #001a2a55, 0 0 0 #fff0';
    tooltip.style.backdropFilter = 'blur(8px)';
    tooltip.style.transform = 'translateY(0)';
    tooltip.style.transition = 'all 0.18s cubic-bezier(0.4,0,0.2,1)';
    tooltip.style.overflow = 'hidden';
    tooltip.style.fontWeight = '300';
    tooltip.style.lineHeight = '1.22';
    currentMount.appendChild(tooltip);
    tooltipRef.current = tooltip;

    // 自动hover系统
    const setHotspotHover = (hotspotIndex: number | null) => {
      // 彻底清理所有蓝色虚线
      scene.children
        .filter(obj => {
          if (obj.type !== 'Line') return false;
          const mat = (obj as THREE.Line).material;
          return Array.isArray(mat)
            ? false
            : mat && (mat as THREE.Material).type === 'LineDashedMaterial';
        })
        .forEach(lineObj => {
          const line = lineObj as THREE.Line;
          scene.remove(line);
          if (line.geometry) line.geometry.dispose();
          if (line.material && !Array.isArray(line.material)) (line.material as THREE.Material).dispose();
        });
      guideLineRef.current = null;

      // 重置所有热点状态
      attackHotspotsGroupRef.current.children.forEach(child => {
        if (child.userData.isHotspot) {
          child.userData.isHovered = false;
          // 恢复所有mesh的原始材质和大小
          const meshes = child.userData.meshes;
          const defaultMaterials = child.userData.defaultMaterials;
          const originalScales = child.userData.originalScales;
          
          if (meshes && defaultMaterials && originalScales) {
            // 恢复所有材质
            meshes.heatmapCone.material = defaultMaterials.heatmap;
            meshes.coreBeam.material = defaultMaterials.coreBeam;
            meshes.outerBeam.material = defaultMaterials.outerBeam;
            meshes.topGlow.material = defaultMaterials.topGlow;
            
            // 恢复所有mesh的原始scale（不影响位置）
            meshes.heatmapCone.scale.copy(originalScales.heatmapCone);
            meshes.coreBeam.scale.copy(originalScales.coreBeam);
            meshes.outerBeam.scale.copy(originalScales.outerBeam);
            meshes.topGlow.scale.copy(originalScales.topGlow);
          }
        }
      });

      // 隐藏tooltip
      tooltip.style.display = 'none';

      // 如果有指定的热点，设置hover状态
      if (hotspotIndex !== null && aggregatedHotspotsRef.current[hotspotIndex]) {
        const hotspotData = aggregatedHotspotsRef.current[hotspotIndex];
        const hotspotGroup = attackHotspotsGroupRef.current.children.find(
          child => child.userData.hotspotIndex === hotspotIndex
        ) as THREE.Group;

        if (hotspotGroup) {
          // 设置hover状态
          hotspotGroup.userData.isHovered = true;
          
          const meshes = hotspotGroup.userData.meshes;
          const hoverMaterials = hotspotGroup.userData.hoverMaterials;
          
          if (meshes && hoverMaterials) {
            // 改变所有mesh为蓝色hover材质
            meshes.heatmapCone.material = hoverMaterials.heatmap;
            meshes.coreBeam.material = hoverMaterials.coreBeam;
            meshes.outerBeam.material = hoverMaterials.outerBeam;
            meshes.topGlow.material = hoverMaterials.topGlow;
            
            // 放大所有mesh（不影响位置）
            const scaleMultiplier = 1.3;
            meshes.heatmapCone.scale.multiplyScalar(scaleMultiplier);
            meshes.coreBeam.scale.multiplyScalar(scaleMultiplier);
            meshes.outerBeam.scale.multiplyScalar(scaleMultiplier);
            meshes.topGlow.scale.multiplyScalar(scaleMultiplier);
          }

          // 计算引导线
          const hotspotWorldPos = latLngToVector3(hotspotData.lat, hotspotData.lng, GLOBE_RADIUS);
          
          // 将屏幕左上角位置转换为3D世界坐标
          const screenTooltipPos = new THREE.Vector2(-0.85, 0.7); // 左上角的标准化设备坐标
          const tooltipWorldPos = new THREE.Vector3();
          tooltipWorldPos.set(screenTooltipPos.x, screenTooltipPos.y, 0.5).unproject(cameraRef.current!);
          
          // 计算从相机到tooltip的方向，延伸到适当距离
          const cameraPos = cameraRef.current!.position;
          const directionToTooltip = tooltipWorldPos.sub(cameraPos).normalize();
          const tooltipDistance = GLOBE_RADIUS * 1.6;
          const finalTooltipPos = cameraPos.clone().add(directionToTooltip.multiplyScalar(tooltipDistance));

          // 创建引导虚线
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            hotspotWorldPos.clone().multiplyScalar(1.02), // 热点位置稍微外扩
            finalTooltipPos
          ]);
          const lineMaterial = new THREE.LineDashedMaterial({
            color: 0x00ffff,
            dashSize: 2,
            gapSize: 1,
            transparent: true,
            opacity: 0.8
          });
          guideLineRef.current = new THREE.Line(lineGeometry, lineMaterial);
          guideLineRef.current.computeLineDistances();
          scene.add(guideLineRef.current);

          // 更新tooltip内容
          const country = getCountryFromCoords(hotspotData.lat, hotspotData.lng);
          const threatLevel = hotspotData.aggregatedValue > 50 ? '高危' : hotspotData.aggregatedValue > 20 ? '中危' : '低危';
          const threatColor = hotspotData.aggregatedValue > 50 ? '#00e0ff' : hotspotData.aggregatedValue > 20 ? '#00bfff' : '#1e90ff';
          
          // 生成模拟的攻击统计数据
          const attackFrequency = Math.floor(hotspotData.aggregatedValue * 0.8 + Math.random() * 40); // 攻击频次/小时
          const peakTime = ['02:15', '14:32', '20:48', '08:23', '16:05'][Math.floor(Math.random() * 5)]; // 随机峰值时间
          const avgDuration = (Math.random() * 180 + 30).toFixed(0); // 平均持续时间(秒)
          const successRate = (Math.random() * 15 + 2).toFixed(1); // 成功率
          const attackTypes = ['DDoS', 'SQL注入', '暴力破解', '钓鱼攻击', '恶意扫描'];
          const mainAttackType = attackTypes[Math.floor(hotspotData.aggregatedValue / 20) % attackTypes.length];
          const blockRate = (97 + Math.random() * 2.8).toFixed(1); // 拦截率
          
          tooltip.innerHTML = `
            <div style="
              background: linear-gradient(160deg, rgba(0,32,64,0.18) 0%, rgba(0,64,128,0.10) 100%); padding: 7px 12px 5px 12px; border-bottom: 1px solid rgba(0,180,255,0.13); position: relative;">
              <div style="font-size: 13px; font-weight: 700; color: #00e0ff; text-shadow: 0 0 8px #00e0ff88, 0 0 2px #fff; letter-spacing: 0.5px; margin-bottom: 1px;">全球网络攻击监控</div>
              <div style="font-size: 8px; color: #b6eaff; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 2px;">实时监控系统</div>
            </div>
            <div style="padding: 7px 12px 7px 12px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">地理位置</span>
                <span style="color: #eaf6ff; font-weight: 400; font-size: 9px;">${country}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">攻击次数</span>
                <span style="color: #fff; font-weight: 600; font-size: 9px; font-family: 'SF Mono', monospace;">${hotspotData.count}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">攻击频率</span>
                <span style="color: #00e0ff; font-weight: 500; font-size: 9px; font-family: 'SF Mono', monospace;">${attackFrequency}/小时</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">主要类型</span>
                <span style="color: #00bfff; font-weight: 500; font-size: 9px;">${mainAttackType}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">峰值时间</span>
                <span style="color: #00e0ff; font-weight: 500; font-size: 9px; font-family: 'SF Mono', monospace;">${peakTime}</span>
              </div>
              <div style="height: 0.5px; background: linear-gradient(90deg, transparent 0%, #00e0ff22 50%, transparent 100%); margin: 2px 0;"></div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">平均持续</span>
                <span style="color: #00e0ff; font-weight: 500; font-size: 9px; font-family: 'SF Mono', monospace;">${avgDuration}s</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">成功率</span>
                <span style="color: #00e0ff; font-weight: 500; font-size: 9px; font-family: 'SF Mono', monospace;">${successRate}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">拦截率</span>
                <span style="color: #00ffea; font-weight: 600; font-size: 9px; font-family: 'SF Mono', monospace;">${blockRate}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">统计周期</span>
                <span style="color: #00e0ff; font-weight: 500; font-size: 9px; font-family: 'SF Mono', monospace;">24小时</span>
              </div>
              <div style="height: 0.5px; background: linear-gradient(90deg, transparent 0%, #00e0ff22 50%, transparent 100%); margin: 2px 0;"></div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #7fd6ff; font-size: 8.5px;">威胁强度</span>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <div style="width: 26px; height: 1.5px; background: #00e0ff22; border-radius: 1px; overflow: hidden;">
                    <div style="width: ${Math.min(100, (hotspotData.aggregatedValue / 100) * 100)}%; height: 100%; background: linear-gradient(90deg, ${threatColor} 0%, #00e0ff99 100%); transition: width 0.3s ease;"></div>
                  </div>
                  <span style="color: ${threatColor}; font-weight: 700; font-size: 8.5px;">${threatLevel}</span>
                </div>
              </div>
            </div>
          `;

          tooltip.style.display = 'block';
          tooltip.style.transform = 'translateY(0)';
        }
      }
    };

    // 启动自动hover循环
    const startAutoHover = () => {
      if (aggregatedHotspotsRef.current.length === 0) return;

      const cycleHover = () => {
        if (aggregatedHotspotsRef.current.length === 0) return;
        
        setHotspotHover(currentHoverIndexRef.current);
        currentHoverIndexRef.current = (currentHoverIndexRef.current + 1) % aggregatedHotspotsRef.current.length;
        
        autoHoverIntervalRef.current = window.setTimeout(cycleHover, 3000); // 每3秒切换
      };

      // 开始第一次hover
      cycleHover();
    };

    // 在热点创建后启动自动hover
    setTimeout(() => {
      startAutoHover();
    }, 1000);

    // Function to create country borders from GeoJSON
    const createCountryBorders = (geoJsonData: any) => {
      if (!sceneRef.current) return;

      countryBordersGroupRef.current.clear(); 
      countryBordersGroupRef.current.children.forEach(child => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose(); 
        }
      });

      const borderMaterial = new THREE.LineBasicMaterial({ 
        color: 0x6644ff,  // 深蓝紫色，更有科幻感
        transparent: true,
        opacity: 0.85,    // 稍微降低透明度，增强存在感
        linewidth: 1 
      });

      const borderGlowMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ffaa,  // 青绿色发光，科幻感强烈
        transparent: true,
        opacity: 0.6,     // 增强发光效果
        linewidth: 1 
      });

      geoJsonData.features.forEach((feature: any) => {
        const { geometry } = feature;
        if (!geometry) return;

        const processCoordinates = (coordsArray: any[]) => {
          const points: THREE.Vector3[] = [];
          const glowPoints: THREE.Vector3[] = [];
          
          coordsArray.forEach(([lng, lat]: [number, number]) => {
            points.push(latLngToVector3(lat, lng, GLOBE_RADIUS, 1.0)); // 增加高度偏移到1.0，使线条更突出
            glowPoints.push(latLngToVector3(lat, lng, GLOBE_RADIUS, 0.8)); // 稍微低一点的发光层
          });
          
          if (points.length > 1) {
            // 创建主线条（更亮更清晰）
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, borderMaterial.clone()); 
            countryBordersGroupRef.current.add(line);

            // 创建发光外层
            const glowGeometry = new THREE.BufferGeometry().setFromPoints(glowPoints);
            const glowLine = new THREE.Line(glowGeometry, borderGlowMaterial.clone());
            countryBordersGroupRef.current.add(glowLine);
          }
        };

        if (geometry.type === 'Polygon') {
          geometry.coordinates.forEach((polygonRing: any[]) => {
            processCoordinates(polygonRing);
          });
        } else if (geometry.type === 'MultiPolygon') {
          geometry.coordinates.forEach((multiPolygonPart: any[][]) => {
            multiPolygonPart.forEach((polygonRing: any[]) => {
              processCoordinates(polygonRing);
            });
          });
        } else if (geometry.type === 'MultiLineString') {
          geometry.coordinates.forEach((lineString: any[]) => { 
            processCoordinates(lineString);
          });
        } else if (geometry.type === 'LineString') {
          processCoordinates(geometry.coordinates); 
        }
      });
    };

    // Fetch GeoJSON data for country borders
    fetch('/data/coastlines.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for /data/coastlines.geojson`);
        }
        return response.json();
      })
      .then(data => {
        createCountryBorders(data);
      })
      .catch(error => {
        console.error("Could not load or parse country borders GeoJSON:", error);
      });

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      updateArcAnimations(); 

      if (cameraRef.current) {
        // Update camera-facing spotlight position
        const cameraDirection = new THREE.Vector3();
        cameraRef.current.getWorldDirection(cameraDirection);

        // Calculate camera's visual "up" vector in world space
        const worldUp = new THREE.Vector3(0, 1, 0); // Standard world up
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, worldUp).normalize();
        
        // If camera is looking straight up or down, cameraRight might be zero.
        // In such cases, use camera.up as a fallback for visual up.
        const actualUp = new THREE.Vector3();
        if (cameraRight.lengthSq() < 0.001) { // Check if cameraRight is near zero vector
            actualUp.copy(cameraRef.current.up); // Use camera's local up vector
        } else {
            actualUp.crossVectors(cameraRight, cameraDirection).normalize();
        }

        // Update edge glow uniforms
        if (outerGlowMeshRef.current) {
          const material = outerGlowMeshRef.current.material as THREE.ShaderMaterial;
          if (material.uniforms && material.uniforms.viewVector) {
            material.uniforms.viewVector.value.copy(cameraRef.current.position);
          }
        }

        // Update screen-space glow position to stay fixed at screen top
        if (screenGlowMeshRef.current) {
          // Position it at the top of the screen in screen-space coordinates
          screenGlowMeshRef.current.position.set(0, 0.4, -1); // Adjusted to ensure it's at the top
        }

        // Render the screen-space fixed glow on top
        if ((window as any).renderScreenSpaceGlow) {
          (window as any).renderScreenSpaceGlow();
        }
      }

      // Finally render main scene
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && mountRef.current) {
        const newWidth = mountRef.current.clientWidth;
        const newHeight = mountRef.current.clientHeight;
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      // 清理自动hover定时器
      if (autoHoverIntervalRef.current) {
        clearTimeout(autoHoverIntervalRef.current);
      }
      
      // 移除引导线
      if (guideLineRef.current) {
        scene.remove(guideLineRef.current);
      }
      
      // 移除tooltip
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
      }
      if (rendererRef.current && mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
      if (globeMaterial) globeMaterial.dispose();
      if (globeGeometry) globeGeometry.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
      customArcsRef.current.children.forEach(child => { 
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      if (worldMapPointsRef.current) {
        if (worldMapPointsRef.current.parent) worldMapPointsRef.current.parent.remove(worldMapPointsRef.current);
        worldMapPointsRef.current.geometry.dispose();
        (worldMapPointsRef.current.material as THREE.Material).dispose();
      }
      if (attackHotspotsGroupRef.current) {
        attackHotspotsGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Group) { 
            child.children.forEach(mesh => {
              if (mesh instanceof THREE.Mesh) {
                mesh.geometry.dispose();
                if (Array.isArray(mesh.material)) {
                  (mesh.material as THREE.Material[]).forEach(mat => mat.dispose());
                } else {
                  (mesh.material as THREE.Material).dispose();
                }
              }
            });
          }
        });
        if (attackHotspotsGroupRef.current.parent) attackHotspotsGroupRef.current.parent.remove(attackHotspotsGroupRef.current);
      }
      if (globeGlowMeshRef.current) {
        if (globeGlowMeshRef.current.parent) globeGlowMeshRef.current.parent.remove(globeGlowMeshRef.current);
        globeGlowMeshRef.current.geometry.dispose();
        (globeGlowMeshRef.current.material as THREE.ShaderMaterial).dispose();
      }
      if (outerGlowMeshRef.current) {
        if (outerGlowMeshRef.current.parent) outerGlowMeshRef.current.parent.remove(outerGlowMeshRef.current);
        outerGlowMeshRef.current.geometry.dispose();
        (outerGlowMeshRef.current.material as THREE.ShaderMaterial).dispose();
      }
      if (atmosphereMeshRef.current) {
        if (atmosphereMeshRef.current.parent) atmosphereMeshRef.current.parent.remove(atmosphereMeshRef.current);
        atmosphereMeshRef.current.geometry.dispose();
        (atmosphereMeshRef.current.material as THREE.ShaderMaterial).dispose();
      }
      if (screenGlowMeshRef.current) {
        if (screenGlowMeshRef.current.parent) screenGlowMeshRef.current.parent.remove(screenGlowMeshRef.current);
        screenGlowMeshRef.current.geometry.dispose();
        (screenGlowMeshRef.current.material as THREE.ShaderMaterial).dispose();
      }
      if (backgroundParticlesRef.current) {
        if (backgroundParticlesRef.current.parent) backgroundParticlesRef.current.parent.remove(backgroundParticlesRef.current);
        backgroundParticlesRef.current.geometry.dispose();
        (backgroundParticlesRef.current.material as THREE.PointsMaterial).dispose();
      }
      countryBordersGroupRef.current.children.forEach(child => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose(); 
        }
      });
      if (countryBordersGroupRef.current.parent) {
        countryBordersGroupRef.current.parent.remove(countryBordersGroupRef.current);
      }
    };
  }, []); 

  const createCustomArcs = useCallback(() => {
    console.log('[CyberGlobe Debug] createCustomArcs called');
    console.log('[CyberGlobe Debug] sceneRef.current:', !!sceneRef.current);
    console.log('[CyberGlobe Debug] globeMeshRef.current:', !!globeMeshRef.current);
    console.log('[CyberGlobe Debug] arcsData:', arcsData);
    console.log('[CyberGlobe Debug] arcsData length:', arcsData?.length || 0);
    
    if (!sceneRef.current || !globeMeshRef.current) {
      console.log('[CyberGlobe Debug] Missing scene or globe mesh, returning');
      return;
    }

    animatedArcsRef.current.forEach(arcObj => {
      if (arcObj.mesh.parent) arcObj.mesh.parent.remove(arcObj.mesh);
      if (arcObj.glowMesh.parent) arcObj.glowMesh.parent.remove(arcObj.glowMesh);
      arcObj.material.dispose();
      arcObj.glowMaterial.dispose();
      // 释放几何体
      if (arcObj.mesh.geometry) {
        arcObj.mesh.geometry.dispose();
      }
      if (arcObj.glowMesh.geometry) {
        arcObj.glowMesh.geometry.dispose();
      }
    });
    animatedArcsRef.current = [];
    while (customArcsRef.current.children.length > 0) {
      customArcsRef.current.remove(customArcsRef.current.children[0]);
    }

    const shanghaiPointVec = latLngToVector3(SHANGHAI_COORDS.lat, SHANGHAI_COORDS.lng, GLOBE_RADIUS, GLOBE_RADIUS * 0.005); 
    console.log('[CyberGlobe Debug] Shanghai position:', shanghaiPointVec);

    // 如果没有 arcsData 或为空，创建一个测试飞线
    if (!arcsData || arcsData.length === 0) {
      console.log('[CyberGlobe Debug] No arcs data, creating test arc');
      const testStartVec = latLngToVector3(40.7128, -74.0060, GLOBE_RADIUS, GLOBE_RADIUS * 0.005); // New York
      const controlPointDistance = testStartVec.distanceTo(shanghaiPointVec) * 0.25;
      const midPoint = new THREE.Vector3().addVectors(testStartVec, shanghaiPointVec).multiplyScalar(0.5);
      const controlPoint = midPoint.clone().normalize().multiplyScalar(GLOBE_RADIUS + controlPointDistance);
      
      const curve = new THREE.QuadraticBezierCurve3(testStartVec, controlPoint, shanghaiPointVec);
      
      // 创建初始的管状几何体（很短，用于初始化）
      const initialPoints = curve.getPoints(2);
      const initialCurve = new THREE.CatmullRomCurve3(initialPoints);
      const tubeGeometry = new THREE.TubeGeometry(initialCurve, 8, 0.2, 6, false);
      
      // 测试飞线 - 使用相同的科幻发光着色器
      const testTubeMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          glowColor: { value: new THREE.Color(0xff3333) },
          intensity: { value: 1.5 }
        },
        vertexShader: `
          precision mediump float;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          uniform float time;
          uniform vec3 glowColor;
          uniform float intensity;
          varying vec2 vUv;
          varying vec3 vNormal;
          
          void main() {
            float flow = sin(vUv.x * 10.0 - time * 3.0) * 0.5 + 0.5;
            float glow = pow(flow, 2.0) * intensity;
            vec3 color = glowColor * (1.0 + glow);
            float alpha = 0.8 + glow * 0.2;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const testTubeMesh = new THREE.Mesh(tubeGeometry, testTubeMaterial);
      
      // 测试飞线的光晕
      const testGlowGeometry = new THREE.TubeGeometry(initialCurve, 8, 0.45, 6, false);
      const testGlowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          glowColor: { value: new THREE.Color(0x66aaff) },
          intensity: { value: 0.8 }
        },
        vertexShader: `
          precision mediump float;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          uniform float time;
          uniform vec3 glowColor;
          uniform float intensity;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          void main() {
            float radialDist = length(vPosition.xy) / 0.45;
            float radialFalloff = 1.0 - smoothstep(0.3, 1.0, radialDist);
            float pulse = sin(time * 2.0) * 0.3 + 0.7;
            float glowStrength = radialFalloff * pulse * intensity;
            vec3 color = glowColor * glowStrength;
            float alpha = glowStrength * 0.6;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const testGlowMesh = new THREE.Mesh(testGlowGeometry, testGlowMaterial);
      
      customArcsRef.current.add(testTubeMesh);
      customArcsRef.current.add(testGlowMesh);
      console.log('[CyberGlobe Debug] Test tube arc with glow created and added');
      
      animatedArcsRef.current.push({
        curve: curve,
        mesh: testTubeMesh,
        glowMesh: testGlowMesh,
        material: testTubeMaterial,
        glowMaterial: testGlowMaterial,
        numPoints: 50,
        startTime: Date.now(),
        animationDuration: 2000
      });
      
      console.log('[CyberGlobe Debug] Test tube arc added to animation array');
      return;
    }

    arcsData.forEach((arc, index) => {
      console.log(`[CyberGlobe Debug] Creating arc ${index}:`, arc);
      
      const startVec = latLngToVector3(arc.startLat, arc.startLng, GLOBE_RADIUS, GLOBE_RADIUS * 0.005);
      const endVec = shanghaiPointVec;

      const controlPointDistance = startVec.distanceTo(endVec) * 0.5;
      const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
      const controlPoint = midPoint.clone().normalize().multiplyScalar(GLOBE_RADIUS + controlPointDistance);

      const curve = new THREE.QuadraticBezierCurve3(startVec, controlPoint, endVec);
      
      console.log(`[CyberGlobe Debug] Arc ${index} - Curve created`);
      
      // 创建初始的管状几何体（很短，用于初始化）
      const initialPoints = curve.getPoints(2);
      const initialCurve = new THREE.CatmullRomCurve3(initialPoints);
      const tubeGeometry = new THREE.TubeGeometry(initialCurve, 8, 0.16, 6, false);
      
      // 科幻发光核心线 - 使用着色器材质
      const tubeMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          glowColor: { value: new THREE.Color(0xff3333) },
          intensity: { value: 1.5 }
        },
        vertexShader: `
          precision mediump float;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          uniform float time;
          uniform vec3 glowColor;
          uniform float intensity;
          varying vec2 vUv;
          varying vec3 vNormal;
          
          void main() {
            // 创建能量流动效果
            float flow = sin(vUv.x * 10.0 - time * 3.0) * 0.5 + 0.5;
            
            // 核心发光
            float glow = pow(flow, 2.0) * intensity;
            
            vec3 color = glowColor * (1.0 + glow);
            float alpha = 0.8 + glow * 0.2;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });

      const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      
      // 外层能量光晕 - 多层光晕效果
      const glowGeometry = new THREE.TubeGeometry(initialCurve, 8, 0.45, 6, false);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          glowColor: { value: new THREE.Color(0x66aaff) },
          intensity: { value: 0.8 }
        },
        vertexShader: `
          precision mediump float;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          uniform float time;
          uniform vec3 glowColor;
          uniform float intensity;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          void main() {
            // 径向衰减
            float radialDist = length(vPosition.xy) / 0.45;
            float radialFalloff = 1.0 - smoothstep(0.3, 1.0, radialDist);
            
            // 能量脉冲
            float pulse = sin(time * 2.0) * 0.3 + 0.7;
            
            // 光晕强度
            float glowStrength = radialFalloff * pulse * intensity;
            
            vec3 color = glowColor * glowStrength;
            float alpha = glowStrength * 0.6;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      
      customArcsRef.current.add(tubeMesh);
      customArcsRef.current.add(glowMesh);
      
      console.log(`[CyberGlobe Debug] Arc ${index} - Tube mesh with glow created and added`);

      animatedArcsRef.current.push({
        curve: curve,
        mesh: tubeMesh,
        glowMesh: glowMesh,
        material: tubeMaterial,
        glowMaterial: glowMaterial,
        numPoints: 50,
        startTime: Date.now() + index * 100,
        animationDuration: 2000 + Math.random() * 1000
      });
    });
    
    console.log('[CyberGlobe Debug] Total animated tube arcs created:', animatedArcsRef.current.length);
    console.log('[CyberGlobe Debug] customArcsRef children count:', customArcsRef.current.children.length);
  }, [arcsData, SHANGHAI_COORDS]);

  useEffect(() => {
    console.log('[CyberGlobe Debug] useEffect for createCustomArcs triggered');
    console.log('[CyberGlobe Debug] sceneRef.current:', !!sceneRef.current);
    console.log('[CyberGlobe Debug] globeMeshRef.current:', !!globeMeshRef.current);
    console.log('[CyberGlobe Debug] arcsData exists:', !!arcsData);
    console.log('[CyberGlobe Debug] arcsData length:', arcsData?.length || 0);
    console.log('[CyberGlobe Debug] arcsData content:', arcsData);
    
    if (sceneRef.current && globeMeshRef.current && arcsData && arcsData.length > 0) {
      console.log('[CyberGlobe Debug] All conditions met, calling createCustomArcs');
      createCustomArcs();
    } else {
      console.log('[CyberGlobe Debug] Conditions not met for createCustomArcs');
      if (!sceneRef.current) console.log('[CyberGlobe Debug] - Missing sceneRef.current');
      if (!globeMeshRef.current) console.log('[CyberGlobe Debug] - Missing globeMeshRef.current');
      if (!arcsData) console.log('[CyberGlobe Debug] - Missing arcsData');
      if (arcsData && arcsData.length === 0) console.log('[CyberGlobe Debug] - arcsData is empty');
    }
  }, [arcsData, createCustomArcs]);

  const memoizedPointsData = useMemo(() => pointsData, [pointsData]);

  const maxVal = useMemo(() => 
    memoizedPointsData && memoizedPointsData.length > 0 
      ? Math.max(...memoizedPointsData.map(d => d.value))
      : 1
  , [memoizedPointsData]);

  const createWorldMapPoints = useCallback(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (worldMapPointsRef.current && worldMapPointsRef.current.parent) {
      worldMapPointsRef.current.parent.remove(worldMapPointsRef.current);
      (worldMapPointsRef.current.geometry as THREE.BufferGeometry).dispose();
      (worldMapPointsRef.current.material as THREE.Material).dispose();
      worldMapPointsRef.current = null;
    }

    const dotSphereRadius = GLOBE_RADIUS * 1.005; 

    const loadWorldImage = () => {
      const image = new Image();
      image.onload = () => {
        const imageCanvas = document.createElement('canvas');
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        const context = imageCanvas.getContext('2d');
        if (!context) return;
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        
        const activePointsCoords: {lat: number, lng: number}[] = [];
        const imageWidth = imageCanvas.width;
        const imageHeight = imageCanvas.height;

        for(let y = 0; y < imageHeight; y++) {
          for(let x = 0; x < imageWidth; x++) {
            const i = (y * imageWidth + x) * 4;
            const red = imageData.data[i];
            if(red < 128) { 
              const lng = -180 + (x / imageWidth) * 360;
              const lat = 90 - (y / imageHeight) * 180;
              activePointsCoords.push({lat, lng});
            }
          }
        }
        
        const positions: number[] = [];
        const smallOffset = 0.05; 
        const verySmallOffset = smallOffset * 0.2; 

        const s1 = smallOffset * 0.5; 
        const s2 = smallOffset * 1.5; 

        const offsetPairs = [ 
          [s1, s1], [s1, -s1], [-s1, s1], [-s1, -s1],
          [s1, s2], [s1, -s2], [-s1, s2], [-s1, -s2],
          [s2, s1], [s2, -s1], [-s2, s1], [-s2, -s1],
          [s2, s2], [s2, -s2], [-s2, s2], [-s2, -s2]
        ];

        activePointsCoords.forEach(point => {
          offsetPairs.forEach(clusterCenterOffset => {
            const clusterLat = point.lat + clusterCenterOffset[0];
            const clusterLng = point.lng + clusterCenterOffset[1];

            const subOffsetsLat = [ 
              -verySmallOffset * 1.5, 
              -verySmallOffset * 0.5, 
              verySmallOffset * 0.5, 
              verySmallOffset * 1.5
            ];
            const subOffsetsLng = [
              -verySmallOffset * 1.5, 
              -verySmallOffset * 0.5, 
              verySmallOffset * 0.5, 
              verySmallOffset * 1.5
            ];

            for (const dLat of subOffsetsLat) {
              for (const dLng of subOffsetsLng) {
                const vector = latLngToVector3(
                  clusterLat + dLat,
                  clusterLng + dLng,
                  dotSphereRadius
                );
                positions.push(vector.x, vector.y, vector.z);
              }
            }
          });
        });
        
        const dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const pointsMaterial = new THREE.PointsMaterial({
          size: 0.05,                     
          color: 0x222233, 
          transparent: true,
          opacity: 0.1, 
          blending: THREE.NormalBlending,
          depthWrite: false,
          sizeAttenuation: true,
        });
        
        worldMapPointsRef.current = new THREE.Points(dotGeometry, pointsMaterial);
        worldMapPointsRef.current.name = 'custom-world-map-points';
        scene.add(worldMapPointsRef.current);
      };
      image.onerror = () => {
        console.error('Failed to load world map image for points.');
      };
      image.src = '/images/world_alpha_mini.jpg'; 
    };
    
    loadWorldImage();
  }, [latLngToVector3]); 

  // Function to create attack markers (hotspots)
  const createAttackMarkers = useCallback((attackData: AttackHotspot[]) => {
    if (!sceneRef.current || !attackHotspotsGroupRef.current || !heatmapTexture) return;

    // 清理旧标记
    attackHotspotsGroupRef.current.children.forEach(child => {
      if (child instanceof THREE.Group) {
        child.children.forEach(mesh => {
        if (mesh instanceof THREE.Mesh) {
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            (mesh.material as THREE.Material[]).forEach(mat => mat.dispose());
          } else {
            (mesh.material as THREE.Material).dispose();
          }
        }
      });
      }
    });
    attackHotspotsGroupRef.current.clear();
    // console.log('[CyberGlobe] createAttackMarkers called with original data:', attackData);

    const aggregatedHotspots = groupNearbyPoints(attackData, AGGREGATION_DISTANCE_THRESHOLD_KM);
    // console.log('[CyberGlobe] Aggregated Hotspots:', aggregatedHotspots);
    
    // 保存聚合的热点数据供自动hover使用
    aggregatedHotspotsRef.current = aggregatedHotspots;

    if (aggregatedHotspots.length === 0) {
      if (attackHotspotsGroupRef.current && attackHotspotsGroupRef.current.parent) {
        // Ensure the group is still added to the scene even if empty, or handle as needed
      } else if (sceneRef.current) {
        sceneRef.current.add(attackHotspotsGroupRef.current);
      }
      return; // No hotspots to draw
    }

    // Re-calculate maxVal based on aggregated values for consistent height scaling
    const maxAggregatedVal = Math.max(...aggregatedHotspots.map(h => h.aggregatedValue), 1);

    // 创建一个共享的热力图材质模板
    const sharedHeatmapMaterial = new THREE.MeshBasicMaterial({
      map: heatmapTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 创建曲线圆锥几何体的函数
    const createCurvedConeGeometry = (baseRadius: number, topRadius: number, height: number, radialSegments: number = 8, heightSegments: number = 16) => {
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      // 曲线函数：使用平滑的S曲线来定义轮廓
      const getCurvedRadius = (t: number) => {
        // t从0(底部)到1(顶部)
        // 使用一个平滑的曲线函数，中间收缩创造"腰身"效果
        const curve = 0.5 - 0.5 * Math.cos(t * Math.PI); // 正弦曲线，创造中间收缩效果
        const easeInOut = t * t * (3.0 - 2.0 * t); // 平滑过渡
        
        // 混合线性插值和曲线效果
        const linearRadius = baseRadius * (1 - easeInOut) + topRadius * easeInOut;
        const curvedFactor = 1.0 - 0.4 * curve; // 最大收缩40%，创造明显腰身
        
        return linearRadius * curvedFactor;
      };

      // 生成顶点
      for (let y = 0; y <= heightSegments; y++) {
        // const heightScale = 0.1 + (aggPoint.aggregatedValue / maxAggregatedVal) * 0.4; // Removed: aggPoint not in scope, heightScale is not used for yPos calculation directly

        for (let x = 0; x <= radialSegments; x++) {
          const u = x / radialSegments;
          const theta = u * Math.PI * 2;

          const xPos = getCurvedRadius(y / heightSegments) * Math.cos(theta);
          const yPos = height * (y / heightSegments); // Use direct height proportion
          const zPos = getCurvedRadius(y / heightSegments) * Math.sin(theta);

          positions.push(xPos, yPos, zPos);

          // 计算法向量（考虑曲线）
          const nextV = Math.min(1, y / heightSegments + 0.01);
          const prevV = Math.max(0, y / heightSegments - 0.01);
          const nextRadius = getCurvedRadius(nextV);
          const prevRadius = getCurvedRadius(prevV);
          const slope = (nextRadius - prevRadius) / (0.02 * height);

          const normal = new THREE.Vector3(
            Math.cos(theta),
            slope,
            Math.sin(theta)
          ).normalize();

          normals.push(normal.x, normal.y, normal.z);
          uvs.push(u, y / heightSegments);
        }
      }

      // 生成索引
      for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < radialSegments; x++) {
          const a = y * (radialSegments + 1) + x;
          const b = (y + 1) * (radialSegments + 1) + x;
          const c = (y + 1) * (radialSegments + 1) + x + 1;
          const d = y * (radialSegments + 1) + x + 1;

          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      // 添加底面
      const centerIndex = positions.length / 3;
      positions.push(0, 0, 0);
      normals.push(0, -1, 0);
      uvs.push(0.5, 0.5);

      for (let x = 0; x < radialSegments; x++) {
        const a = x;
        const b = x + 1;
        indices.push(centerIndex, a, b);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);

      return geometry;
    };

    aggregatedHotspots.forEach((aggPoint, index) => {
      const markerGroup = new THREE.Group();
      const position = latLngToVector3(aggPoint.lat, aggPoint.lng, GLOBE_RADIUS);
      
      // 底座热力图的半径 - 进一步增大面积
      let heatmapBaseRadius = Math.max(2.0, 1.5 + (aggPoint.aggregatedValue / maxAggregatedVal) * 6.0);
      // 基于聚合点数量增加厚度
      const thicknessMultiplier = 1 + Math.log10(Math.max(1, aggPoint.count)) * 1.5; 
      heatmapBaseRadius *= thicknessMultiplier;

      // 光柱半径 - 稍微粗一点的线状
      const pillarBaseRadius = 0.3; // 稍微粗一点的基础半径
      const pillarTopRadius = 0.15; // 顶部也相应调整
      
      const direction = position.clone().normalize();

      const currentIntensity = aggPoint.aggregatedValue / maxAggregatedVal;
      const pillarHeight = 4 + currentIntensity * 25;

      // --- 1. 底座热力图圆锥 (粗的底座，像热力图) ---
      const actualHeatmapConeHeight = 0.8 + currentIntensity * 2; // 稍微高一点
      
      // 使用标准圆锥几何体，确保UV坐标正确
      const heatmapConeGeometry = new THREE.ConeGeometry(
        heatmapBaseRadius,           // 底部半径
        actualHeatmapConeHeight,     // 高度
        32,                          // 径向分段数，足够平滑
        8                            // 高度分段数
      );
      
      // 创建平滑热力图着色器材质
      const heatmapConeMaterial = new THREE.ShaderMaterial({
        uniforms: {
          intensity: { value: currentIntensity },
          opacity: { value: 0.8 + currentIntensity * 0.2 }
        },
        vertexShader: `
          precision mediump float;
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          void main() {
            vUv = uv;
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          uniform float intensity;
          uniform float opacity;
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          
          void main() {
            // 修正UV坐标计算，确保整个表面都能正确渲染
            vec2 center = vec2(0.5, 0.5);
            
            // 使用更稳定的径向距离计算
            float dist = length(vUv - center);
            
            // 创建平滑的径向衰减，调整范围确保覆盖整个表面
            float falloff = 1.0 - smoothstep(0.0, 0.7, dist);
            falloff = pow(falloff, 1.2); // 调整衰减曲线，让边缘更柔和
            
            vec3 color;
            
            // 根据攻击强度决定颜色方案
            if (intensity > 0.6) {
              // 高强度攻击：白色中心到红色边缘
              vec3 whiteCore = vec3(1.0, 1.0, 1.0);           // 纯白
              vec3 yellowMid = vec3(1.0, 0.8, 0.3);           // 暖黄
              vec3 redEdge = vec3(1.0, 0.2, 0.1);             // 深红
              
              if (falloff > 0.8) {
                // 内核白色区域，范围更大
                color = mix(yellowMid, whiteCore, (falloff - 0.8) / 0.2);
              } else if (falloff > 0.4) {
                // 中间黄橙区域
                color = mix(redEdge, yellowMid, (falloff - 0.4) / 0.4);
              } else {
                // 外围红色区域
                color = redEdge * (falloff / 0.4);
              }
            } else {
              // 低强度攻击：红色系
              vec3 brightRed = vec3(1.0, 0.3, 0.2);           // 亮红
              vec3 darkRed = vec3(0.8, 0.1, 0.0);             // 暗红
              
              color = mix(darkRed, brightRed, falloff);
            }
            
            // 应用强度增强
            color *= (0.8 + intensity * 0.4);
            
            // 最终透明度，确保边缘也有可见效果
            float alpha = max(0.1, falloff * opacity);
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const heatmapCone = new THREE.Mesh(heatmapConeGeometry, heatmapConeMaterial);
      heatmapCone.position.copy(position).add(direction.clone().multiplyScalar(actualHeatmapConeHeight / 2));
      heatmapCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      markerGroup.add(heatmapCone);

      // 创建hover状态的蓝色热力图材质
      const hoverHeatmapMaterial = new THREE.ShaderMaterial({
        uniforms: {
          intensity: { value: currentIntensity },
          opacity: { value: 0.9 + currentIntensity * 0.2 }
        },
        vertexShader: `
          precision mediump float;
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          void main() {
            vUv = uv;
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          uniform float intensity;
          uniform float opacity;
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          
          void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = length(vUv - center);
            float falloff = 1.0 - smoothstep(0.0, 0.7, dist);
            falloff = pow(falloff, 1.2);
            
            vec3 color;
            // hover状态使用蓝色
            vec3 blueCore = vec3(0.3, 0.8, 1.0);    // 亮蓝
            vec3 cyanMid = vec3(0.0, 1.0, 1.0);     // 青色
            vec3 blueEdge = vec3(0.0, 0.4, 1.0);    // 深蓝
            
            if (falloff > 0.8) {
              color = mix(cyanMid, blueCore, (falloff - 0.8) / 0.2);
            } else if (falloff > 0.4) {
              color = mix(blueEdge, cyanMid, (falloff - 0.4) / 0.4);
            } else {
              color = blueEdge * (falloff / 0.4);
            }
            
            color *= (0.8 + intensity * 0.4);
            float alpha = max(0.1, falloff * opacity);
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      // 创建hover状态的蓝色光柱材质
      const hoverCoreBeamMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ccff,
        transparent: true,
        opacity: 0.9 + currentIntensity * 0.1,
        blending: THREE.AdditiveBlending
      });

      const hoverOuterBeamMaterial = new THREE.MeshBasicMaterial({
        color: 0x6699ff,
        transparent: true,
        opacity: 0.4 + currentIntensity * 0.3,
        blending: THREE.AdditiveBlending
      });

      const hoverTopGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6 + currentIntensity * 0.4,
        blending: THREE.AdditiveBlending
      });

      // --- 2. 细线状光柱 ---
      const isHighIntensity = currentIntensity > 0.8;
      const coreColor = isHighIntensity ? 0xffffff : 0xff3333;
      
      // 主光柱 - 很细的线
      const coreBeamGeometry = new THREE.CylinderGeometry(pillarTopRadius, pillarBaseRadius, pillarHeight, 6);
      const coreBeamMaterial = new THREE.MeshBasicMaterial({
        color: coreColor,
        transparent: true,
        opacity: 0.9 + currentIntensity * 0.1,
        blending: THREE.AdditiveBlending
      });
      const coreBeam = new THREE.Mesh(coreBeamGeometry, coreBeamMaterial);
      
      // 从热力图顶部开始
      const startHeight = actualHeatmapConeHeight;
      coreBeam.position.copy(position).add(direction.clone().multiplyScalar(startHeight + pillarHeight / 2));
      coreBeam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      markerGroup.add(coreBeam);
      
      // 线状光柱的发光效果 - 与新的线条粗细协调
      const outerBeamRadius = pillarBaseRadius * 2.5; // 外层发光比例调整
      const outerTopRadius = pillarTopRadius * 2;
      const outerBeamGeometry = new THREE.CylinderGeometry(outerTopRadius, outerBeamRadius, pillarHeight * 0.98, 6);
      
      let outerColor, outerOpacity;
      if (isHighIntensity) {
        outerColor = 0xaaccff;
        outerOpacity = 0.2 + currentIntensity * 0.15;
      } else {
        outerColor = 0xff1111;
        outerOpacity = 0.25 + currentIntensity * 0.2;
      }
      
      const outerBeamMaterial = new THREE.MeshBasicMaterial({
        color: outerColor,
        transparent: true,
        opacity: outerOpacity,
        blending: THREE.AdditiveBlending
      });
      const outerBeam = new THREE.Mesh(outerBeamGeometry, outerBeamMaterial);
      outerBeam.position.copy(coreBeam.position);
      outerBeam.quaternion.copy(coreBeam.quaternion);
      markerGroup.add(outerBeam);
      
      // 高强度攻击的额外发光效果
      if (currentIntensity > 0.7) {
        const glowRadius = outerBeamRadius * 1.5; // 仍然保持细线状
        const glowTopRadius = outerTopRadius * 1.5;
        const glowHeight = pillarHeight * 0.8;
        
        const extraGlowGeometry = new THREE.CylinderGeometry(glowTopRadius, glowRadius, glowHeight, 6);
        const extraGlowMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: (currentIntensity - 0.7) * 0.2,
          blending: THREE.AdditiveBlending
        });
        const extraGlow = new THREE.Mesh(extraGlowGeometry, extraGlowMaterial);
        extraGlow.position.copy(coreBeam.position);
        extraGlow.quaternion.copy(coreBeam.quaternion);
        markerGroup.add(extraGlow);
      }
      
      // 顶部光球 - 稍微小一点
      const topGlowRadius = 0.1 + currentIntensity * 0.08;
      const topGlowGeometry = new THREE.SphereGeometry(topGlowRadius, 8, 8);
      const topGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4 + currentIntensity * 0.6,
        blending: THREE.AdditiveBlending
      });
      const topGlow = new THREE.Mesh(topGlowGeometry, topGlowMaterial);
      topGlow.position.copy(position).add(direction.clone().multiplyScalar(startHeight + pillarHeight));
      markerGroup.add(topGlow);
      
      // 为热点组添加用户数据，用于hover检测
      markerGroup.userData = {
        hotspotData: aggPoint,
        isHotspot: true,
        hotspotIndex: index,
        defaultMaterials: {
          heatmap: heatmapConeMaterial,
          coreBeam: coreBeamMaterial,
          outerBeam: outerBeamMaterial,
          topGlow: topGlowMaterial
        },
        hoverMaterials: {
          heatmap: hoverHeatmapMaterial,
          coreBeam: hoverCoreBeamMaterial,
          outerBeam: hoverOuterBeamMaterial,
          topGlow: hoverTopGlowMaterial
        },
        meshes: {
          heatmapCone: heatmapCone,
          coreBeam: coreBeam,
          outerBeam: outerBeam,
          topGlow: topGlow
        },
        isHovered: false,
        originalScales: {
          heatmapCone: heatmapCone.scale.clone(),
          coreBeam: coreBeam.scale.clone(),
          outerBeam: outerBeam.scale.clone(),
          topGlow: topGlow.scale.clone()
        }
      };
      
      attackHotspotsGroupRef.current.add(markerGroup);
    });

    // 释放材质模板
    sharedHeatmapMaterial.dispose();



  }, [latLngToVector3, maxVal, heatmapTexture]);

  useEffect(() => {
    if (pointsData) {
      console.log('[CyberGlobe] pointsData received in useEffect:', pointsData);
      createAttackMarkers(pointsData);
    }
  }, [pointsData, createAttackMarkers]);

  const updateArcAnimations = useCallback(() => {
    if (!animatedArcsRef.current || animatedArcsRef.current.length === 0) return;

    // 第一次运行时打印调试信息
    if (!debugLogStateRef.current.hasLoggedStart) {
      console.log('[CyberGlobe Debug] updateArcAnimations: Starting with', animatedArcsRef.current.length, 'arcs');
      debugLogStateRef.current.hasLoggedStart = true;
    }

    const now = Date.now();
    const timeValue = now * 0.001; // 转换为秒
    
    const GROW_DURATION = 500;    // 飞线生长更快
    const HOLD_DURATION = 1600;   // 停留时间略短
    const SHRINK_DURATION = 500;  // 收缩更快
    const PAUSE_DURATION = 1000;  // 保持原样
    const TOTAL_CYCLE = GROW_DURATION + HOLD_DURATION + SHRINK_DURATION + PAUSE_DURATION; 

    animatedArcsRef.current.forEach((arcObj, index) => {
      const elapsedTime = now - arcObj.startTime;
      const cycleTime = elapsedTime % TOTAL_CYCLE; 
      
      const allCurvePoints = arcObj.curve.getPoints(arcObj.numPoints - 1);
      let visiblePoints: THREE.Vector3[] = [];

      if (cycleTime < GROW_DURATION) {
        const progress = cycleTime / GROW_DURATION;
        const endIndex = Math.floor(progress * (allCurvePoints.length - 1));
        visiblePoints = allCurvePoints.slice(0, endIndex + 1);
        
      } else if (cycleTime < GROW_DURATION + HOLD_DURATION) {
        visiblePoints = allCurvePoints;
        
      } else if (cycleTime < GROW_DURATION + HOLD_DURATION + SHRINK_DURATION) {
        const shrinkProgress = (cycleTime - GROW_DURATION - HOLD_DURATION) / SHRINK_DURATION;
        const startIndex = Math.floor(shrinkProgress * (allCurvePoints.length - 1));
        visiblePoints = allCurvePoints.slice(startIndex);
        
      } else {
        visiblePoints = [];
      }
      
      // 调试第一个arc的状态
      if (index === 0 && Math.random() < 0.01) { // 1%的概率打印，避免过多日志
        console.log(`[CyberGlobe Debug] Arc 0 - cycleTime: ${cycleTime}, visiblePoints: ${visiblePoints.length}, visible: ${arcObj.mesh.visible}`);
      }
      
      if (visiblePoints.length >= 2) {
        // 创建新的 TubeGeometry 以更新可见部分
        try {
          const visibleCurve = new THREE.CatmullRomCurve3(visiblePoints);
          const newTubeGeometry = new THREE.TubeGeometry(
            visibleCurve, 
            Math.max(6, Math.floor(visiblePoints.length / 3)), // 减少分段数，优化性能
            0.16, // 更细的管半径 (doubled for thickness)
            6,   // 减少径向分段数，优化性能
            false
          );
          
          // 创建发光外壳几何体
          const newGlowGeometry = new THREE.TubeGeometry(
            visibleCurve, 
            Math.max(6, Math.floor(visiblePoints.length / 3)),
            0.30, // 稍大的半径用于发光效果 (doubled for thickness)
            6,
            false
          );
          
          // 释放旧几何体
          arcObj.mesh.geometry.dispose();
          arcObj.glowMesh.geometry.dispose();
          
          // 应用新几何体
          arcObj.mesh.geometry = newTubeGeometry;
          arcObj.glowMesh.geometry = newGlowGeometry;
          
          arcObj.mesh.visible = true;
          arcObj.glowMesh.visible = true;
          
          // 更平滑真实的透明度和发光变化
          if (cycleTime < GROW_DURATION) {
            const progress = Math.sin((cycleTime / GROW_DURATION) * Math.PI * 0.5); // 正弦缓动
          if (arcObj.material.uniforms && arcObj.material.uniforms.intensity) {
            arcObj.material.uniforms.intensity.value = 0.5 + progress * 1.0;
          }
          if (arcObj.glowMaterial.uniforms && arcObj.glowMaterial.uniforms.intensity) {
            arcObj.glowMaterial.uniforms.intensity.value = 0.3 + progress * 0.5;
          }
          } else if (cycleTime < GROW_DURATION + HOLD_DURATION) {
          if (arcObj.material.uniforms && arcObj.material.uniforms.intensity) {
            arcObj.material.uniforms.intensity.value = 1.5;
          }
          if (arcObj.glowMaterial.uniforms && arcObj.glowMaterial.uniforms.intensity) {
            arcObj.glowMaterial.uniforms.intensity.value = 0.8;
          }
          } else if (cycleTime < GROW_DURATION + HOLD_DURATION + SHRINK_DURATION) {
            const fadeProgress = (cycleTime - GROW_DURATION - HOLD_DURATION) / SHRINK_DURATION;
            const smoothFade = Math.sin((1 - fadeProgress) * Math.PI * 0.5); // 正弦缓动
          if (arcObj.material.uniforms && arcObj.material.uniforms.intensity) {
            arcObj.material.uniforms.intensity.value = 1.5 * smoothFade;
          }
          if (arcObj.glowMaterial.uniforms && arcObj.glowMaterial.uniforms.intensity) {
            arcObj.glowMaterial.uniforms.intensity.value = 0.8 * smoothFade;
          }
        }
        
        // 更新着色器时间uniform
        if (arcObj.material.uniforms && arcObj.material.uniforms.time) {
          arcObj.material.uniforms.time.value = timeValue;
        }
        if (arcObj.glowMaterial.uniforms && arcObj.glowMaterial.uniforms.time) {
          arcObj.glowMaterial.uniforms.time.value = timeValue;
        }
        
          arcObj.material.needsUpdate = true;
          arcObj.glowMaterial.needsUpdate = true;
          
        } catch (error) {
          console.warn('[CyberGlobe Debug] Error creating tube geometry:', error);
          arcObj.mesh.visible = false;
          arcObj.glowMesh.visible = false;
        }
      } else {
        arcObj.mesh.visible = false;
        if (arcObj.glowMesh) arcObj.glowMesh.visible = false;
    }
});
}, []);

const createBackgroundParticles = useCallback((_scene: THREE.Scene) => {
  const particleCount = 5000;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1); 
    const radius = GLOBE_RADIUS * (2.5 + Math.random() * 2.5); 

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions.push(x, y, z);
  }

  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: GLOBE_RADIUS * 0.005, 
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true, 
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  particles.name = 'background-stars';
  backgroundParticlesRef.current = particles;
  // scene.add(particles);
}, []);

const createScreenSpaceGlow = useCallback((_scene: THREE.Scene) => {
  // Create a 2D plane fixed at screen top
  const width = 2.0;
  const height = 0.7;
  const glowPlaneGeometry = new THREE.PlaneGeometry(width, height);
  
  // Glow gradient material
  const glowPlaneMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      precision mediump float;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform vec3 uGlowColor;
      uniform float uIntensity;
      varying vec2 vUv;
      
      void main() {
        // Create elliptical gradient fading outward
        float distanceFromCenter = distance(vUv, vec2(0.5, 0.0));
        float glowStrength = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);
        glowStrength = pow(glowStrength, 1.8); // Sharpen gradient edges
        
        // Final color calculation
        vec3 finalColor = uGlowColor * glowStrength * uIntensity;
        gl_FragColor = vec4(finalColor, glowStrength * 0.8); // Moderate opacity
      }
    `,
    uniforms: {
      uGlowColor: { value: new THREE.Color(0x4499ff) }, // Blue glow
      uIntensity: { value: 0.7 }                      // Glow intensity
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,  // Disable depth test to always render
    depthWrite: false  // Don't write to depth buffer
  });

  // Create an orthographic camera fixed in screen space
  const glowCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  
  // Create a special scene just for the glow plane
  const glowScene = new THREE.Scene();
  const glowMesh = new THREE.Mesh(glowPlaneGeometry, glowPlaneMaterial);
  // Position plane at top center of screen
  glowMesh.position.set(0, 0.4, -1); // Adjusted to ensure it's at the top
  glowScene.add(glowMesh);
  
  // Store reference for rendering
  screenGlowMeshRef.current = glowMesh;
  
  // Add glow rendering function
  const renderGlow = () => {
    if (rendererRef.current) {
      // Save current render state
      const currentRenderTarget = rendererRef.current.getRenderTarget();
      const currentScissorTest = rendererRef.current.getScissorTest();
      const currentClearColor = rendererRef.current.getClearColor(new THREE.Color());
      const currentClearAlpha = rendererRef.current.getClearAlpha();
      
      // Render glow
      rendererRef.current.setRenderTarget(null);
      rendererRef.current.setScissorTest(false);
      rendererRef.current.setClearColor(0x000000, 0);
      rendererRef.current.render(glowScene, glowCamera);
      
      // Restore render state
      rendererRef.current.setRenderTarget(currentRenderTarget);
      rendererRef.current.setScissorTest(currentScissorTest);
      rendererRef.current.setClearColor(currentClearColor, currentClearAlpha);
    }
  };
  
  // Store rendering function
  (window as any).renderScreenSpaceGlow = renderGlow;
}, []);

// const createGlobeEdgeGlow = (_scene: THREE.Scene) => { /* Function body removed as it was unused and causing errors */ };

return (
  <div
    ref={mountRef}
    style={{ width, height, position: 'relative', overflow: 'hidden' }}
    className="cyber-globe-mount"
  >
    {/* 屏幕空间柔光斑 overlay（已注释，仅保留 shader 实现的光晕） */}
    {false && (
      <img
        src="/images/blue-glow-spot.png"
        alt="blue glow spot"
        style={{
          position: 'absolute',
          top: '-7%', // 适当上移，覆盖地球顶部边缘
          left: '50%',
          transform: 'translateX(-50%) scaleX(1.6) scaleY(1)', // 拉成椭圆
          width: '72%', // 占据大部分地球宽度
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.62, // 柔和
          filter: 'blur(1.5px)' // 轻微虚化
        }}
        draggable={false}
      />
    )}
  </div>
  );
};

export default CyberGlobe;
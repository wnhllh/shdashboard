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
  material: THREE.MeshBasicMaterial; // 改为自发光材质
  glowMaterial: THREE.MeshBasicMaterial; // 发光外壳材质
  numPoints: number;
  startTime: number;
  animationDuration: number;
}

// 引入 three.meshline 以支持兼容所有浏览器的粗飞线

const GLOBE_RADIUS = 100; 

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
    // Set initial camera position to be above the North Pole
    const northPoleLat = 90;
    const northPoleLng = 0;
    const initialCamPos = latLngToVector3(northPoleLat, northPoleLng, GLOBE_RADIUS, GLOBE_RADIUS * 1.5);
    camera.position.copy(initialCamPos);
    camera.lookAt(new THREE.Vector3(0,0,0));

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
    controls.autoRotateSpeed = 0.3;
    controls.enablePan = false; // Disables panning
    controls.enableRotate = true; // Explicitly enable rotation
    controlsRef.current = controls;

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

      const borderMaterial = new THREE.LineBasicMaterial({ color: 0x1144aa, linewidth: 1 }); 

      geoJsonData.features.forEach((feature: any) => {
        const { geometry } = feature;
        if (!geometry) return;

        const processCoordinates = (coordsArray: any[]) => {
          const points: THREE.Vector3[] = [];
          coordsArray.forEach(([lng, lat]: [number, number]) => {
            points.push(latLngToVector3(lat, lng, GLOBE_RADIUS, 0.2)); 
          });
          if (points.length > 1) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, borderMaterial.clone()); 
            countryBordersGroupRef.current.add(line);
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
      const controlPointDistance = testStartVec.distanceTo(shanghaiPointVec) * 0.5;
      const midPoint = new THREE.Vector3().addVectors(testStartVec, shanghaiPointVec).multiplyScalar(0.5);
      const controlPoint = midPoint.clone().normalize().multiplyScalar(GLOBE_RADIUS + controlPointDistance);
      
      const curve = new THREE.QuadraticBezierCurve3(testStartVec, controlPoint, shanghaiPointVec);
      
      // 创建初始的管状几何体（很短，用于初始化）
      const initialPoints = curve.getPoints(2);
      const initialCurve = new THREE.CatmullRomCurve3(initialPoints);
      const tubeGeometry = new THREE.TubeGeometry(initialCurve, 8, 0.2, 6, false);
      
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4444, // 明亮的红色，自发光
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      
      // 创建发光外壳
      const glowGeometry = new THREE.TubeGeometry(initialCurve, 8, 0.36, 6, false);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4444,
        transparent: true,
        opacity: 0.4, // 增加外壳透明度
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      
      customArcsRef.current.add(tubeMesh);
      customArcsRef.current.add(glowMesh);
      console.log('[CyberGlobe Debug] Test tube arc with glow created and added');
      
      animatedArcsRef.current.push({
        curve: curve,
        mesh: tubeMesh,
        glowMesh: glowMesh,
        material: tubeMaterial,
        glowMaterial: glowMaterial,
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
      
      // 使用 MeshBasicMaterial 创建科幻效果
      const baseColor = arc.color && typeof arc.color === 'string' ? arc.color : '#ff0000';
      const color = new THREE.Color(baseColor);
      
      // 适度提高基础颜色亮度
      color.multiplyScalar(1.1);
      
      // 创建强烈的发光颜色
      const emissiveColor = new THREE.Color(baseColor);
      emissiveColor.multiplyScalar(0.6);
      
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: color, // 自发光颜色
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });

      const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      
      // 创建发光外壳
      const glowGeometry = new THREE.TubeGeometry(initialCurve, 8, 0.30, 6, false);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.35, // 增加外壳透明度
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
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

    aggregatedHotspots.forEach((aggPoint, _index) => {
      const markerGroup = new THREE.Group();
      const position = latLngToVector3(aggPoint.lat, aggPoint.lng, GLOBE_RADIUS);
      
      let pillarBaseRadius = Math.max(0.2, 0.1 + (aggPoint.aggregatedValue / maxAggregatedVal) * 1.5);
      // Make it thicker based on count of original points in the aggregation
      const thicknessMultiplier = 1 + Math.log10(Math.max(1, aggPoint.count)) * 0.5; // Log scale for thickness, ensure count >= 1 for log. Tunable factor 0.5.
      pillarBaseRadius *= thicknessMultiplier;

      // const spikeHeight = 4 + (aggPoint.aggregatedValue / maxAggregatedVal) * 25; // Replaced by pillarHeight
      
      const direction = position.clone().normalize();

      const currentIntensity = aggPoint.aggregatedValue / maxAggregatedVal; // Normalized 0-1 based on aggregated values
      const pillarHeight = 4 + currentIntensity * 25; // Actual height in 3D units for the main pillar

      // --- 1. 三维曲线圆锥热力图 (Heatmap Cone visual element) ---
      // These dimensions are for the separate heatmap cone visual, using currentIntensity
      const actualHeatmapConeRadius = 0.3 + currentIntensity * 2;
      const actualHeatmapConeHeight = 0.5 + currentIntensity * 3;
      const heatmapConeGeometry = createCurvedConeGeometry(actualHeatmapConeRadius, 0.1, actualHeatmapConeHeight, 12, 20);
      
      // 使用渐变材质，营造从底部红色到顶部白色的效果
      const heatmapConeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3333, // 主体红色
        transparent: true,
        opacity: 0.6 + currentIntensity * 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const heatmapCone = new THREE.Mesh(heatmapConeGeometry, heatmapConeMaterial);
      // 放置圆锥使其底部贴近地球表面，顶部指向光柱
      heatmapCone.position.copy(position).add(direction.clone().multiplyScalar(actualHeatmapConeHeight / 2));
      heatmapCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      markerGroup.add(heatmapCone);

      // --- 2. 创建攻击光柱（与圆锥顶部连接）---
      // pillarBaseRadius is already defined and scaled by aggPoint.count
      // pillarHeight is defined based on currentIntensity
      const topBeamRadius = pillarBaseRadius * 0.5; // Top of the pillar is thinner
      
      // Determine color based on intensity
      const isHighIntensity = currentIntensity > 0.8;
      const coreColor = isHighIntensity ? 0xffffff : 0xff3333;
      
      // Core light pillar
      const coreBeamGeometry = new THREE.CylinderGeometry(topBeamRadius, pillarBaseRadius, pillarHeight, 8);
      const coreBeamMaterial = new THREE.MeshBasicMaterial({
        color: coreColor,
        transparent: true,
        opacity: 0.8 + currentIntensity * 0.2,
        blending: THREE.AdditiveBlending
      });
      const coreBeam = new THREE.Mesh(coreBeamGeometry, coreBeamMaterial);
      
      coreBeam.position.copy(position).add(direction.clone().multiplyScalar(pillarHeight / 2));
      coreBeam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      markerGroup.add(coreBeam);
      
      // Outer glow for the pillar
      const outerBeamRadius = pillarBaseRadius * 1.8;
      const outerTopRadius = outerBeamRadius * 0.6;
      const outerBeamGeometry = new THREE.CylinderGeometry(outerTopRadius, outerBeamRadius, pillarHeight * 0.98, 8);
      
      let outerColor, outerOpacity;
      if (isHighIntensity) {
        outerColor = 0xaaccff;
        outerOpacity = 0.3 + currentIntensity * 0.2;
      } else {
        outerColor = 0xff1111;
        outerOpacity = 0.4 + currentIntensity * 0.3;
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
      
      // Extra bright glow for very high intensity attacks
      if (currentIntensity > 0.7) {
        const glowRadius = outerBeamRadius * 1.2;
        const glowTopRadius = glowRadius * 0.8;
        const glowHeight = pillarHeight * 0.8; // Relative to the main pillar height
        
        const extraGlowGeometry = new THREE.CylinderGeometry(glowTopRadius, glowRadius, glowHeight, 8);
        const extraGlowMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: (currentIntensity - 0.7) * 0.3,
          blending: THREE.AdditiveBlending
        });
        const extraGlow = new THREE.Mesh(extraGlowGeometry, extraGlowMaterial);
        extraGlow.position.copy(coreBeam.position);
        extraGlow.quaternion.copy(coreBeam.quaternion);
        markerGroup.add(extraGlow);
      }
      
      // Top sphere glow
      const topGlowRadius = 0.2 + currentIntensity * 0.15;
      const topGlowGeometry = new THREE.SphereGeometry(topGlowRadius, 8, 8);
      const topGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4 + currentIntensity * 0.6,
        blending: THREE.AdditiveBlending
      });
      const topGlow = new THREE.Mesh(topGlowGeometry, topGlowMaterial);
      topGlow.position.copy(position).add(direction.clone().multiplyScalar(pillarHeight)); // Positioned at the top of the pillarHeight
      markerGroup.add(topGlow);
      
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
    
    const GROW_DURATION = 1000;    
    const HOLD_DURATION = 1000;    
    const SHRINK_DURATION = 1000;  
    const PAUSE_DURATION = 1000;   
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
            arcObj.material.opacity = 0.3 + progress * 0.6;
            arcObj.glowMaterial.opacity = 0.15 + progress * 0.2;
          } else if (cycleTime < GROW_DURATION + HOLD_DURATION) {
            arcObj.material.opacity = 0.9;
            arcObj.glowMaterial.opacity = 0.35;
          } else if (cycleTime < GROW_DURATION + HOLD_DURATION + SHRINK_DURATION) {
            const fadeProgress = (cycleTime - GROW_DURATION - HOLD_DURATION) / SHRINK_DURATION;
            const smoothFade = Math.sin((1 - fadeProgress) * Math.PI * 0.5); // 正弦缓动
            arcObj.material.opacity = 0.9 * smoothFade;
            arcObj.glowMaterial.opacity = 0.35 * smoothFade;
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
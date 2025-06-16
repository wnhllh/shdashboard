import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';

interface LaunchItGlobeProps {
  attackData?: AttackData[];
  width?: string | number;
  height?: string | number;
}

interface AttackData {
  sourceCountry: string;
  sourceLat: number;
  sourceLng: number;
  targetLat?: number;
  targetLng?: number;
  intensity?: number;
}

const EARTH_RADIUS = 1.5;

const LaunchItGlobe: React.FC<LaunchItGlobeProps> = ({
  attackData = [],
  width = '100%',
  height = '100%'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const earthTextureRef = useRef<THREE.Texture | null>(null);
  const atmosphereMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const attackBarsRef = useRef<THREE.Group>(new THREE.Group());
  const attackArcsRef = useRef<THREE.Group>(new THREE.Group());
  const starsRef = useRef<THREE.Points | null>(null);

  const attacks = useMemo(() => {
    return attackData.length > 0 ? attackData : generateMockAttackData();
  }, [attackData]);

  function generateMockAttackData(): AttackData[] {
    const mockData: AttackData[] = [];
    const attackCount = 30; 
    const countries = [
      { name: 'USA', lat: 37.0902, lng: -95.7129 },
      { name: 'Russia', lat: 61.5240, lng: 105.3188 },
      { name: 'China', lat: 35.8617, lng: 104.1954 },
      { name: 'UK', lat: 55.3781, lng: -3.4360 },
      { name: 'Brazil', lat: -14.2350, lng: -51.9253 },
      { name: 'Germany', lat: 51.1657, lng: 10.4515 },
      { name: 'India', lat: 20.5937, lng: 78.9629 },
      { name: 'Canada', lat: 56.1304, lng: -106.3468 },
      { name: 'France', lat: 46.2276, lng: 2.2137 },
      { name: 'Australia', lat: -25.2744, lng: 133.7751 },
      { name: 'Japan', lat: 36.2048, lng: 138.2529 },
      { name: 'South Korea', lat: 35.9078, lng: 127.7669 },
    ];
    for (let i = 0; i < attackCount; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const latOffset = (Math.random() - 0.5) * 25;
      const lngOffset = (Math.random() - 0.5) * 35;
      mockData.push({
        sourceCountry: country.name,
        sourceLat: country.lat + latOffset,
        sourceLng: country.lng + lngOffset,
        targetLat: (Math.random() - 0.5) * 180, 
        targetLng: (Math.random() - 0.5) * 360, 
        intensity: Math.random() * 0.7 + 0.3, 
      });
    }
    return mockData;
  }

  function latLngToVector3(lat: number, lng: number, radius: number, elevation: number = 0): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius + elevation) * Math.sin(phi) * Math.cos(theta);
    const y = (radius + elevation) * Math.cos(phi);
    const z = (radius + elevation) * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4.5); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x203040, 0.5); 
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xadc8ff, 1.2); 
    directionalLight.position.set(-5, 5, 10); 
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0x5070cc, 0.6, 80); 
    pointLight.position.set(5, -3, -5);
    scene.add(pointLight);

    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    const earthMapTexture = textureLoader.load(
      '/images/earth_pale_blue_borders.png', 
      (texture) => {
        earthTextureRef.current = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        if (earthRef.current) {
          (earthRef.current.material as THREE.MeshStandardMaterial).map = texture;
          ((earthRef.current.material as THREE.MeshStandardMaterial).map as THREE.Texture).needsUpdate = true;
        }
      },
      undefined,
      (error) => {
        console.error('An error occurred loading the Earth texture:', error);
      }
    );

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthMapTexture, 
      color: 0xADD8E6, 
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0x111111, 
      emissiveIntensity: 0.1,
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthRef.current = earth;
    scene.add(earth);

    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x4090ff) }, 
        falloffPower: { value: 1.8 }, 
        glowSharpness: { value: 3.5 } 
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float falloffPower;
        uniform float glowSharpness;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.9 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), glowSharpness);
          intensity = clamp(intensity, 0.0, 1.0);
          intensity = pow(intensity, falloffPower); 
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.04, 64, 64), atmosphereMaterial); 
    scene.add(atmosphere);
    atmosphereMaterialRef.current = atmosphereMaterial; 

    scene.add(attackBarsRef.current);
    scene.add(attackArcsRef.current);

    // Create Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 10000; i++) { 
      const x = THREE.MathUtils.randFloatSpread(100); 
      const y = THREE.MathUtils.randFloatSpread(100);
      const z = THREE.MathUtils.randFloatSpread(60); 
      // Ensure stars are not too close to the globe or camera origin
      if (new THREE.Vector3(x,y,z).length() > 20) { 
          starVertices.push(x, y, z);
      }
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.07, 
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true 
    });
    starsRef.current = new THREE.Points(starGeometry, starMaterial);
    scene.add(starsRef.current);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight),
        0.9, 
        0.6, 
        0.7  
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;
    
    const handleResize = () => {
      if (currentMount && cameraRef.current && rendererRef.current && composerRef.current) {
        const w = currentMount.clientWidth;
        const h = currentMount.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
        composerRef.current.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      
      const time = Date.now() * 0.005;
      attackBarsRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          const baseScale = child.userData.baseScale || 1;
          child.scale.y = baseScale + Math.sin(time + child.position.x) * 0.1 * baseScale;
        }
      });

      if (composerRef.current) composerRef.current.render();
      else if (rendererRef.current && sceneRef.current && cameraRef.current) {
         rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      
      attackBarsRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else (child.material as THREE.Material).dispose();
        }
      });
      scene.remove(attackBarsRef.current);

      attackArcsRef.current.children.forEach(child => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else (child.material as THREE.Material).dispose();
        }
      });
      scene.remove(attackArcsRef.current);

      if (earthTextureRef.current) {
        earthTextureRef.current.dispose();
      }
      if (earthRef.current) { 
        (earthRef.current.geometry as THREE.SphereGeometry).dispose();
        ((earthRef.current.material as THREE.MeshStandardMaterial).map as THREE.Texture)?.dispose(); 
        (earthRef.current.material as THREE.MeshStandardMaterial).dispose();
        scene.remove(earthRef.current);
      }

      if(atmosphereMaterialRef.current) {
        atmosphereMaterialRef.current.dispose();
      }
      (atmosphere.geometry as THREE.SphereGeometry).dispose(); 

      // Dispose stars
      if (starsRef.current) {
        (starsRef.current.geometry as THREE.BufferGeometry).dispose();
        (starsRef.current.material as THREE.PointsMaterial).dispose();
        scene.remove(starsRef.current);
      }

      controlsRef.current?.dispose();
      if (composerRef.current) {
        composerRef.current.renderTarget1?.dispose();
        composerRef.current.renderTarget2?.dispose();
        composerRef.current.passes.forEach((pass: Pass) => { 
            if (typeof (pass as any).dispose === 'function') {
                (pass as any).dispose();
            }
        });
      }
      rendererRef.current?.dispose();
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (sceneRef.current) {
        while(sceneRef.current.children.length > 0){ 
            sceneRef.current.remove(sceneRef.current.children[0]); 
        }
      }
      console.log('LaunchItGlobe: Cleaned up Three.js resources');
    };
  }, [attackData]); 

  useEffect(() => {
    if (!sceneRef.current || !earthRef.current) return;

    while (attackBarsRef.current.children.length > 0) {
      const bar = attackBarsRef.current.children[0] as THREE.Mesh;
      attackBarsRef.current.remove(bar);
      bar.geometry.dispose();
       if (Array.isArray(bar.material)) bar.material.forEach(m => m.dispose());
       else (bar.material as THREE.Material).dispose();
    }

    while (attackArcsRef.current.children.length > 0) {
      const arcLine = attackArcsRef.current.children[0] as THREE.Line;
      attackArcsRef.current.remove(arcLine);
      arcLine.geometry.dispose();
      if (Array.isArray(arcLine.material)) arcLine.material.forEach(m => m.dispose());
      else (arcLine.material as THREE.Material).dispose();
    }

    const spikeRadiusBase = 0.003; 
    const maxSpikeHeight = 0.7; 
    const spikesPerAttack = 4; 
    const clusterSpread = 0.03; 

    attacks.forEach(attack => {
      const basePosition = latLngToVector3(attack.sourceLat, attack.sourceLng, EARTH_RADIUS, 0.001);

      for (let i = 0; i < spikesPerAttack; i++) {
        const spikeHeight = Math.max(0.05, (attack.intensity || 0.1) * maxSpikeHeight * (0.8 + Math.random() * 0.4)); 
        const spikeRadius = spikeRadiusBase * (0.7 + Math.random() * 0.6); 
        
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * clusterSpread,
          (Math.random() - 0.5) * clusterSpread,
          (Math.random() - 0.5) * clusterSpread 
        );
        const  tempPosition = basePosition.clone().add(offset);

        const finalPosition = tempPosition.normalize().multiplyScalar(EARTH_RADIUS + 0.001); 

        const spikeGeometry = new THREE.CylinderGeometry(spikeRadius, spikeRadius * 0.5, spikeHeight, 8); 
        spikeGeometry.translate(0, spikeHeight / 2, 0);

        const spikeMaterial = new THREE.MeshStandardMaterial({
          color: 0xff3333, 
          emissive: 0xff0000,
          emissiveIntensity: 2.5, 
          roughness: 0.4,
          metalness: 0.2,
          toneMapped: false 
        });

        const spikeMesh = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spikeMesh.position.copy(finalPosition);
        
        const globeCenter = new THREE.Vector3(0,0,0);
        spikeMesh.lookAt(globeCenter);
        spikeMesh.rotateX(Math.PI / 2);   
        
        spikeMesh.userData.baseScale = 1; 
        attackBarsRef.current.add(spikeMesh);
      }
    });

    const earthRadius = EARTH_RADIUS;
    attacks.forEach(attack => {
      if (attack.targetLat === undefined || attack.targetLng === undefined) return; 

      const sourceVec = latLngToVector3(attack.sourceLat, attack.sourceLng, earthRadius);
      const targetVec = latLngToVector3(attack.targetLat, attack.targetLng, earthRadius);

      const distance = sourceVec.distanceTo(targetVec);
      const midPoint = new THREE.Vector3().addVectors(sourceVec, targetVec).multiplyScalar(0.5);
      const midPointNormal = midPoint.clone().normalize();
      const controlPoint = midPoint.clone().add(midPointNormal.multiplyScalar(distance * 0.4)); 

      const curve = new THREE.QuadraticBezierCurve3(sourceVec, controlPoint, targetVec);
      const points = curve.getPoints(50); 
      const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);

      const arcMaterial = new THREE.LineBasicMaterial({
        color: 0xff6633, 
        transparent: true,
        opacity: 0.6,
        linewidth: 1, 
        toneMapped: false 
      });

      const arcLine = new THREE.Line(arcGeometry, arcMaterial);
      attackArcsRef.current.add(arcLine);
    });

  }, [attacks]);

  return (
    <div 
      ref={mountRef} 
      style={{ width, height, position: 'relative', overflow: 'hidden', background: '#000005' }}
    />
  );
};

export default LaunchItGlobe;

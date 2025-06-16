declare module 'three.meshline' {
  import * as THREE from 'three';

  export class MeshLine extends THREE.BufferGeometry {
    constructor();
    setPoints(
      points: THREE.Vector3[] | Float32Array,
      pCallback?: (p: number) => number
    ): void;
    setGeometry(
      g: THREE.BufferGeometry | Float32Array | THREE.Vector3[],
      c?: (p: number) => number
    ): void;
    raycast: (raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) => void;
  }

  export interface MeshLineMaterialParameters extends THREE.ShaderMaterialParameters {
    lineWidth?: number;
    color?: THREE.Color | string | number;
    opacity?: number;
    resolution?: THREE.Vector2;
    sizeAttenuation?: boolean;
    dashArray?: number;
    dashOffset?: number;
    dashRatio?: number;
    useDash?: boolean;
    visibility?: number;
    alphaTest?: number;
    repeat?: THREE.Vector2;
    map?: THREE.Texture;
    useMap?: boolean;
    alphaMap?: THREE.Texture;
    useAlphaMap?: boolean;
  }

  export class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters?: MeshLineMaterialParameters);
    lineWidth: number;
    map: THREE.Texture | null;
    useMap: boolean;
    alphaMap: THREE.Texture | null;
    useAlphaMap: boolean;
    color: THREE.Color;
    opacity: number;
    resolution: THREE.Vector2;
    sizeAttenuation: boolean;
    dashArray: number;
    dashOffset: number;
    dashRatio: number;
    useDash: boolean;
    visibility: number;
    alphaTest: number;
    repeat: THREE.Vector2;

    copy(source: MeshLineMaterial): this;
  }
}

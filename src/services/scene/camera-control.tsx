import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ICameraControlsConstructor } from './interface';

class CameraControl {
    // props when initialized
    private renderer: THREE.Renderer;
    private DOMElement: HTMLElement;

    // self props
    private orbitControls: OrbitControls;
    public camera: THREE.PerspectiveCamera;

    constructor({ renderer, DOMElement }: ICameraControlsConstructor) {
        this.renderer = renderer;
        this.DOMElement = DOMElement;
        this.camera = new THREE.PerspectiveCamera(52, this.DOMElement.clientWidth / this.DOMElement.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 1);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.minDistance = 8.5;
        this.orbitControls.maxDistance = 8.5;
        this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.2;
        this.orbitControls.minPolarAngle = Math.PI / 4;
        this.orbitControls.update();
    }

    public get inst(): OrbitControls {
        return this.orbitControls;
    }

    public update = (): void => {
        this.orbitControls.update();
    }
}

export default CameraControl;
import * as THREE from 'three';
import CannonDebugger from 'cannon-es-debugger';
import CharacterControl from './character-control';
import Light from './light';
import CameraControl from './camera-control';
import KeyboardControl from './keyboard-control';
import Layout from './layout';
import Floor from './floor';
import Physic from './physic';
import { ILoadCharacterProperties, IObject } from './interface';

interface IConstructor {
    element: HTMLElement,
}

class SceneService {
    public characterControls: CharacterControl[];
    public keyboardControl: KeyboardControl;
    public physic: Physic;
    public scene: THREE.Scene;
    private DOMElement: HTMLElement;
    private renderer: THREE.Renderer;
    private cameraControl: CameraControl;
    private layout: Layout;
    private floor: Floor;
    private light: Light;
    private isDebug: boolean;
    private cannonDebugRenderer?: { update: () => void };
    private raycaster: THREE.Raycaster;

    constructor({ element }: IConstructor) {
        this.isDebug = false;
        this.DOMElement = element;
        this.raycaster = new THREE.Raycaster();
        this.physic = new Physic();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x444444);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.DOMElement.clientWidth, this.DOMElement.clientHeight);
        this.floor = new Floor({ scene: this.scene, world: this.physic.world });
        this.layout = new Layout({ scene: this.scene, world: this.physic.world });
        this.cameraControl = new CameraControl({ renderer: this.renderer, DOMElement: element });
        this.keyboardControl = new KeyboardControl();
        this.characterControls = [];
        this.light = new Light({ scene: this.scene });
        this.light.enable();
        if (this.isDebug) this.cannonDebugRenderer = CannonDebugger(this.scene, this.physic.world, {});

        this.DOMElement.appendChild(this.renderer.domElement);
        this.animate();
        this.handleWindowResize();
        this.handleRaycaster();
    }

    public clear = (): void => {
        this.scene.clear();
    }

    public loadCharacter = async (props: ILoadCharacterProperties): Promise<void> => {
        const characterControl = props.isMyCharacter
            ? new CharacterControl({ world: this.physic.world, scene: this.scene, camera: this.cameraControl.camera, orbitControls: this.cameraControl.inst, keyboardControl: this.keyboardControl })
            : new CharacterControl({ world: this.physic.world, scene: this.scene, camera: this.cameraControl.camera });
        await characterControl.load(props);
        this.characterControls.push(characterControl);
    }

    public addObject = (props: IObject): void => {
        this.layout.addObject(props);
    }

    private animate = (): void => {
        this.characterControls.forEach(item => {
            if (item.isMyCharacter) item.update();
            else item.syncModelAndBodyPosition({ isRemoteCharacter: true });
        });
        this.cameraControl.update();
        this.physic.update();
        this.layout.update();
        this.floor.update();
        this.cannonDebugRenderer?.update();
        this.renderer.render(this.scene, this.cameraControl.camera);
        requestAnimationFrame(this.animate);
    }

    private handleRaycaster = (): void => {
        this.cameraControl.inst.addEventListener('change', () => {
            this.layout.meshes.forEach(mesh => {
                mesh.visible = true;
            });

            this.raycaster.set(
                this.cameraControl.inst.target,
                new THREE.Vector3().subVectors(this.cameraControl.camera.position, this.cameraControl.inst.target).normalize()
            );
            const intersects = this.raycaster.intersectObjects(this.layout.meshes.filter(msh => msh.name.indexOf('Wall') > -1), false);
            const item = intersects[0];
            if (item
                && item.distance < this.cameraControl.inst.target.distanceTo(this.cameraControl.camera.position)
                && item.object instanceof THREE.Mesh
            ) item.object.visible = false;
        });
    }

    private handleWindowResize = (): void => {
        window.addEventListener('resize', () => {
            this.renderer.setSize(this.DOMElement.clientWidth, this.DOMElement.clientHeight);
            this.cameraControl.camera.aspect = this.DOMElement.clientWidth / this.DOMElement.clientHeight;
            this.cameraControl.camera.updateProjectionMatrix();
        });
    }
}

export default SceneService;

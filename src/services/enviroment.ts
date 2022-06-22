import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class EnvironmentService {
    private static inst: EnvironmentService;
    private gltfLoader: GLTFLoader;
    private model?: THREE.Group;

    constructor() {
        this.gltfLoader = new GLTFLoader();
    }

    public static get instance(): EnvironmentService {
        if (!EnvironmentService.inst) EnvironmentService.inst = new EnvironmentService();
        return EnvironmentService.inst;
    }

    public get environmentModel(): THREE.Group | undefined {
        return this.model;
    }

    public load = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                '/models/maps/Room.gltf',
                (gltf) => {
                    this.model = gltf.scene;
                    resolve();
                }, (e) => {
                    // handle on progress
                }, (e) => {
                    reject(e);
                }
            );
        });
    }
}

export default EnvironmentService;
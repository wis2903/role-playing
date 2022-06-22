import * as THREE from 'three';
import { AmbientLight } from 'three';
import { ILightConstructor } from './interface';

class Light {
    private scene: THREE.Scene;

    constructor({ scene }: ILightConstructor) {
        this.scene = scene;
    }

    public enable = (): void => {
        const ambientLight = new AmbientLight(0x444444, 2);
        this.scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 10, 2);
        this.scene.add(hemiLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight1.position.set(0, 20, 0);
        this.scene.add(dirLight1);
        
        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight2.position.set(0, 20, 20);
        this.scene.add(dirLight2);

        const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight3.position.set(0, 20, -20);
        this.scene.add(dirLight3);

        const dirLight4 = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight4.position.set(20, 20, 0);
        this.scene.add(dirLight4);

        const dirLight5 = new THREE.DirectionalLight(0xffffff, 0.3);
        dirLight5.position.set(0, 20, -10);
        this.scene.add(dirLight5);

        const dirLight6 = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight6.position.set(0, 10, 0);
        this.scene.add(dirLight6);
    }
}

export default Light;
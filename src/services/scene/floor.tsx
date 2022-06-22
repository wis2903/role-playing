import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { IFloorConstructor } from './interface';

class Floor {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private body: CANNON.Body;

    constructor({ world, scene }: IFloorConstructor) {
        this.scene = scene;
        this.world = world;
        this.body = new CANNON.Body({
            shape: new CANNON.Plane(),
            mass: 0,
        });
        this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(this.body);
    }

    public update = (): void => {
        // todo
    }
}

export default Floor;
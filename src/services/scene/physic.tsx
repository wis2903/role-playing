import * as CANNON from 'cannon-es';

class Physics {
    public world: CANNON.World;

    constructor() {
        this.world = new CANNON.World();
        this.world.gravity = new CANNON.Vec3(0, -60, 0);
        this.world.defaultContactMaterial.friction = 300;
    }

    public update = (): void => {
        this.world.step(1 / 50);
    }
}

export default Physics;
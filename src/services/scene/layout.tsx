import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import EnvironmentService from '../enviroment';
import { ILayoutConstructor, IObject } from './interface';

interface IAddMeshParams {
    mesh: THREE.Object3D,
    position: THREE.Vector3,
}

class Layout {
    private world: CANNON.World;
    private scene: THREE.Scene;
    private quaternion?: THREE.Quaternion;
    public meshes: THREE.Mesh[];

    constructor({ scene, world }: ILayoutConstructor) {
        this.world = world;
        this.scene = scene;
        this.meshes = [];

        if (EnvironmentService.instance.environmentModel) {
            this.addObject({
                model: EnvironmentService.instance.environmentModel,
                position: new THREE.Vector3(0, 1.55, 0),
            });
        }
    }

    public update = (): void => {
        // todo
    }

    public addObject = ({ model, position }: IObject): void => {
        model.position.copy(position);
        this.scene.add(model);
        model.children.forEach(mesh => {
            this.addMesh({ mesh, position });
        });
    }

    private addMesh = ({ mesh, position }: IAddMeshParams): void => {
        try {
            if (mesh instanceof THREE.Mesh) {
                this.meshes.push(mesh);
                if(!(mesh.material instanceof Array)) mesh.material.transparent = true;
                const trimesh = this.createTrimesh(mesh);
                const body = new CANNON.Body({ mass: 0, shape: trimesh });
                body.position.set(
                    mesh.position.x + position.x,
                    mesh.position.y + position.y,
                    mesh.position.z + position.z,
                );
                body.quaternion.set(
                    mesh.quaternion.x,
                    mesh.quaternion.y,
                    mesh.quaternion.z,
                    mesh.quaternion.w,
                );
                if (this.quaternion) {
                    body.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
                }
                this.world.addBody(body);
            } else if (mesh instanceof THREE.Object3D && mesh.children.length) {
                if (!this.quaternion) {
                    this.quaternion = mesh.quaternion;
                }
                mesh.children.forEach(childMesh => {
                    this.addMesh({ mesh: childMesh, position });
                });
            }
        } catch (e) {
            //
        }
    }

    private createTrimesh(mesh: THREE.Mesh): CANNON.Trimesh {
        const vertices = Array.from(mesh.geometry.attributes.position.array);
        const indices = Object.keys(vertices).map(Number);
        return new CANNON.Trimesh(vertices, indices);
    }
}

export default Layout;

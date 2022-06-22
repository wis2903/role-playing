import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import KeyboardControl from './keyboard-control';

export interface IKeysPressed {
    w: boolean,
    s: boolean,
    a: boolean,
    d: boolean,
    space: boolean,
}

export interface ICharacterControlsConstructor {
    scene: THREE.Scene,
    camera: THREE.Camera,
    world: CANNON.World,
    orbitControls?: OrbitControls,
    keyboardControl?: KeyboardControl,
}

export interface ILayoutConstructor {
    scene: THREE.Scene,
    world: CANNON.World,
}

export interface IFloorConstructor {
    world: CANNON.World,
    scene: THREE.Scene,
}

export interface ILightConstructor {
    scene: THREE.Scene,
}

export interface ICameraControlsConstructor {
    renderer: THREE.Renderer,
    DOMElement: HTMLElement,
}

export interface ILoadCharacterProperties {
    name: string,
    look: number,
    position: THREE.Vector3,
    isMyCharacter?: boolean,
    userId: string,
}

export interface IObject {
    model: THREE.Group,
    position: THREE.Vector3,
}

export interface ICharacterState {
    isMoving?: boolean,
    isStartJumping?: boolean,
    isJumping?: boolean,
    isFalling?: boolean,
    action?: string,
}

export interface ICharacterAttributes {
    velocity: CANNON.Vec3,
    quaternion: THREE.Quaternion,
    position?: CANNON.Vec3,
    state: ICharacterState,
}
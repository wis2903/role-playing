import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as TWEEN from '@tweenjs/tween.js';
import AnimationService from '../animation';
import KeyboardControl from './keyboard-control';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ICharacterControlsConstructor, ILoadCharacterProperties, ICharacterAttributes, ICharacterState } from './interface';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import CharactersService from '../characters';

class CharacterControl {
    // props when initialized
    private world: CANNON.World;
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private orbitControls?: OrbitControls;
    private keyboardControl?: KeyboardControl;
    public isMyCharacter?: boolean;
    public userId?: string;

    // self props
    private activeAnimation?: THREE.AnimationAction;
    private rotateQuarternion: THREE.Quaternion;
    private walkDirection: THREE.Vector3;
    private rotateAngle: THREE.Vector3;
    private mixer?: THREE.AnimationMixer;
    private clock: THREE.Clock;
    private body?: CANNON.Body;
    private characterBodyRadius: number;
    private movingSpeed: number;
    private postionTween?: TWEEN.Tween<THREE.Vector2>;
    private setAttributeTimeout?: ReturnType<typeof setTimeout>;
    private onUpdateInterval?: ReturnType<typeof setInterval>;
    public model?: THREE.Group;
    public state: ICharacterState;
    public onUpdated?: (attr: ICharacterAttributes) => void;
    public onLanding?: () => void;
    public onStartJumping?: () => void;
    public onEndJumping?: () => void;

    constructor({ world, scene, camera, orbitControls, keyboardControl }: ICharacterControlsConstructor) {
        this.world = world;
        this.scene = scene;
        this.camera = camera;
        this.orbitControls = orbitControls;
        this.keyboardControl = keyboardControl;
        this.clock = new THREE.Clock();
        this.rotateQuarternion = new THREE.Quaternion();
        this.walkDirection = new THREE.Vector3();
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.characterBodyRadius = 1.8;
        this.movingSpeed = 400;
        this.state = { isFalling: true };
        this.handleCharacterLanding();
    }

    public load = async ({ name, look, position, isMyCharacter, userId }: ILoadCharacterProperties): Promise<void> => {
        return new Promise(resolve => {
            this.userId = userId;
            const character = CharactersService.instance.data.find(item => item.name === name);
            if (!character || !character.looks[look]) return;

            const scale = 0.02;
            const clone = SkeletonUtils.clone(character.looks[look]);
            if (!(clone instanceof THREE.Group)) return;
            this.model = clone;
            this.model.name = `character-${userId}`;
            this.model.uuid = `character-${userId}`;
            this.model.castShadow = true;
            this.model.scale.set(scale, scale, scale);
            this.model.position.set(position.x, position.y, position.z);
            this.scene.add(this.model);
            this.mixer = new THREE.AnimationMixer(this.model);
            this.body = new CANNON.Body({
                shape: new CANNON.Sphere(this.characterBodyRadius),
                position: new CANNON.Vec3(position.x, position.y + this.characterBodyRadius, position.z),
                mass: 100,
                angularDamping: 0.5,
            });
            this.body.id = parseInt(userId);
            this.world.addBody(this.body);
            this.isMyCharacter = isMyCharacter;
            if (this.isMyCharacter && this.keyboardControl) this.keyboardControl.onPressSpace(this.jump);
            resolve();
        });
    }

    public update = async (): Promise<void> => {
        const clockDelta = this.clock.getDelta();
        if (this.mixer) this.mixer.update(clockDelta);
        this.handleModelAnimation();

        if (this.model && this.body) {
            if (this.hasKeyPressed) {
                this.state.isMoving = true;
                this.clearActions();
                if (!this.state.isStartJumping && !this.state.isFalling) {
                    // calculate direction
                    this.camera.getWorldDirection(this.walkDirection);
                    this.walkDirection.y = 0;
                    this.walkDirection.normalize();
                    this.walkDirection.applyAxisAngle(this.rotateAngle, this.cameraDirectionOffset);

                    // rotate model
                    const angleYCameraDirection = Math.atan2(
                        (this.camera.position.x - this.model.position.x),
                        (this.camera.position.z - this.model.position.z),
                    );
                    this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + this.modelDirectionOffset);
                    const moveX = this.walkDirection.x * clockDelta;
                    const moveZ = this.walkDirection.z * clockDelta;
                    this.move(moveX * this.movingSpeed, moveZ * this.movingSpeed);
                } else this.move(0, 0);
            } else {
                this.move(0, 0);
                this.body.quaternion.set(0, 0, 0, 1);
                this.state.isMoving = false;
            }

            this.updateCameraTarget(
                this.body.position.x - this.model.position.x,
                this.body.position.y - this.model.position.y - this.characterBodyRadius,
                this.body.position.z - this.model.position.z
            );
            this.syncModelAndBodyPosition();
            if (this.onUpdated && !this.onUpdateInterval) {
                const attributes = this.getAttributes();
                if (attributes) this.onUpdated(attributes);

                this.onUpdateInterval = setInterval(() => {
                    const attributes = this.getAttributes();
                    if (this.onUpdated && attributes) this.onUpdated(attributes);
                }, 400);
            }
            if (!this.onUpdated && this.onUpdateInterval) {
                clearInterval(this.onUpdateInterval);
                this.onUpdateInterval = undefined;
            }
        }
    }

    public syncModelAndBodyPosition = (props?: { isRemoteCharacter?: boolean }): void => {
        if (props && props.isRemoteCharacter) {
            if (this.mixer) this.mixer.update(this.clock.getDelta());
            this.handleModelAnimation();
        }
        if (this.model && this.body) {
            this.model.position.lerp(new THREE.Vector3(
                this.body.position.x,
                this.body.position.y - this.characterBodyRadius,
                this.body.position.z
            ), 0.3);
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.3);
        }
        if (this.postionTween) this.postionTween.update();
        this.handleCharacterBlock();
    }

    public handleModelAnimation = (): void => {
        if (this.state.isJumping) return;

        if (this.state.isFalling) this.playAnimation(AnimationService.instance.get('fall'));
        else if (this.state.action) this.playAnimation(AnimationService.instance.get(this.state.action));
        else if (this.state.isStartJumping) this.playJumpingAnimation();
        else this.playDefaultAnimation();
    }

    public playAnimation = (animation?: THREE.AnimationClip): void => {
        if (!animation || !this.mixer || this.activeAnimation?.getClip() === animation) return;
        if (this.activeAnimation) this.activeAnimation.fadeOut(0.5);
        this.activeAnimation = this.mixer.clipAction(animation);
        this.activeAnimation.reset().fadeIn(0.5).play();
    }

    public setAttribute = ({ quaternion, position, state }: ICharacterAttributes): void => {
        this.postionTween?.stop();
        this.rotateQuarternion = quaternion;
        if (this.body && position) {
            this.body.position.y = position.y;
            const movement = new THREE.Vector2(this.body.position.x, this.body.position.z);
            this.postionTween = new TWEEN.Tween(movement)
                .to(new THREE.Vector2(position.x, position.z), 1800)
                .easing(TWEEN.Easing.Cubic.Out)
                .onUpdate(() => {
                    if (this.body) {
                        this.body.position.x = movement.x;
                        this.body.position.z = movement.y;
                    }
                })
                .start();
        }
        if (this.setAttributeTimeout) clearTimeout(this.setAttributeTimeout);
        this.setAttributeTimeout = setTimeout(() => {
            this.state = state || {};
        }, state.isMoving || state.isStartJumping ? 0 : 1000);
    }

    public getAttributes = (): ICharacterAttributes | undefined => {
        if (this.body && this.model) return {
            velocity: this.body.velocity || new CANNON.Vec3(),
            quaternion: this.model.quaternion || new THREE.Quaternion(),
            position: this.body.position || new CANNON.Vec3(),
            state: this.state,
        };
    }

    public clearActions = (): void => {
        if (this.state.action) this.state.action = undefined;
    }

    public destroy = (): void => {
        if (this.model) this.scene.remove(this.model);
        if (this.body) this.world.removeBody(this.body);
    }

    private handleCharacterLanding = (): void => {
        setTimeout(() => {
            this.state.isFalling = false;
            if (this.onLanding) this.onLanding();
        }, 1500);
    }

    private handleCharacterBlock = (): void => {
        if (!this.state.isMoving && this.body) {
            if (Math.abs(this.body.velocity.x) > 0.02 || Math.abs(this.body.velocity.z) > 0.02) {
                this.body.velocity.x = 0;
                this.body.velocity.z = 0;
                this.body.quaternion.set(0, 0, 0, 1);
            }
        }
    }

    private jump = (): void => {
        if (this.state.isJumping || this.state.isStartJumping) return;
        this.clearActions();
        this.state.isStartJumping = true;
        if (this.onStartJumping) this.onStartJumping();
        setTimeout(() => {
            this.state.isStartJumping = false;
            if (this.body) this.body.velocity.y = 15;
            this.state.isJumping = true;

            setTimeout(() => {
                this.state.isJumping = false;
                if (this.onEndJumping) this.onEndJumping();
            }, 800);
        }, 200);
    }

    private move = (velocityX: number, velocityZ: number): void => {
        if (this.body) {
            this.body.velocity.x = velocityX;
            this.body.velocity.z = velocityZ;
        }
    }

    private playJumpingAnimation = (): void => {
        if (this.state.isJumping) return;

        const animation = AnimationService.instance.get('running-jump');
        if (animation) {
            this.playAnimation(animation);
            setTimeout(() => {
                this.playDefaultAnimation();
                if (!this.isMyCharacter) {
                    this.state.isStartJumping = false;
                    this.state.isJumping = false;
                }
            }, animation.duration * 1000 - 500);
        }
    }

    private playDefaultAnimation = (): void => {
        this.playAnimation(!this.state.isMoving ? AnimationService.instance.get('idle') : AnimationService.instance.get('run'));
    }

    private updateCameraTarget = (moveX: number, moveY: number, moveZ: number): void => {
        if (this.body && this.orbitControls) {
            this.camera.position.lerp(new THREE.Vector3(
                this.camera.position.x + moveX,
                this.camera.position.y + moveY,
                this.camera.position.z + moveZ
            ), 0.3);

            this.orbitControls.target.lerp(new THREE.Vector3(
                this.body.position.x,
                this.body.position.y - this.characterBodyRadius + 2.5,
                this.body.position.z
            ), 0.3);
        }
    }

    private get cameraDirectionOffset(): number {
        if (!this.keyboardControl) return 0;

        if (!this.keyboardControl.keysPressed) return 0;

        if (this.keyboardControl.keysPressed.w) {
            if (this.keyboardControl.keysPressed.a) return Math.PI / 4;
            else if (this.keyboardControl.keysPressed.d) return - Math.PI / 4;
            else return 0;
        }
        else if (this.keyboardControl.keysPressed.s) {
            if (this.keyboardControl.keysPressed.a) return Math.PI / 4 + Math.PI / 2;
            else if (this.keyboardControl.keysPressed.d) return - Math.PI / 4 - Math.PI / 2;
            else return Math.PI;
        }
        else if (this.keyboardControl.keysPressed.a) return Math.PI / 2;
        else if (this.keyboardControl.keysPressed.d) return - Math.PI / 2;

        return 0;
    }

    private get modelDirectionOffset(): number {
        if (!this.keyboardControl) return 0;

        if (!this.keyboardControl.keysPressed) return 0;

        if (this.keyboardControl.keysPressed.s) {
            if (this.keyboardControl.keysPressed.d) return Math.PI / 4;
            else if (this.keyboardControl.keysPressed.a) return - Math.PI / 4;
            else return 0;
        }
        else if (this.keyboardControl.keysPressed.w) {
            if (this.keyboardControl.keysPressed.d) return Math.PI / 4 + Math.PI / 2;
            else if (this.keyboardControl.keysPressed.a) return - Math.PI / 4 - Math.PI / 2;
            else return Math.PI;
        }
        else if (this.keyboardControl.keysPressed.d) return Math.PI / 2;
        else if (this.keyboardControl.keysPressed.a) return - Math.PI / 2;

        return 0;
    }

    private get hasKeyPressed(): boolean {
        if (!this.keyboardControl) return false;
        return this.keyboardControl.hasKeyPressed;
    }
}

export default CharacterControl;
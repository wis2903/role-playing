import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { defaultAnimations, actionAnimations } from '../resources/characters';

class AnimationService {
    private static inst?: AnimationService;
    private animations: { key: string, animation: THREE.AnimationClip }[];
    private loader: FBXLoader;

    constructor() {
        this.animations = [];
        this.loader = new FBXLoader();
    }

    public static get instance(): AnimationService {
        if (!AnimationService.inst) AnimationService.inst = new AnimationService();
        return AnimationService.inst;
    }

    public load = async (onProgress?: (percentage: number) => void): Promise<void> => {
        const animations = defaultAnimations.concat(actionAnimations);
        for (let i = 0; i < animations.length; i++) {
            const res = await this.loadAnimation(animations[i].url);
            this.animations.push({
                key: animations[i].key,
                animation: res,
            });
            if (onProgress) onProgress(Math.round(100 / animations.length * (i + 1)));
        }
    }

    public get = (key: string): THREE.AnimationClip | undefined => {
        const item = this.animations.find(item => item.key === key);
        return item?.animation;
    }

    private loadAnimation = async (url: string): Promise<THREE.AnimationClip> => {
        return new Promise((resolve, reject) => {
            this.loader.load(url, (res) => {
                resolve(res.animations[0]);
            }, undefined, reject);
        });
    }

}

export default AnimationService;
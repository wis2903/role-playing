import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { characterResources } from '../resources/characters';

interface ICharacterData {
    name: string,
    looks: THREE.Group[],
}

class CharactersService {
    private static inst?: CharactersService;
    private loader: FBXLoader;
    public data: ICharacterData[];

    constructor() {
        this.loader = new FBXLoader();
        this.data = [];
    }

    public static get instance(): CharactersService {
        if (!CharactersService.inst) CharactersService.inst = new CharactersService();
        return CharactersService.inst;
    }

    public load = async (onProgress?: (percentage: number) => void): Promise<void> => {
        for (let i = 0; i < characterResources.length; i++) {
            await this.processCharacter(characterResources[i]);
            if (onProgress) onProgress(Math.round(100 / characterResources.length * (i + 1)));
        }
    }

    private processCharacter = async (character: ICharacterRawData): Promise<void> => {
        const res: ICharacterData = {
            name: character.name,
            looks: [],
        };
        for (let i = 0; i < character.looks.length; i++) {
            const url = character.looks[i];
            const model = await this.processModelUrl(url);
            res.looks.push(model);
        }
        this.data.push(res);
    }

    private processModelUrl = async (url: string): Promise<THREE.Group> => {
        return new Promise(resolve => {
            this.loader.load(url, model => {
                resolve(model);
            });
        });
    }
}

export default CharactersService;
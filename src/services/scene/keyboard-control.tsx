import { IKeysPressed } from './interface';

class KeyboardControl {
    private keys: IKeysPressed;
    private pressSpaceCallbacks: (() => void)[];
    private keyDownCallbacks: (() => void)[];
    private keyUpCallbacks: (() => void)[];
    private pressShiftCallbacks: (() => void)[];
    private releaseShiftCallbacks: (() => void)[];

    constructor() {
        this.keys = { w: false, s: false, a: false, d: false, space: false };
        this.pressSpaceCallbacks = [];
        this.keyDownCallbacks = [];
        this.keyUpCallbacks = [];
        this.pressShiftCallbacks = [];
        this.releaseShiftCallbacks = [];
        this.addEventListeners();
    }

    public get keysPressed(): IKeysPressed {
        return this.keys;
    }

    public onPressSpace = (callback: () => void): void => {
        this.pressSpaceCallbacks.push(callback);
    }

    public onKeyDown = (callback: () => void): void => {
        this.keyDownCallbacks.push(callback);
    }

    public onKeyUp = (callback: () => void): void => {
        this.keyUpCallbacks.push(callback);
    }

    public onPressShift = (callback: () => void): void => {
        this.pressShiftCallbacks.push(callback);
    }

    public onReleaseShift = (callback: () => void): void => {
        this.releaseShiftCallbacks.push(callback);
    }

    public get hasKeyPressed(): boolean {
        return this.keysPressed.a
            || this.keysPressed.d
            || this.keysPressed.s
            || this.keysPressed.w;
    }

    private addEventListeners = (): void => {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown = (e: KeyboardEvent): void => {
        const key = e.key.toLowerCase();
        switch (key) {
            case 'w':
            case 'arrowup':
                this.keysPressed.w = true;
                break;
            case 's':
            case 'arrowdown':
                this.keysPressed.s = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keysPressed.a = true;
                break;
            case 'd':
            case 'arrowright':
                this.keysPressed.d = true;
                break;
            case ' ':
                e.preventDefault();
                this.keysPressed.space = true;
                this.pressSpaceCallbacks.forEach(callback => { callback(); });
                break;
            case 'shift':
                this.pressShiftCallbacks.forEach(callback => { callback(); });
                break;
            default:
                break;
        }
        this.keyDownCallbacks.forEach(callback => { callback(); });
    }

    private handleKeyUp = (e: KeyboardEvent): void => {
        const key = e.key.toLowerCase();
        switch (key) {
            case 'w':
            case 'arrowup':
                this.keysPressed.w = false;
                break;
            case 's':
            case 'arrowdown':
                this.keysPressed.s = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keysPressed.a = false;
                break;
            case 'd':
            case 'arrowright':
                this.keysPressed.d = false;
                break;
            case ' ':
                this.keysPressed.space = false;
                break;
            case 'shift':
                this.releaseShiftCallbacks.forEach(callback => { callback(); });
                break;
            default:
                break;
        }
        this.keyUpCallbacks.forEach(callback => { callback(); });
    }
}

export default KeyboardControl;
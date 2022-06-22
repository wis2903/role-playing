export const characterResources: ICharacterRawData[] = [
    {
        name: 'Jenifer',
        looks: [
            '/models/characters/Jenifer/1/model.fbx',
        ]
    },
    {
        name: 'Jane',
        looks: [
            '/models/characters/Jane/1/model.fbx',
        ]
    },
    {
        name: 'Natasa',
        looks: [
            '/models/characters/Natasa/1/model.fbx',
        ]
    },
    {
        name: 'Han',
        looks: [
            '/models/characters/Han/1/model.fbx',
        ]
    },
];

export const defaultAnimations: { key: string, url: string }[] = [
    { key: 'idle', url: '/models/animations/Idle.fbx' },
    { key: 'run', url: '/models/animations/Running.fbx' },
    { key: 'jump', url: '/models/animations/Jumping.fbx' },
    { key: 'running-jump', url: '/models/animations/RunningJump.fbx' },
    { key: 'fall', url: '/models/animations/Falling.fbx' },
];

export const actionAnimations: { key: string, url: string, name: string }[] = [
    { key: 'clap', url: '/models/animations/Clapping.fbx', name: 'Hand Clap' },
    { key: 'kneeling-pointing', url: '/models/animations/KneelingPointing.fbx', name: 'Kneeling Down' },
    { key: 'angry', url: '/models/animations/Angry.fbx', name: 'Angry' },
    { key: 'ninja', url: '/models/animations/Block.fbx', name: 'Ninja' },
    { key: 'boxing', url: '/models/animations/Boxing.fbx', name: 'Boxing' },
    { key: 'victory', url: '/models/animations/Victory.fbx', name: 'Victory' },
    { key: 'flair', url: '/models/animations/Flair.fbx', name: 'Break Dance' },
    { key: 'snake-dance', url: '/models/animations/SnakeDance.fbx', name: 'Snake Dance' },
];
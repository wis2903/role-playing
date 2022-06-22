declare interface ICharacterRawData {
    name: string,
    looks: string[],
}

declare interface ICharacterLook {
    model: THREE.Group,
}

declare interface ICharacter {
    name: string,
    looks: ICharacterLook[],
}

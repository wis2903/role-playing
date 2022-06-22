enum AuthEnum {
    accessTokenStorageKey = 'rove-access-token',
    refreshTokenStorageKey = 'rove-refresh-token',
    signInWithMetaMaskAccessTokenStorageKey = 'sign-in-with-meta-mask-access-token',
    signInWithMetaMaskRefreshTokenStorageKey = 'sign-in-with-meta-mask-refresh-token'
}

enum AnonymousAuthEnum {
    accessTokenStorageKey = 'rove-anonymous-access-token',
    refreshTokenStorageKey = 'rove-anonymous-refresh-token',
    userIdStorageKey = 'rove-anonymous-user-id'
}

enum StorageKey {
    connectedWallet = 'connectedWallet',
}

enum EventEnum {
    reactionInRoom = 'reactionInRoom',
    assignedListenerToSpeaker = 'assignedListenerToSpeaker'
}

enum ReactionEnum {
    like = 'like',
    love = 'love',
    amazing = 'amazing',
    lol = 'lol',
    angry = 'angry'
}

export enum WalletConnectionStatus {
    none = 'none',
    processing = 'processing',
    loaded = 'loaded',
}

enum ResponseCode {
    roomIsFree = 'room_is_free',
    roomPaymentRequired = 'room_payment_required'
}

export enum RoomType {
    audio = 0,
    video = 1,
    liveStream = 2,
    spatial = 3,
    vr = 4,
}

export enum ExperienceType {
    audio = 0,
    video = 1,
    liveStream = 2,
    spatial = 3,
    vr = 4,
}

export enum AgoraClientType {
    default = 0,
    presentation = 1,
}

export enum MediaTypeEnum {
    VIDEO = 'video',
    AUDIO = 'audio',
}

export const ENUM = {
    auth: AuthEnum,
    anonymousAuth: AnonymousAuthEnum,
    event: EventEnum,
    reaction: ReactionEnum,
    walletConnectionStatus: WalletConnectionStatus,
    storageKey: StorageKey,
    responseCode: ResponseCode,
    roomType: RoomType,
    agoraClientType: AgoraClientType,
    mediaType: MediaTypeEnum,
    experienceType: ExperienceType,
};


import React from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Loader from '../../component/loader';
import EnvironmentService from '../../services/enviroment';
import SceneService from '../../services/scene';
import AnimationService from '../../services/animation';
import ActionsMenu from './actions-menu';
import io from 'socket.io-client';

// styles
import styles from './styles.module.scss';
import { characterResources } from '../../resources/characters';
import AgoraService from '../../services/agora';
import CharactersService from '../../services/characters';

interface IUserProfile {
    userId?: string,
    characterName?: string,
}

// constants
const socket = io(
    process.env.REACT_APP_MODE === 'develop' ? 'http://localhost:8080' : 'https://3js-dev.moshwithme.io',
    { path: process.env.REACT_APP_MODE === 'develop' ? '' : '/api/socket.io' }
);


const Home = (): JSX.Element => {
    const [isMapReady, setIsMapReady] = React.useState<boolean>(false);
    const [animationProgress, setAnimationProgress] = React.useState<number>(0);
    const [characterProgress, setCharacterProgress] = React.useState<number>(0);
    const [isReady, setIsReady] = React.useState<boolean>(false);
    const [isShowMenu, setIsShowMenu] = React.useState<boolean>(false);
    const isShowMenuRef = React.useRef<boolean>(isShowMenu);
    const ref = React.useRef<HTMLDivElement>(null);
    const sceneServiceRef = React.useRef<SceneService>();
    const userProfileRef = React.useRef<IUserProfile>({});

    const generateCharacterName = (otherUsers: any[]): string => {
        const characterNameCount = characterResources.map(item => ({
            name: item.name,
            count: 0,
        }));

        otherUsers.forEach(item => {
            const characterNameCountItem = characterNameCount.find(ch => ch.name === item.characterName);
            if (characterNameCountItem) characterNameCountItem.count += 1;
        });

        return characterNameCount.sort((a, b) => {
            return a.count < b.count ? -1 : 1;
        })[0].name;
    };

    const randomizeCharacterName = (): string => {
        const availableNames: string[] = characterResources.map(item => item.name);
        return availableNames[Math.floor(Math.random() * (availableNames.length - 1))];
    };

    const handleSocketEvents = async (): Promise<void> => {
        return new Promise((resolve) => {
            handleOnUserDisconnect();
            handleOnReceiveCharacterData(() => {
                resolve();
            });
        });
    };

    const handleOnUserDisconnect = (): void => {
        socket.on('character-disconnected', data => {
            if (!data || !sceneServiceRef.current) return;
            const characterControl = sceneServiceRef.current.characterControls.find(item => item.userId === data.userId);
            if (characterControl) characterControl.destroy();
        });
    };

    const handleOnReceiveCharacterData = (firstTimeCallback: () => void): void => {
        if (!sceneServiceRef.current) return;

        let isUpdatingCharacters = false;
        socket.on('update-characters-data', async (data: any[]) => {
            if (isUpdatingCharacters || !sceneServiceRef.current || !userProfileRef.current.userId) return;

            const otherUsers = data.filter(item => item.userId !== userProfileRef.current.userId);
            if (!userProfileRef.current.characterName) {
                userProfileRef.current.characterName = generateCharacterName(otherUsers);
                firstTimeCallback();
            }

            isUpdatingCharacters = true;
            for (let i = 0; i < otherUsers.length; i++) await handleUpdateCharacterState(otherUsers[i]);
            isUpdatingCharacters = false;
        });

        socket.on('update-character-data', async (data: any) => {
            if (!userProfileRef.current.userId || data.userId === userProfileRef.current.userId) return;
            await handleUpdateCharacterState(data);
        });
    };

    const handleUpdateCharacterState = async (user: any): Promise<void> => {
        if (!sceneServiceRef.current) return;
        const characterControl = sceneServiceRef.current.characterControls.find(item => item.userId === user.userId);
        if (characterControl) {
            characterControl.setAttribute({
                velocity: new CANNON.Vec3(user.velocity.x, user.velocity.y, user.velocity.z),
                quaternion: new THREE.Quaternion(user.quaternion.x, user.quaternion.y, user.quaternion.z, user.quaternion.w),
                position: user.position && new CANNON.Vec3(user.position.x, user.position.y, user.position.z),
                state: user.state,
            });
        } else {
            await sceneServiceRef.current.loadCharacter({
                name: user.characterName,
                look: 0,
                position: new THREE.Vector3(user.position.x, user.position.y, user.position.z),
                userId: user.userId,
            });
        }
    };

    const handleKeyboardEvents = (): void => {
        if (sceneServiceRef.current) {
            sceneServiceRef.current.keyboardControl.onPressShift(() => {
                if (!isShowMenuRef.current) {
                    setIsShowMenu(true);
                    isShowMenuRef.current = true;
                }
            });
            sceneServiceRef.current.keyboardControl.onReleaseShift(() => {
                setIsShowMenu(false);
                isShowMenuRef.current = false;
            });
            sceneServiceRef.current.keyboardControl.onKeyDown(handleSendCharacterAttributesToServer);
            sceneServiceRef.current.keyboardControl.onKeyUp(handleSendCharacterAttributesToServer);
        }
    };

    const handleOnResourcesReady = async (): Promise<void> => {
        socket.emit('request-characters-data');
        return new Promise(resolve => {
            if (!ref.current) return;
            sceneServiceRef.current = new SceneService({ element: ref.current });
            userProfileRef.current.userId = `user-${+new Date()}`;
            handleSocketEvents().then(async () => {
                if (!sceneServiceRef.current || !userProfileRef.current.userId) return;
                socket.emit('joined', {
                    userId: userProfileRef.current.userId,
                    characterName: userProfileRef.current.characterName
                });
                await AgoraService.instance.join();
                await sceneServiceRef.current.loadCharacter({
                    name: userProfileRef.current.characterName || randomizeCharacterName(),
                    look: 0,
                    position: new THREE.Vector3(0, 50, 30),
                    isMyCharacter: true,
                    userId: userProfileRef.current.userId,
                });
                const myCharacterControl = sceneServiceRef.current.characterControls.find(item => item.isMyCharacter);
                if (myCharacterControl) {
                    myCharacterControl.onStartJumping = (): void => {
                        myCharacterControl.onUpdated = undefined;
                        emitCharacterAttributesToServer();
                    };
                    myCharacterControl.onEndJumping = emitCharacterAttributesToServer;
                    myCharacterControl.onLanding = emitCharacterAttributesToServer;
                }
                emitCharacterAttributesToServer(myCharacterControl?.getAttributes());
            });
            handleKeyboardEvents();
            resolve();
        });
    };

    const handleSendCharacterAttributesToServer = (): void => {
        if (!sceneServiceRef.current) return;
        const myCharacterControl = sceneServiceRef.current.characterControls.find(item => item.isMyCharacter);
        if (!myCharacterControl || !userProfileRef.current.userId) return;
        if (!myCharacterControl.onUpdated) {
            myCharacterControl.onUpdated = (attr): void => {
                emitCharacterAttributesToServer(attr);

                if (!sceneServiceRef.current?.keyboardControl.hasKeyPressed) {
                    myCharacterControl.onUpdated = undefined;
                    emitCharacterAttributesToServer();
                }
            };
        }
    };

    const emitCharacterAttributesToServer = (data?: any): void => {
        if (!sceneServiceRef.current) return;
        let attr = data;
        if (!attr) {
            const myCharacterControl = sceneServiceRef.current.characterControls.find(item => item.isMyCharacter);
            attr = myCharacterControl?.getAttributes();
        }
        if (attr) socket.emit('character-updated', {
            ...attr,
            userId: userProfileRef.current.userId,
        });
    };

    React.useEffect(() => {
        EnvironmentService.instance.load().then(() => {
            setIsMapReady(true);
            CharactersService.instance.load(percentage => {
                setCharacterProgress(percentage);
            }).then(() => {
                setCharacterProgress(100);
                AnimationService.instance.load(percentage => {
                    setAnimationProgress(percentage);
                }).then(() => {
                    setAnimationProgress(100);
                    handleOnResourcesReady().then(() => {
                        setIsReady(true);
                    });
                });
            });
        });

        return (): void => {
            sceneServiceRef.current?.clear();
        };
    }, []);

    const generateLoading = (): JSX.Element | undefined => {
        if (!isMapReady) return <Loader message="Loading resources" />;
        if (characterProgress < 100) return <Loader message={`Loading characters (${characterProgress}%)`} />;
        if (animationProgress < 100) return <Loader message={`Loading animations (${animationProgress}%)`} />;
        if (!isReady) return <Loader message="Initializing state" />;
    };

    return (
        <>
            {generateLoading()}
            <div className={`${styles.container} ${isReady ? styles.visible : ''}`}>
                <div className={styles.wrapper} ref={ref} />
                {
                    isShowMenu
                    &&
                    <ActionsMenu onSelect={(action): void => {
                        const characterControl = sceneServiceRef.current?.characterControls.find(item => item.isMyCharacter);
                        if (characterControl) {
                            characterControl.state.action = action.key;
                        }
                    }} />
                }
            </div>
        </>
    );
};

export default Home;
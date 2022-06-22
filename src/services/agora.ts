import axios from 'axios';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

interface IAgoraChannelInfo {
    channelName: string,
    channelToken: string,
    uid: string,
}

class AgoraService {
    private static inst?: AgoraService;
    private client?: IAgoraRTCClient;

    public static get instance(): AgoraService {
        if (!AgoraService.inst) AgoraService.inst = new AgoraService();
        return AgoraService.inst;
    }

    public join = async (): Promise<void> => {
        return new Promise(resolve => {
            const exec = async (): Promise<void> => {
                try {
                    const { channelName, channelToken, uid } = await this.getAgoraChannelInfo();

                    const appId = 'd9d24c830bcb4432a27f73398de0293f';
                    AgoraRTC.setLogLevel(4);
                    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                    await this.client.join(appId, channelName, channelToken, uid);

                    this.client.on('user-published', async (user, mediaType) => {
                        if (user.hasAudio) {
                            const audioTrack = await this.client?.subscribe(user, mediaType);
                            if (audioTrack) audioTrack.play();
                        }
                    });

                    this.client.on('user-unpublished', (user, mediaType) => {
                        this.client?.unsubscribe(user, mediaType);
                    });

                    const localAudioStream = await AgoraRTC.createMicrophoneAudioTrack();
                    await this.client.publish(localAudioStream);
                    resolve();
                } catch (e) {
                    resolve();
                }
            };

            exec();
        });
    }

    private getAnonymousUserAccessToken = async (): Promise<string> => {
        const res = await axios.post('https://rove-dev.moshwithme.io/api/v1/auth/anonymous-login', {
            source: 'threejs-testing'
        });
        return res.data.data.accessToken;
    }

    private getAgoraChannelInfo = async (): Promise<IAgoraChannelInfo> => {
        const accessToken = await this.getAnonymousUserAccessToken();

        const res = await axios.post('https://rove-dev.moshwithme.io/api/v1/rock/6225b239b95d4dd2ed068caa/join', {}, {
            headers: {
                'authorization': `Bearer ${accessToken}`,
            }
        });

        const channelName = res.data.data.rock.channelName;
        const { agoraToken, agoraUid } = res.data.data.userAgoras[0];

        return {
            channelName,
            channelToken: agoraToken,
            uid: agoraUid,
        };
    }
}

export default AgoraService;
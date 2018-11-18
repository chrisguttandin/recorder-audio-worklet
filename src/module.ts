import { IWorkerEvent } from 'broker-factory';
import { generateUniqueNumber } from 'fast-unique-numbers';
import {
    IAudioWorkletNode,
    IAudioWorkletNodeConstructor,
    INativeAudioWorkletNodeConstructor,
    TContext,
    TNativeAudioWorkletNode,
    TNativeContext
} from 'standardized-audio-context';
import { IWorkerErrorMessage, IWorkerResultMessage, isSupported } from 'worker-factory';
import { INativeRecorderAudioWorkletNode, IRecorderAudioWorkletNode } from './interfaces';
import { TAnyRecorderAudioWorkletNodeOptions, TState } from './types';
import { worklet } from './worklet/worklet';

export * from './interfaces';
export * from './types';

const blob = new Blob([ worklet ], { type: 'application/javascript; charset=utf-8' });

export const addRecorderAudioWorkletModule = async (addAudioWorkletModule: (url: string) => Promise<void>) => {
    const url = URL.createObjectURL(blob);

    await addAudioWorkletModule(url);

    URL.revokeObjectURL(url);
};

export function createRecorderAudioWorkletNode <T extends IAudioWorkletNodeConstructor | INativeAudioWorkletNodeConstructor> (
    audioWorkletNodeConstructor: T,
    context: T extends IAudioWorkletNodeConstructor ? TContext : TNativeContext,
    options: Partial<TAnyRecorderAudioWorkletNodeOptions<T>> = { }
): T extends IAudioWorkletNodeConstructor ? IRecorderAudioWorkletNode : INativeRecorderAudioWorkletNode {
    type TAnyAudioWorkletNode = T extends IAudioWorkletNodeConstructor ? IAudioWorkletNode : TNativeAudioWorkletNode;
    type TAnyRecorderAudioWorkletNode = T extends IAudioWorkletNodeConstructor ?
        IRecorderAudioWorkletNode :
        INativeRecorderAudioWorkletNode;

    const audioWorkletNode: TAnyAudioWorkletNode = new (<any> audioWorkletNodeConstructor)(context, 'recorder-audio-worklet-processor', {
        ...(<object> options),
        channelCountMode: 'explicit',
        numberOfInputs: 1,
        numberOfOutputs: 0
    });
    const ongoingRequests: Map<number, { reject: Function, resolve: Function }> = new Map();
    const listener = ({ data: message }: IWorkerEvent) => {
        const { id } = message;

        if (id !== null && ongoingRequests.has(id)) {
            const { reject, resolve } = <{ reject: Function, resolve: Function }> ongoingRequests.get(id);

            ongoingRequests.delete(id);

            if ((<IWorkerErrorMessage> message).error === undefined) {
                resolve((<IWorkerResultMessage> message).result);
            } else {
                reject(new Error((<IWorkerErrorMessage> message).error.message));
            }
        }
    };
    const postMessage = ((port) => {
        return (message: { method: string, params?: object }) => {
            return new Promise<void>((resolve, reject) => {
                const id = generateUniqueNumber(ongoingRequests);

                ongoingRequests.set(id, { reject, resolve });

                port.postMessage({ id, ...message });
            });
        };
    })(audioWorkletNode.port);
    const removeEventListener = ((port) => {
        port.addEventListener('message', listener);

        return () => port.removeEventListener('message', listener);
    })(audioWorkletNode.port);

    let state: TState = 'inactive';

    const changeState = (expectedState: TState, nextState: TState) => {
        if (state !== expectedState) {
            throw new Error(`Expected the state to be "${ expectedState }" but it was "${ state }".`);
        }

        state = nextState;
    };

    Object.defineProperties(audioWorkletNode, {
        port: {
            get (): TAnyRecorderAudioWorkletNode['port'] {
                throw new Error("The port of a RecorderAudioWorkletNode can't be accessed.");
            }
        },
        record: {
            get (): TAnyRecorderAudioWorkletNode['record'] {
                return async (encoderPort: MessagePort) => {
                    changeState('inactive', 'recording');

                    return postMessage({
                        method: 'record',
                        params: { encoderPort }
                    });
                };
            }
        },
        stop: {
            get (): TAnyRecorderAudioWorkletNode['stop'] {
                return async () => {
                    changeState('recording', 'stopped');

                    try {
                        await postMessage({ method: 'stop' });
                    } finally {
                        removeEventListener();
                    }
                };
            }
        }
    });

    return <TAnyRecorderAudioWorkletNode> audioWorkletNode;
}

export { isSupported };

import { generateUniqueNumber } from 'fast-unique-numbers';
import {
    IAudioWorkletNode,
    TAudioWorkletNodeConstructor,
    TContext,
    TNativeAudioWorkletNode,
    TNativeAudioWorkletNodeConstructor,
    TNativeContext
} from 'standardized-audio-context';
import { on } from 'subscribable-things';
import { isSupported } from 'worker-factory';
import { createListener } from './factories/listener';
import { validateState } from './functions/validate-state';
import { INativeRecorderAudioWorkletNode, IRecorderAudioWorkletNode } from './interfaces';
import { TAnyRecorderAudioWorkletNodeOptions, TState } from './types';
import { worklet } from './worklet/worklet';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const blob = new Blob([worklet], { type: 'application/javascript; charset=utf-8' });

export const addRecorderAudioWorkletModule = async (addAudioWorkletModule: (url: string) => Promise<void>) => {
    const url = URL.createObjectURL(blob);

    try {
        await addAudioWorkletModule(url);
    } finally {
        URL.revokeObjectURL(url);
    }
};

export function createRecorderAudioWorkletNode<T extends TContext | TNativeContext>(
    audioWorkletNodeConstructor: T extends TContext ? TAudioWorkletNodeConstructor : TNativeAudioWorkletNodeConstructor,
    context: T,
    options: Partial<TAnyRecorderAudioWorkletNodeOptions<T>> = {}
): T extends TContext ? IRecorderAudioWorkletNode<T> : INativeRecorderAudioWorkletNode {
    type TAnyAudioWorkletNode = T extends TContext ? IAudioWorkletNode<T> : TNativeAudioWorkletNode;
    type TAnyRecorderAudioWorkletNode = T extends TContext ? IRecorderAudioWorkletNode<T> : INativeRecorderAudioWorkletNode;

    const audioWorkletNode: TAnyAudioWorkletNode = new (<any>audioWorkletNodeConstructor)(context, 'recorder-audio-worklet-processor', {
        ...options,
        channelCountMode: 'explicit',
        numberOfInputs: 1,
        numberOfOutputs: 0
    });
    const ongoingRequests: Map<number, { reject: Function; resolve: Function }> = new Map();
    const postMessage = ((port) => {
        return (message: { method: string; params?: object }, transferables: Transferable[] = []): Promise<void> => {
            return new Promise((resolve, reject) => {
                const id = generateUniqueNumber(ongoingRequests);

                ongoingRequests.set(id, { reject, resolve });

                port.postMessage({ id, ...message }, transferables);
            });
        };
    })(audioWorkletNode.port);
    const removeEventListener = on(audioWorkletNode.port, 'message')(createListener(ongoingRequests));

    audioWorkletNode.port.start();

    let state: TState = 'inactive';

    Object.defineProperties(audioWorkletNode, {
        pause: {
            get(): TAnyRecorderAudioWorkletNode['pause'] {
                return () => {
                    validateState(['recording'], state);

                    state = 'paused';

                    return postMessage({
                        method: 'pause'
                    });
                };
            }
        },
        port: {
            get(): TAnyRecorderAudioWorkletNode['port'] {
                throw new Error("The port of a RecorderAudioWorkletNode can't be accessed.");
            }
        },
        record: {
            get(): TAnyRecorderAudioWorkletNode['record'] {
                return (encoderPort: MessagePort) => {
                    validateState(['inactive'], state);

                    state = 'recording';

                    return postMessage(
                        {
                            method: 'record',
                            params: { encoderPort }
                        },
                        [encoderPort]
                    );
                };
            }
        },
        resume: {
            get(): TAnyRecorderAudioWorkletNode['resume'] {
                return () => {
                    validateState(['paused'], state);

                    state = 'recording';

                    return postMessage({
                        method: 'resume'
                    });
                };
            }
        },
        stop: {
            get(): TAnyRecorderAudioWorkletNode['stop'] {
                return async () => {
                    validateState(['paused', 'recording'], state);

                    state = 'stopped';

                    try {
                        await postMessage({ method: 'stop' });
                    } finally {
                        removeEventListener();
                    }
                };
            }
        }
    });

    return <TAnyRecorderAudioWorkletNode>audioWorkletNode;
}

export { isSupported };

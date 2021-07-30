import type {
    IAudioWorkletNode,
    TAudioWorkletNodeConstructor,
    TContext,
    TNativeAudioWorkletNode,
    TNativeAudioWorkletNodeConstructor,
    TNativeContext
} from 'standardized-audio-context';
import type { on as onFunction } from 'subscribable-things';
import type { validateState as validateStateFunction } from '../functions/validate-state';
import { INativeRecorderAudioWorkletNode, IRecorderAudioWorkletNode } from '../interfaces';
import { TAnyRecorderAudioWorkletNodeOptions, TState } from '../types';
import type { createListener as createListenerFunction } from './listener';
import type { createPostMessageFactory } from './post-message-factory';

export const createRecorderAudioWorkletNodeFactory = (
    createListener: typeof createListenerFunction,
    createPostMessage: ReturnType<typeof createPostMessageFactory>,
    on: typeof onFunction,
    validateState: typeof validateStateFunction
) => {
    return <T extends TContext | TNativeContext>(
        audioWorkletNodeConstructor: T extends TContext ? TAudioWorkletNodeConstructor : TNativeAudioWorkletNodeConstructor,
        context: T,
        options: Partial<TAnyRecorderAudioWorkletNodeOptions<T>> = {}
    ): T extends TContext ? IRecorderAudioWorkletNode<T> : INativeRecorderAudioWorkletNode => {
        type TAnyAudioWorkletNode = T extends TContext ? IAudioWorkletNode<T> : TNativeAudioWorkletNode;
        type TAnyRecorderAudioWorkletNode = T extends TContext ? IRecorderAudioWorkletNode<T> : INativeRecorderAudioWorkletNode;

        const audioWorkletNode: TAnyAudioWorkletNode = new (<any>audioWorkletNodeConstructor)(context, 'recorder-audio-worklet-processor', {
            ...options,
            channelCountMode: 'explicit',
            numberOfInputs: 1,
            numberOfOutputs: 0
        });
        const ongoingRequests: Map<number, { reject: Function; resolve: Function }> = new Map();
        const postMessage = createPostMessage(ongoingRequests, audioWorkletNode.port);
        const unsubscribe = on(audioWorkletNode.port, 'message')(createListener(ongoingRequests));

        audioWorkletNode.port.start();

        let state: TState = 'inactive';

        Object.defineProperties(audioWorkletNode, {
            pause: {
                get(): TAnyRecorderAudioWorkletNode['pause'] {
                    return async () => {
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
                    return async (encoderPort: MessagePort) => {
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
                    return async () => {
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
                            unsubscribe();
                        }
                    };
                }
            }
        });

        return <TAnyRecorderAudioWorkletNode>audioWorkletNode;
    };
};

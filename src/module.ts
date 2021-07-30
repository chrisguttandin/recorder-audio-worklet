import { generateUniqueNumber } from 'fast-unique-numbers';
import { on } from 'subscribable-things';
import { isSupported } from 'worker-factory';
import { createAddRecorderAudioWorkletModule } from './factories/add-recorder-audio-worklet-module';
import { createListener } from './factories/listener';
import { createPostMessageFactory } from './factories/post-message-factory';
import { createRecorderAudioWorkletNodeFactory } from './factories/recorder-audio-worklet-node-factory';
import { validateState } from './functions/validate-state';
import { worklet } from './worklet/worklet';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

export const addRecorderAudioWorkletModule = createAddRecorderAudioWorkletModule(Blob, URL, worklet);

export const createRecorderAudioWorkletNode = createRecorderAudioWorkletNodeFactory(
    createListener,
    createPostMessageFactory(generateUniqueNumber),
    on,
    validateState
);

export { isSupported };

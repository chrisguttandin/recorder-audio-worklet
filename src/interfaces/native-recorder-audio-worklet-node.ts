import { TNativeAudioWorkletNode } from 'standardized-audio-context';

export interface INativeRecorderAudioWorkletNode extends TNativeAudioWorkletNode {

    record (encoderPort: MessagePort): Promise<void>;

    stop (): Promise<void>;

}

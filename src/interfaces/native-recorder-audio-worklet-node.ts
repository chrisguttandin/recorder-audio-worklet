import { TNativeAudioWorkletNode } from 'standardized-audio-context';

export interface INativeRecorderAudioWorkletNode extends TNativeAudioWorkletNode {
    pause(): Promise<void>;

    record(encoderPort: MessagePort): Promise<void>;

    resume(): Promise<void>;

    stop(): Promise<void>;
}

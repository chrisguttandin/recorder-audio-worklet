import { IAudioWorkletNode, TContext } from 'standardized-audio-context';

export interface IRecorderAudioWorkletNode<T extends TContext> extends IAudioWorkletNode<T> {
    pause(): Promise<void>;

    record(encoderPort: MessagePort): Promise<void>;

    resume(): Promise<void>;

    stop(): Promise<void>;
}

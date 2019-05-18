import { IAudioWorkletNode, IMinimalBaseAudioContext } from 'standardized-audio-context';

export interface IRecorderAudioWorkletNode<T extends IMinimalBaseAudioContext> extends IAudioWorkletNode<T> {

    record (encoderPort: MessagePort): Promise<void>;

    stop (): Promise<void>;

}

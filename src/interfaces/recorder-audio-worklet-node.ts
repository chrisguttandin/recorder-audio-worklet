import { IAudioWorkletNode, IMinimalBaseAudioContext } from 'standardized-audio-context';

export interface IRecorderAudioWorkletNode<T extends IMinimalBaseAudioContext> extends IAudioWorkletNode<T> {

    record (encoderPort: MessagePort): Promise<void>; // tslint:disable-line:invalid-void

    stop (): Promise<void>; // tslint:disable-line:invalid-void

}

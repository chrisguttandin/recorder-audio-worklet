import { IAudioWorkletNode, TContext } from 'standardized-audio-context';

export interface IRecorderAudioWorkletNode<T extends TContext> extends IAudioWorkletNode<T> {

    record (encoderPort: MessagePort): Promise<void>; // tslint:disable-line:invalid-void

    stop (): Promise<void>; // tslint:disable-line:invalid-void

}
